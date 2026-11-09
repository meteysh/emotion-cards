/*
 * Набор карточек.
 *
 * Чтобы добавить карточку — положите картинку в images/cards/ и допишите объект в массив CARDS.
 *   id          — уникальный и неизменный идентификатор (по нему хранятся сохранения).
 *   word        — слово-эмоция.
 *   color       — основной цвет карточки (верхняя и нижняя полосы, экспорт в CSV).
 *   labelColor  — (необязательно) цвет средней полосы со словом; по умолчанию — светлее color.
 *   image       — путь к иллюстрации (верхняя часть карточки, без полосы со словом).
 *                 Если не указан, рисуется встроенная SVG-иллюстрация по параметрам face:
 *     face.mouth: -1 (грустный) … 1 (улыбка), 'o' — открытый рот, 'flat' — прямая, 'wave' — волнистый
 *     face.brows: -1 (сведены, злость) … 1 (подняты, грусть/удивление), 0 — ровно
 *     face.eyes:  'open' | 'wide' | 'closed' | 'half' | 'side'
 *
 * Иллюстрации вырезаны из фотографий карточек колоды «Колода эмоций».
 */
(function () {
  'use strict';

  var CARDS = [
    { id: 'boredom',    word: 'Скука',     color: '#934890', labelColor: '#C791C3', image: 'images/cards/boredom.jpg' },
    { id: 'grief',      word: 'Горе',      color: '#30BBF5', labelColor: '#7FDCFD', image: 'images/cards/grief.jpg' },
    { id: 'aggression', word: 'Агрессия',  color: '#FEE7E1', labelColor: '#FEC1B5', image: 'images/cards/aggression.jpg' },
    { id: 'horror',     word: 'Ужас',      color: '#A1D301', labelColor: '#C0E249', image: 'images/cards/horror.jpg' },
    { id: 'joy',        word: 'Радость',   color: '#FAEA00', labelColor: '#FAF26B', image: 'images/cards/joy.jpg' },
    { id: 'anger',      word: 'Гнев',      color: '#E9005E', labelColor: '#EF6297', image: 'images/cards/anger.jpg' },
    { id: 'surprise',   word: 'Удивление', color: '#49B34D', labelColor: '#78C77B', image: 'images/cards/surprise.jpg' },
    { id: 'remorse',    word: 'Раскаяние', color: '#CFE6FA', labelColor: '#ACBAE3', image: 'images/cards/remorse.jpg' },
    { id: 'amazement',  word: 'Изумление', color: '#44BA4F', labelColor: '#75CF8B', image: 'images/cards/amazement.jpg' },
    { id: 'acceptance', word: 'Принятие',  color: '#D4E201', labelColor: '#E2ED48', image: 'images/cards/acceptance.jpg' }
  ];

  /* ---------- Встроенная SVG-иллюстрация ---------- */

  function mouthPath(m) {
    if (m === 'o') return '<ellipse cx="50" cy="68" rx="7" ry="9" fill="#3b2a20"/>';
    if (m === 'flat') return '<path d="M36 68 L64 68" />';
    if (m === 'wave') return '<path d="M34 69 Q40 63 46 69 T58 69 T66 67" />';
    var curve = 12 * m; // >0 улыбка, <0 грусть
    return '<path d="M34 ' + (66 - curve / 3) + ' Q50 ' + (66 + curve) + ' 66 ' + (66 - curve / 3) + '" />';
  }

  function eyesPath(e) {
    switch (e) {
      case 'wide':
        return '<circle cx="38" cy="45" r="6" fill="#fff" stroke="#3b2a20" stroke-width="2"/>' +
               '<circle cx="62" cy="45" r="6" fill="#fff" stroke="#3b2a20" stroke-width="2"/>' +
               '<circle cx="38" cy="45" r="2.5" fill="#3b2a20"/><circle cx="62" cy="45" r="2.5" fill="#3b2a20"/>';
      case 'closed':
        return '<path d="M32 46 Q38 50 44 46" /><path d="M56 46 Q62 50 68 46" />';
      case 'half':
        return '<path d="M32 46 L44 46" /><path d="M56 46 L68 46" />' +
               '<path d="M34 46 Q38 50 42 46" fill="#3b2a20"/><path d="M58 46 Q62 50 66 46" fill="#3b2a20"/>';
      case 'side':
        return '<circle cx="35" cy="47" r="3.2" fill="#3b2a20" stroke="none"/>' +
               '<circle cx="59" cy="47" r="3.2" fill="#3b2a20" stroke="none"/>';
      default:
        return '<circle cx="38" cy="46" r="3.5" fill="#3b2a20" stroke="none"/>' +
               '<circle cx="62" cy="46" r="3.5" fill="#3b2a20" stroke="none"/>';
    }
  }

  function browsPath(b) {
    // b>0: внутренние концы подняты (грусть), b<0: сведены вниз (злость)
    var inner = 34 - 6 * b, outer = 34 + 2 * b;
    return '<path d="M30 ' + outer + ' L44 ' + inner + '" /><path d="M56 ' + inner + ' L70 ' + outer + '" />';
  }

  function makeSvg(card) {
    var f = card.face || { mouth: 0, brows: 0, eyes: 'open' };
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="52" r="38" fill="#fff8e7" stroke="#3b2a20" stroke-width="2.5"/>' +
      '<g fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      browsPath(f.brows || 0) + eyesPath(f.eyes) + mouthPath(f.mouth) +
      '</g></svg>';
  }

  // self — это window на странице и глобальный объект в service worker (sw.js тоже читает этот файл).
  self.EmotionCards = {
    CARDS: CARDS,
    makeSvg: makeSvg
  };
})();
