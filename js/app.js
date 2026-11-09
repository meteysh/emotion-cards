(function () {
  'use strict';

  var DB = window.EmotionDB;

  var deckEl = document.getElementById('deck');
  var boardEl = document.getElementById('board');
  var historyEl = document.getElementById('history');
  var deckCountEl = document.getElementById('deck-count');
  var boardCountEl = document.getElementById('board-count');
  var storageInfoEl = document.getElementById('storage-info');
  var toastEl = document.getElementById('toast');
  var boardEmptyEl = boardEl.querySelector('.board-empty');

  var cards = [];          // все карточки в исходном порядке
  var byId = {};
  var imageUrls = {};      // id -> objectURL картинки
  var board = [];          // id выбранных карточек в выбранном порядке
  var saves = [];

  var indicator = document.createElement('div');
  indicator.className = 'drop-indicator';

  /* ---------- Утилиты ---------- */

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function formatTime(d) {
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  var toastTimer;
  function toast(msg, isError) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('error', !!isError);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function isTaken(id) { return board.indexOf(id) !== -1; }

  /* ---------- Отрисовка ---------- */

  function cardNode(card, where, position) {
    var el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = card.id;
    el.dataset.where = where;
    el.style.setProperty('--card-bg', card.color);
    if (card.labelColor) el.style.setProperty('--card-label', card.labelColor);
    el.setAttribute('role', 'listitem');
    el.tabIndex = 0;

    var img = document.createElement('img');
    img.src = imageUrls[card.id];
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);

    var word = document.createElement('span');
    word.className = 'card-word';
    word.textContent = card.word;
    el.appendChild(word);

    if (where === 'board') {
      var num = document.createElement('span');
      num.className = 'card-pos';
      num.textContent = position + 1;
      el.appendChild(num);

      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'card-remove';
      close.title = 'Вернуть в список';
      close.setAttribute('aria-label', 'Вернуть «' + card.word + '» в список');
      el.appendChild(close);
      el.setAttribute('aria-label', (position + 1) + '. ' + card.word +
        '. Стрелки влево/вправо — переместить, Delete — вернуть в список');
    } else if (isTaken(card.id)) {
      el.classList.add('taken');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('aria-label', card.word + ' — уже выбрана');
      el.tabIndex = -1;
    } else {
      el.setAttribute('aria-label', card.word + '. Enter — добавить в выбранные');
    }
    return el;
  }

  function renderDeck() {
    var frag = document.createDocumentFragment();
    cards.forEach(function (c) { frag.appendChild(cardNode(c, 'deck')); });
    deckEl.replaceChildren(frag);
    deckCountEl.textContent = 'доступно ' + (cards.length - board.length) + ' из ' + cards.length;
  }

  function renderBoard() {
    var frag = document.createDocumentFragment();
    frag.appendChild(boardEmptyEl);
    board.forEach(function (id, i) {
      if (byId[id]) frag.appendChild(cardNode(byId[id], 'board', i));
    });
    boardEl.replaceChildren(frag);
    boardEl.classList.toggle('empty', board.length === 0);
    boardCountEl.textContent = board.length ? board.length + ' шт.' : '';
  }

  function render() {
    renderDeck();
    renderBoard();
  }

  function renderHistory() {
    historyEl.replaceChildren();
    if (!saves.length) {
      var empty = document.createElement('li');
      empty.className = 'history-empty muted';
      empty.textContent = 'Пока нет сохранений.';
      historyEl.appendChild(empty);
      return;
    }
    saves.slice().reverse().forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'history-item';

      var head = document.createElement('div');
      head.className = 'history-head';
      var when = document.createElement('strong');
      var d = new Date(s.savedAt);
      when.textContent = formatDate(d) + ' ' + formatTime(d);
      head.appendChild(when);

      var meta = document.createElement('span');
      meta.className = 'muted';
      meta.textContent = '#' + s.id + ' · ' + s.cards.length + ' карт.';
      head.appendChild(meta);

      var load = document.createElement('button');
      load.type = 'button';
      load.className = 'btn small';
      load.textContent = 'Открыть';
      load.title = 'Разложить эти карточки снова';
      load.addEventListener('click', function () { loadSave(s); });
      head.appendChild(load);

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn small ghost';
      del.textContent = 'Удалить';
      del.addEventListener('click', function () { removeSave(s); });
      head.appendChild(del);

      li.appendChild(head);

      var chips = document.createElement('div');
      chips.className = 'chips';
      s.cards.forEach(function (c) {
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.style.setProperty('--card-bg', c.color);
        chip.textContent = c.position + '. ' + c.word;
        chips.appendChild(chip);
      });
      li.appendChild(chips);
      historyEl.appendChild(li);
    });
  }

  function updateStorageInfo() {
    DB.estimate().then(function (est) {
      if (!est || !est.quota) { storageInfoEl.textContent = ''; return; }
      var mb = function (b) { return (b / 1048576).toFixed(1); };
      var quota = est.quota / 1048576;
      var quotaStr = quota > 10240 ? (quota / 1024).toFixed(0) + ' ГБ' : quota.toFixed(0) + ' МБ';
      storageInfoEl.textContent = 'хранилище: ' + mb(est.usage || 0) + ' МБ из ~' + quotaStr;
    });
  }

  /* ---------- Изменение раскладки ---------- */

  function persistDraft() {
    DB.setState('board', board.slice()).catch(function (e) { console.warn(e); });
  }

  function commit() {
    render();
    persistDraft();
  }

  function addToBoard(id, index) {
    if (!byId[id] || isTaken(id)) return;
    if (index === undefined || index > board.length) index = board.length;
    board.splice(index, 0, id);
    commit();
  }

  function moveOnBoard(id, index) {
    var from = board.indexOf(id);
    if (from === -1) return;
    board.splice(from, 1);
    board.splice(Math.min(index, board.length), 0, id);
    commit();
  }

  function returnToDeck(id) {
    var i = board.indexOf(id);
    if (i === -1) return;
    board.splice(i, 1);
    commit();
  }

  function focusCard(zone, id) {
    var el = zone.querySelector('.card[data-id="' + id + '"]');
    if (el) el.focus();
  }

  /* ---------- Перетаскивание ---------- */

  // Индекс вставки в board (без учёта перетаскиваемой карточки) по координатам указателя.
  function boardInsertIndex(x, y) {
    var items = Array.prototype.filter.call(
      boardEl.querySelectorAll('.card'),
      function (el) { return !el.classList.contains('is-dragging'); }
    );
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (y < r.top) return { index: i, items: items };
      if (y <= r.bottom && x < r.left + r.width / 2) return { index: i, items: items };
    }
    return { index: items.length, items: items };
  }

  function showIndicator(x, y) {
    var res = boardInsertIndex(x, y);
    var items = res.items;
    var boardRect = boardEl.getBoundingClientRect();
    var ref, left, top, height;
    if (!items.length) { hideIndicator(); return; }
    if (res.index < items.length) {
      ref = items[res.index].getBoundingClientRect();
      left = ref.left - 6;
    } else {
      ref = items[items.length - 1].getBoundingClientRect();
      left = ref.right + 4;
    }
    top = ref.top;
    height = ref.height;
    indicator.style.left = (left - boardRect.left + boardEl.scrollLeft) + 'px';
    indicator.style.top = (top - boardRect.top + boardEl.scrollTop) + 'px';
    indicator.style.height = height + 'px';
    if (indicator.parentNode !== boardEl) boardEl.appendChild(indicator);
  }

  function hideIndicator() {
    if (indicator.parentNode) indicator.parentNode.removeChild(indicator);
  }

  function clearHighlights() {
    deckEl.classList.remove('drop-target');
    boardEl.classList.remove('drop-target');
    hideIndicator();
  }

  new window.DragManager({
    root: document.querySelector('.layout'),
    itemSelector: '.card[data-id]',
    canDrag: function (el) { return !el.classList.contains('taken'); },
    // Прокручиваем только поле выбранных (для расстановки), иначе по пути к нему
    // на телефоне сдвигался бы сам список.
    canAutoScroll: function (zone) { return zone === boardEl; },
    onOver: function (info) {
      var from = info.el.dataset.where;
      var zone = info.zone ? info.zone.dataset.zone : null;
      deckEl.classList.toggle('drop-target', zone === 'deck' && from === 'board');
      boardEl.classList.toggle('drop-target', zone === 'board');
      if (zone === 'board') showIndicator(info.x, info.y); else hideIndicator();
    },
    onDrop: function (info) {
      var id = info.el.dataset.id;
      var from = info.el.dataset.where;
      var zone = info.zone ? info.zone.dataset.zone : null;
      var index = zone === 'board' ? boardInsertIndex(info.x, info.y).index : -1;
      clearHighlights();
      if (zone === 'board') {
        if (from === 'deck') addToBoard(id, index);
        else moveOnBoard(id, index);
      } else if (zone === 'deck' && from === 'board') {
        returnToDeck(id);
      }
    },
    onCancel: clearHighlights
  });

  /* ---------- Клик / клавиатура (альтернатива перетаскиванию) ---------- */

  deckEl.addEventListener('dblclick', function (e) {
    var el = e.target.closest('.card');
    if (el && !el.classList.contains('taken')) addToBoard(el.dataset.id);
  });

  deckEl.addEventListener('keydown', function (e) {
    var el = e.target.closest('.card');
    if (!el || el.classList.contains('taken')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var next = el.nextElementSibling;
      while (next && next.classList.contains('taken')) next = next.nextElementSibling;
      var nextId = next && next.dataset.id;
      addToBoard(el.dataset.id);
      if (nextId) focusCard(deckEl, nextId);
    }
  });

  boardEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.card-remove');
    if (!btn) return;
    returnToDeck(btn.closest('.card').dataset.id);
  });

  boardEl.addEventListener('keydown', function (e) {
    var el = e.target.closest('.card');
    if (!el) return;
    var id = el.dataset.id;
    var i = board.indexOf(id);
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      returnToDeck(id);
      var nextId = board[Math.min(i, board.length - 1)];
      if (nextId) focusCard(boardEl, nextId);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (i > 0) { moveOnBoard(id, i - 1); focusCard(boardEl, id); }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (i < board.length - 1) { moveOnBoard(id, i + 1); focusCard(boardEl, id); }
    }
  });

  /* ---------- Кнопки ---------- */

  function save() {
    if (!board.length) { toast('Сначала выберите хотя бы одну карточку', true); return; }
    var now = new Date();
    var record = {
      savedAt: now.toISOString(),
      timezoneOffsetMin: -now.getTimezoneOffset(),
      cards: board.map(function (id, i) {
        var c = byId[id];
        return { position: i + 1, id: c.id, word: c.word, color: c.color };
      })
    };
    DB.requestPersistence();
    DB.addSave(record).then(function (id) {
      record.id = id;
      saves.push(record);
      renderHistory();
      updateStorageInfo();
      toast('Сохранено: ' + formatDate(now) + ' ' + formatTime(now));
    }).catch(function (e) {
      console.error(e);
      toast('Не удалось сохранить: ' + (e && e.message || e), true);
    });
  }

  function reset() {
    if (!board.length) return;
    board = [];
    commit();
    toast('Все карточки возвращены в список');
  }

  function loadSave(s) {
    board = s.cards.map(function (c) { return c.id; })
                   .filter(function (id, i, arr) { return byId[id] && arr.indexOf(id) === i; });
    commit();
    toast('Раскладка #' + s.id + ' открыта');
  }

  function removeSave(s) {
    if (!confirm('Удалить сохранение #' + s.id + '?')) return;
    DB.deleteSave(s.id).then(function () {
      saves = saves.filter(function (x) { return x.id !== s.id; });
      renderHistory();
      updateStorageInfo();
    });
  }

  function csvCell(v) {
    var s = v === null || v === undefined ? '' : String(v);
    return /[";\n\r,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCsv() {
    if (!saves.length) { toast('Нет сохранений для экспорта', true); return; }
    var SEP = ';'; // так файл корректно открывается в Excel с русской локалью
    var rows = [['save_id', 'saved_at_iso', 'date', 'time', 'cards_total', 'position', 'card_id', 'emotion', 'color']];
    saves.forEach(function (s) {
      var d = new Date(s.savedAt);
      s.cards.forEach(function (c) {
        rows.push([s.id, s.savedAt, formatDate(d), formatTime(d), s.cards.length, c.position, c.id, c.word, c.color]);
      });
    });
    var csv = rows.map(function (r) { return r.map(csvCell).join(SEP); }).join('\r\n');
    // BOM — чтобы Excel распознал UTF-8 и кириллица не превратилась в «кракозябры».
    download('emotion-cards-' + formatDate(new Date()) + '.csv', '﻿' + csv, 'text/csv;charset=utf-8');
  }

  function exportJson() {
    if (!saves.length) { toast('Нет сохранений для экспорта', true); return; }
    var data = { exportedAt: new Date().toISOString(), saves: saves };
    download('emotion-cards-' + formatDate(new Date()) + '.json', JSON.stringify(data, null, 2), 'application/json');
  }

  document.getElementById('btn-save').addEventListener('click', save);
  document.getElementById('btn-reset').addEventListener('click', reset);
  document.getElementById('btn-csv').addEventListener('click', exportCsv);
  document.getElementById('btn-json').addEventListener('click', exportJson);

  /* ---------- Старт ---------- */

  DB.syncCards(window.EmotionCards.CARDS).then(function (list) {
    cards = list;
    cards.forEach(function (c) {
      byId[c.id] = c;
      imageUrls[c.id] = c.image ? URL.createObjectURL(c.image) : c.imageSrc;
    });
    return Promise.all([DB.getState('board'), DB.listSaves()]);
  }).then(function (res) {
    var draft = res[0];
    saves = res[1];
    if (Array.isArray(draft)) {
      board = draft.filter(function (id, i, arr) { return byId[id] && arr.indexOf(id) === i; });
    }
    render();
    renderHistory();
    updateStorageInfo();
  }).catch(function (e) {
    console.error(e);
    toast('Ошибка хранилища: ' + (e && e.message || e), true);
  });
})();
