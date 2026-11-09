/*
 * Service worker: офлайн-режим.
 *
 * При установке скачивает в кэш все файлы приложения (страницу, стили, скрипты, картинки карточек).
 * После этого приложение открывается и работает без интернета.
 *
 * Версия берётся из адреса регистрации (sw.js?v=4) — это та же метка ?v=, что у файлов в index.html.
 * Поменяли ?v= в index.html → зарегистрируется новая версия, скачает свежие файлы в новый кэш
 * и удалит старый.
 */
'use strict';

var VERSION = new URL(self.location.href).searchParams.get('v') || '0';
var CACHE = 'emotion-cards-v' + VERSION;
var Q = '?v=' + VERSION;

// Список карточек (и их картинок) берём из того же файла, что и страница.
importScripts('js/cards-data.js' + Q);

var PRECACHE = [
  './',
  'index.html',
  'css/styles.css' + Q,
  'js/cards-data.js' + Q,
  'js/db.js' + Q,
  'js/drag.js' + Q,
  'js/app.js' + Q
].concat(
  self.EmotionCards.CARDS
    .filter(function (c) { return c.image; })
    .map(function (c) { return c.image; })
);

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // cache: 'reload' — мимо HTTP-кэша браузера, чтобы не положить в офлайн-кэш устаревший файл
      return cache.addAll(PRECACHE.map(function (url) { return new Request(url, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf('emotion-cards-') === 0 && key !== CACHE) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Сеть с ограничением по времени: при плохом соединении не ждём бесконечно.
function fetchWithTimeout(request, ms) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error('timeout')); }, ms);
    fetch(request).then(function (r) { clearTimeout(timer); resolve(r); },
                        function (e) { clearTimeout(timer); reject(e); });
  });
}

function putInCache(request, response) {
  if (response && response.ok && response.type === 'basic') {
    var copy = response.clone();
    caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
  }
  return response;
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Страница: сначала сеть (чтобы получать обновления), без сети — из кэша.
    event.respondWith(
      fetchWithTimeout(req, 4000)
        .then(function (res) { return putInCache('index.html', res); })
        .catch(function () {
          return caches.match('index.html', { cacheName: CACHE })
            .then(function (hit) { return hit || caches.match('index.html'); });
        })
    );
    return;
  }

  // Стили, скрипты, картинки: сначала кэш (они версионированы через ?v=), иначе сеть.
  event.respondWith(
    caches.match(req, { cacheName: CACHE }).then(function (hit) {
      return hit || fetch(req).then(function (res) { return putInCache(req, res); });
    })
  );
});
