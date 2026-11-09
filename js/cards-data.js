/*
 * Набор карточек.
 *
 * Чтобы добавить карточку — допишите объект в массив CARDS.
 *   id     — уникальный и неизменный идентификатор (по нему хранятся сохранения).
 *   word   — слово-эмоция.
 *   color  — фоновый цвет карточки.
 *   image  — (необязательно) путь к картинке, например 'images/joy.png'.
 *            Если не указан, рисуется встроенная SVG-иллюстрация по параметрам face.
 *   face   — параметры встроенной иллюстрации:
 *            mouth: -1 (грустный) … 1 (улыбка), 'o' — открытый рот, 'flat' — прямая линия, 'wave' — волнистый
 *            brows: -1 (сведены, злость) … 1 (подняты, грусть/удивление), 0 — ровно
 *            eyes:  'open' | 'wide' | 'closed' | 'half' | 'side'
 */
(function () {
  'use strict';

  var CARDS = [
    { id: 'joy',          word: 'Радость',        color: '#FFD54F', face: { mouth: 1,      brows: 0.3,  eyes: 'open' } },
    { id: 'sadness',      word: 'Грусть',         color: '#90CAF9', face: { mouth: -0.8,   brows: 1,    eyes: 'half' } },
    { id: 'anxiety',      word: 'Тревога',        color: '#CE93D8', face: { mouth: 'wave', brows: 0.8,  eyes: 'wide' } },
    { id: 'rage',         word: 'Ярость',         color: '#E53935', face: { mouth: -1,     brows: -1,   eyes: 'open' } },
    { id: 'fear',         word: 'Страх',          color: '#B0BEC5', face: { mouth: 'o',    brows: 1,    eyes: 'wide' } },
    { id: 'surprise',     word: 'Удивление',      color: '#FFF176', face: { mouth: 'o',    brows: 0.9,  eyes: 'wide' } },
    { id: 'disgust',      word: 'Отвращение',     color: '#AED581', face: { mouth: 'wave', brows: -0.6, eyes: 'half' } },
    { id: 'shame',        word: 'Стыд',           color: '#F48FB1', face: { mouth: -0.4,   brows: 0.6,  eyes: 'side' } },
    { id: 'guilt',        word: 'Вина',           color: '#BCAAA4', face: { mouth: -0.5,   brows: 0.8,  eyes: 'half' } },
    { id: 'pride',        word: 'Гордость',       color: '#FFB74D', face: { mouth: 0.6,    brows: -0.2, eyes: 'closed' } },
    { id: 'tenderness',   word: 'Нежность',       color: '#F8BBD0', face: { mouth: 0.6,    brows: 0.4,  eyes: 'closed' } },
    { id: 'calm',         word: 'Спокойствие',    color: '#80CBC4', face: { mouth: 0.3,    brows: 0,    eyes: 'closed' } },
    { id: 'boredom',      word: 'Скука',          color: '#CFD8DC', face: { mouth: 'flat', brows: 0,    eyes: 'half' } },
    { id: 'envy',         word: 'Зависть',        color: '#9CCC65', face: { mouth: -0.3,   brows: -0.5, eyes: 'side' } },
    { id: 'jealousy',     word: 'Ревность',       color: '#7CB342', face: { mouth: -0.6,   brows: -0.8, eyes: 'side' } },
    { id: 'resentment',   word: 'Обида',          color: '#9FA8DA', face: { mouth: -0.7,   brows: 0.5,  eyes: 'side' } },
    { id: 'disappoint',   word: 'Разочарование',  color: '#A1887F', face: { mouth: -0.6,   brows: 0.7,  eyes: 'half' } },
    { id: 'hope',         word: 'Надежда',        color: '#B2EBF2', face: { mouth: 0.4,    brows: 0.6,  eyes: 'open' } },
    { id: 'gratitude',    word: 'Благодарность',  color: '#FFE082', face: { mouth: 0.8,    brows: 0.4,  eyes: 'closed' } },
    { id: 'delight',      word: 'Восторг',        color: '#FF8A65', face: { mouth: 'o',    brows: 0.6,  eyes: 'closed' } },
    { id: 'loneliness',   word: 'Одиночество',    color: '#7986CB', face: { mouth: -0.5,   brows: 0.6,  eyes: 'side' } },
    { id: 'confusion',    word: 'Растерянность',  color: '#E1BEE7', face: { mouth: 'wave', brows: 0.5,  eyes: 'open' } },
    { id: 'irritation',   word: 'Раздражение',    color: '#FF7043', face: { mouth: 'flat', brows: -0.8, eyes: 'half' } },
    { id: 'apathy',       word: 'Апатия',         color: '#BDBDBD', face: { mouth: 'flat', brows: 0,    eyes: 'closed' } },
    { id: 'curiosity',    word: 'Любопытство',    color: '#4FC3F7', face: { mouth: 0.3,    brows: 0.7,  eyes: 'wide' } },
    { id: 'embarrass',    word: 'Смущение',       color: '#F06292', face: { mouth: 0.2,    brows: 0.6,  eyes: 'side' } },
    { id: 'relief',       word: 'Облегчение',     color: '#A5D6A7', face: { mouth: 0.5,    brows: 0.5,  eyes: 'closed' } },
    { id: 'inspiration',  word: 'Вдохновение',    color: '#FFCA28', face: { mouth: 0.9,    brows: 0.5,  eyes: 'wide' } },
    { id: 'fatigue',      word: 'Усталость',      color: '#B39DDB', face: { mouth: -0.2,   brows: 0.3,  eyes: 'half' } },
    { id: 'helpless',     word: 'Беспомощность',  color: '#90A4AE', face: { mouth: -0.9,   brows: 1,    eyes: 'wide' } },
    { id: 'contempt',     word: 'Презрение',      color: '#8D6E63', face: { mouth: 'wave', brows: -0.4, eyes: 'side' } },
    { id: 'impatience',   word: 'Нетерпение',     color: '#FFA726', face: { mouth: 'flat', brows: -0.5, eyes: 'wide' } }
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

  window.EmotionCards = {
    CARDS: CARDS,
    makeSvg: makeSvg
  };
})();
