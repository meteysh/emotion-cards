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
 * Иллюстрации вырезаны из сводного изображения колоды «Колода эмоций» (32 карточки, сетка 4×8),
 * в исходном размере 138×172 (4:5). Порядок — как в колоде.
 * Важно: если меняете картинку, дайте файлу новое имя — иначе у пользователей останется старая из базы.
 */
(function () {
  'use strict';

  var CARDS = [
    { id: 'aggression', word: 'Агрессия', color: '#FAE4E0', labelColor: '#F6CCC1', image: 'images/cards/aggression.jpg' },
    { id: 'ecstasy', word: 'Восторг', color: '#F4EB26', labelColor: '#FAF48A', image: 'images/cards/ecstasy.jpg' },
    { id: 'admiration', word: 'Восхищение', color: '#CFDD24', labelColor: '#E4EC75', image: 'images/cards/admiration.jpg' },
    { id: 'serenity', word: 'Безмятежность', color: '#F8F06A', labelColor: '#F9F5A7', image: 'images/cards/serenity.jpg' },
    { id: 'grief', word: 'Горе', color: '#41BDEC', labelColor: '#9DDEF4', image: 'images/cards/grief.jpg' },
    { id: 'trust', word: 'Доверие', color: '#D8E256', labelColor: '#EBF1A6', image: 'images/cards/trust.jpg' },
    { id: 'discontent', word: 'Недовольство', color: '#953F97', labelColor: '#E7A6E5', image: 'images/cards/discontent.jpg' },
    { id: 'excitement', word: 'Возбуждение', color: '#86C99C', labelColor: '#B8E4C7', image: 'images/cards/excitement.jpg' },
    { id: 'annoyance', word: 'Досада', color: '#E45894', labelColor: '#F1A3C4', image: 'images/cards/annoyance.jpg' },
    { id: 'love', word: 'Любовь', color: '#F7FAD9', labelColor: '#E6E8A5', image: 'images/cards/love.jpg' },
    { id: 'horror', word: 'Ужас', color: '#A1CD3F', labelColor: '#BFE078', image: 'images/cards/horror.jpg' },
    { id: 'disappointment', word: 'Разочарование', color: '#E4F2F1', labelColor: '#B8E0E0', image: 'images/cards/disappointment.jpg' },
    { id: 'fear', word: 'Страх', color: '#A3CC3F', labelColor: '#C6E383', image: 'images/cards/fear.jpg' },
    { id: 'anxiety', word: 'Тревога', color: '#B5D566', labelColor: '#CBE395', image: 'images/cards/anxiety.jpg' },
    { id: 'contempt', word: 'Презрение', color: '#EFDAE8', labelColor: '#E6BEDB', image: 'images/cards/contempt.jpg' },
    { id: 'joy', word: 'Радость', color: '#F6EA24', labelColor: '#F6F297', image: 'images/cards/joy.jpg' },
    { id: 'boredom', word: 'Скука', color: '#A664A8', labelColor: '#D5AFD5', image: 'images/cards/boredom.jpg' },
    { id: 'awe', word: 'Трепет', color: '#86C99D', labelColor: '#B8DFC4', image: 'images/cards/awe.jpg' },
    { id: 'disgust', word: 'Отвращение', color: '#954098', labelColor: '#D2ABCC', image: 'images/cards/disgust.jpg' },
    { id: 'optimism', word: 'Оптимизм', color: '#FDF6D8', labelColor: '#F5E4A6', image: 'images/cards/optimism.jpg' },
    { id: 'sadness', word: 'Грусть', color: '#43BDEC', labelColor: '#6FCEF4', image: 'images/cards/sadness.jpg' },
    { id: 'fury', word: 'Злость', color: '#DE0B80', labelColor: '#EF85C4', image: 'images/cards/fury.jpg' },
    { id: 'interest', word: 'Интерес', color: '#FCB64C', labelColor: '#FECC7E', image: 'images/cards/interest.jpg' },
    { id: 'amazement', word: 'Изумление', color: '#61BE86', labelColor: '#91D0AB', image: 'images/cards/amazement.jpg' },
    { id: 'vigilance', word: 'Настороженность', color: '#F9A617', labelColor: '#FFC763', image: 'images/cards/vigilance.jpg' },
    { id: 'sorrow', word: 'Печаль', color: '#41BDEC', labelColor: '#81D4F5', image: 'images/cards/sorrow.jpg' },
    { id: 'anger', word: 'Гнев', color: '#DF0A80', labelColor: '#EC8AC2', image: 'images/cards/anger.jpg' },
    { id: 'remorse', word: 'Раскаяние', color: '#E4E4EF', labelColor: '#C8CCEA', image: 'images/cards/remorse.jpg' },
    { id: 'surprise', word: 'Удивление', color: '#63BE86', labelColor: '#8BD0A5', image: 'images/cards/surprise.jpg' },
    { id: 'anticipation', word: 'Ожидание', color: '#F8A617', labelColor: '#FDCB78', image: 'images/cards/anticipation.jpg' },
    { id: 'submission', word: 'Покорность', color: '#F1F5E0', labelColor: '#DEE7BD', image: 'images/cards/submission.jpg' },
    { id: 'acceptance', word: 'Принятие', color: '#D7E356', labelColor: '#EBF08C', image: 'images/cards/acceptance.jpg' }
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
