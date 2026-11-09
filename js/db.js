/*
 * Хранилище на IndexedDB.
 *
 * Сторы:
 *   cards  — карточки вместе с картинками (Blob). Картинки хранятся в базе,
 *            поэтому объём может вырасти до сотен мегабайт — для IndexedDB это норма.
 *   saves  — сохранения: { id, savedAt (ISO), savedAtLocal, cards: [{position, id, word, color}] }
 *   state  — служебное: текущая (несохранённая) раскладка, чтобы не терять её при перезагрузке.
 */
(function () {
  'use strict';

  var DB_NAME = 'emotion-cards';
  var DB_VERSION = 1;
  var dbPromise = null;

  function reqToPromise(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function txDone(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(); };
      tx.onabort = tx.onerror = function () { reject(tx.error || new Error('Transaction aborted')); };
    });
  }

  function open() {
    if (dbPromise) return dbPromise;
    if (!('indexedDB' in window)) {
      return Promise.reject(new Error('Браузер не поддерживает IndexedDB'));
    }
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('cards')) {
          db.createObjectStore('cards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('saves')) {
          var saves = db.createObjectStore('saves', { keyPath: 'id', autoIncrement: true });
          saves.createIndex('savedAt', 'savedAt');
        }
        if (!db.objectStoreNames.contains('state')) {
          db.createObjectStore('state', { keyPath: 'key' });
        }
      };
      req.onsuccess = function () {
        var db = req.result;
        db.onversionchange = function () { db.close(); };
        resolve(db);
      };
      req.onerror = function () { reject(req.error); };
      req.onblocked = function () { reject(new Error('База открыта в другой вкладке со старой версией')); };
    });
    return dbPromise;
  }

  function store(name, mode) {
    return open().then(function (db) {
      var tx = db.transaction(name, mode);
      return { tx: tx, os: tx.objectStore(name) };
    });
  }

  function getAll(name) {
    return store(name, 'readonly').then(function (s) { return reqToPromise(s.os.getAll()); });
  }

  /* ---------- Карточки ---------- */

  function sourceSignature(card) {
    return JSON.stringify([card.word, card.color, card.image || null, card.face || null]);
  }

  function loadImageBlob(card) {
    var svgBlob = function () {
      return new Blob([window.EmotionCards.makeSvg(card)], { type: 'image/svg+xml' });
    };
    if (!card.image) return Promise.resolve(svgBlob());
    return fetch(card.image)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .catch(function () { return svgBlob(); }); // file:// или файла нет — встроенная картинка
  }

  /**
   * Синхронизирует карточки из cards-data.js с базой:
   * добавляет новые, обновляет изменённые (картинка перегенерируется только при изменении карточки).
   */
  function syncCards(defs) {
    return getAll('cards').then(function (existing) {
      var byId = {};
      existing.forEach(function (c) { byId[c.id] = c; });

      var jobs = defs.map(function (def, index) {
        var cur = byId[def.id];
        var sig = sourceSignature(def);
        if (cur && cur.signature === sig && cur.order === index) return null;
        var blobP = (cur && cur.signature === sig) ? Promise.resolve(cur.image) : loadImageBlob(def);
        return blobP.then(function (blob) {
          return {
            id: def.id,
            word: def.word,
            color: def.color,
            order: index,
            image: blob,
            signature: sig
          };
        });
      }).filter(Boolean);

      return Promise.all(jobs);
    }).then(function (toPut) {
      if (!toPut.length) return;
      return store('cards', 'readwrite').then(function (s) {
        toPut.forEach(function (c) { s.os.put(c); });
        return txDone(s.tx);
      });
    }).then(function () {
      return getAll('cards');
    }).then(function (all) {
      var known = {};
      defs.forEach(function (d) { known[d.id] = true; });
      return all.filter(function (c) { return known[c.id]; })
                .sort(function (a, b) { return a.order - b.order; });
    });
  }

  /* ---------- Сохранения ---------- */

  function addSave(record) {
    return store('saves', 'readwrite').then(function (s) {
      var p = reqToPromise(s.os.add(record));
      return txDone(s.tx).then(function () { return p; });
    });
  }

  function listSaves() {
    return getAll('saves').then(function (all) {
      return all.sort(function (a, b) { return a.id - b.id; });
    });
  }

  function deleteSave(id) {
    return store('saves', 'readwrite').then(function (s) {
      s.os.delete(id);
      return txDone(s.tx);
    });
  }

  /* ---------- Служебное состояние ---------- */

  function getState(key) {
    return store('state', 'readonly').then(function (s) {
      return reqToPromise(s.os.get(key));
    }).then(function (row) { return row ? row.value : undefined; });
  }

  function setState(key, value) {
    return store('state', 'readwrite').then(function (s) {
      s.os.put({ key: key, value: value });
      return txDone(s.tx);
    });
  }

  /* ---------- Квота ---------- */

  function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      return navigator.storage.persisted().then(function (already) {
        return already || navigator.storage.persist();
      }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  function estimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().catch(function () { return null; });
    }
    return Promise.resolve(null);
  }

  window.EmotionDB = {
    open: open,
    syncCards: syncCards,
    addSave: addSave,
    listSaves: listSaves,
    deleteSave: deleteSave,
    getState: getState,
    setState: setState,
    requestPersistence: requestPersistence,
    estimate: estimate
  };
})();
