/*
 * Положение ленты карточек: сверху (горизонтально) или слева (вертикально).
 *
 * По умолчанию зависит от положения экрана:
 *   горизонтальное (ПК, планшет/телефон «лёжа») → лента сверху;
 *   вертикальное  (планшет/телефон «стоя»)      → лента слева.
 * Кнопкой в шапке можно поменять. Выбор запоминается отдельно для каждого положения экрана,
 * так что при повороте устройства лента встаёт так, как пользователь выбрал для этого положения.
 *
 * Подключается в <head>, чтобы атрибут data-strip был выставлен до первой отрисовки.
 */
(function () {
  'use strict';

  var KEY = 'emotion-cards:strip';
  var portraitMq = window.matchMedia('(orientation: portrait)');
  var listeners = [];

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function savePrefs(prefs) {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* приватный режим — просто не запоминаем */ }
  }

  var prefs = loadPrefs();

  function orientation() { return portraitMq.matches ? 'portrait' : 'landscape'; }
  function auto() { return portraitMq.matches ? 'left' : 'top'; }
  function current() { return prefs[orientation()] || auto(); }

  function apply() {
    var mode = current();
    document.documentElement.setAttribute('data-strip', mode);
    listeners.forEach(function (fn) { fn(mode); });
  }

  function toggle() {
    var next = current() === 'top' ? 'left' : 'top';
    if (next === auto()) delete prefs[orientation()]; // совпадает с автоматическим — не храним
    else prefs[orientation()] = next;
    savePrefs(prefs);
    apply();
  }

  if (portraitMq.addEventListener) portraitMq.addEventListener('change', apply);
  else portraitMq.addListener(apply); // старый Safari

  window.StripLayout = {
    current: current,
    toggle: toggle,
    onChange: function (fn) { listeners.push(fn); fn(current()); }
  };

  apply();
})();
