/*
 * Перетаскивание на Pointer Events: одинаково работает мышью, пером и пальцем
 * (стандартный HTML5 drag-and-drop не работает на сенсорных экранах).
 *
 * На сенсорном экране перетаскивание начинается после короткого удержания пальца,
 * чтобы список карточек можно было обычным образом прокручивать.
 *
 *   DragManager.init({
 *     root:      элемент, внутри которого ловим pointerdown,
 *     itemSelector: '.card[data-id]',
 *     canDrag(el)         -> boolean,
 *     canAutoScroll(zone, el) -> boolean — прокручивать ли зону, когда карточку держат у её края,
 *     onOver(info)        -> вызывается при движении: { el, zone, x, y }
 *     onDrop(info)        -> { el, zone, x, y }   zone — элемент с data-zone или null
 *     onCancel(info)
 *   })
 */
(function () {
  'use strict';

  var MOVE_THRESHOLD = 6;     // px, после которых мышь начинает тянуть
  var TOUCH_HOLD_MS = 180;    // удержание пальца перед началом перетаскивания

  function DragManager(opts) {
    this.opts = opts;
    this.state = null;
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._blockTouch = this._blockTouch.bind(this);
    this._tick = this._tick.bind(this);
    opts.root.addEventListener('pointerdown', this._onDown);
    // Долгое нажатие на Android/iOS вызывает контекстное меню — во время перетаскивания оно не нужно.
    var self = this;
    opts.root.addEventListener('contextmenu', function (e) {
      if (self.state || e.target.closest(opts.itemSelector)) e.preventDefault();
    });
    // Пока тянем пальцем — запрещаем прокрутку страницы.
    document.addEventListener('touchmove', this._blockTouch, { passive: false });
  }

  DragManager.prototype._blockTouch = function (e) {
    if (this.state && (this.state.dragging || this.state.armed)) e.preventDefault();
  };

  DragManager.prototype._onDown = function (e) {
    if (this.state) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button, input, a')) return;
    var el = e.target.closest(this.opts.itemSelector);
    if (!el || !this.opts.root.contains(el)) return;
    if (this.opts.canDrag && !this.opts.canDrag(el)) return;

    var rect = el.getBoundingClientRect();
    var isTouch = e.pointerType === 'touch';
    this.state = {
      el: el,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      isTouch: isTouch,
      armed: !isTouch,     // мышь «взведена» сразу, палец — после удержания
      dragging: false,
      timer: null
    };

    if (isTouch) {
      var self = this;
      this.state.timer = setTimeout(function () {
        if (!self.state) return;
        self.state.armed = true;
        self._start();
      }, TOUCH_HOLD_MS);
    } else {
      e.preventDefault(); // не выделять текст
    }

    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onCancel);
  };

  DragManager.prototype._start = function () {
    var s = this.state;
    if (s.dragging) return;
    s.dragging = true;
    var rect = s.el.getBoundingClientRect();
    var ghost = s.el.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.removeAttribute('id');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    document.body.appendChild(ghost);
    s.ghost = ghost;
    s.el.classList.add('is-dragging');
    document.body.classList.add('dragging-active');
    if (navigator.vibrate && s.isTouch) { try { navigator.vibrate(15); } catch (e) { /* ignore */ } }
    this._position();
    this._over();
    s.raf = requestAnimationFrame(this._tick);
  };

  // Автопрокрутка панели, пока карточку держат у её верхнего/нижнего края.
  DragManager.prototype._tick = function () {
    var s = this.state;
    if (!s || !s.dragging) return;
    var zone = this._zoneAt(s.x, s.y);
    if (zone && (!this.opts.canAutoScroll || this.opts.canAutoScroll(zone, s.el))) {
      var r = zone.getBoundingClientRect();
      var edge = Math.min(60, r.height / 4);
      var before = zone.scrollTop;
      if (s.y < r.top + edge) zone.scrollTop -= Math.ceil((r.top + edge - s.y) / 4);
      else if (s.y > r.bottom - edge) zone.scrollTop += Math.ceil((s.y - (r.bottom - edge)) / 4);
      if (zone.scrollTop !== before && this.opts.onOver) this.opts.onOver(this._info());
    }
    s.raf = requestAnimationFrame(this._tick);
  };

  DragManager.prototype._position = function () {
    var s = this.state;
    s.ghost.style.transform =
      'translate(' + (s.x - s.offsetX) + 'px,' + (s.y - s.offsetY) + 'px) rotate(-3deg)';
  };

  DragManager.prototype._zoneAt = function (x, y) {
    var hit = document.elementFromPoint(x, y);
    return hit ? hit.closest('[data-zone]') : null;
  };

  DragManager.prototype._info = function () {
    var s = this.state;
    return { el: s.el, zone: this._zoneAt(s.x, s.y), x: s.x, y: s.y };
  };

  DragManager.prototype._over = function () {
    if (this.opts.onOver) this.opts.onOver(this._info());
  };

  DragManager.prototype._onMove = function (e) {
    var s = this.state;
    if (!s || e.pointerId !== s.pointerId) return;
    s.x = e.clientX;
    s.y = e.clientY;
    var dist = Math.hypot(s.x - s.startX, s.y - s.startY);

    if (!s.dragging) {
      if (s.isTouch) {
        // Палец сдвинулся до окончания удержания — это прокрутка, а не перетаскивание.
        if (dist > MOVE_THRESHOLD) this._cleanup();
        return;
      }
      if (dist < MOVE_THRESHOLD) return;
      this._start();
      return;
    }
    e.preventDefault();
    this._position();
    this._over();
  };

  DragManager.prototype._onUp = function (e) {
    var s = this.state;
    if (!s || e.pointerId !== s.pointerId) return;
    if (s.dragging) {
      s.x = e.clientX;
      s.y = e.clientY;
      var info = this._info();
      this._cleanup();
      if (this.opts.onDrop) this.opts.onDrop(info);
    } else {
      this._cleanup();
    }
  };

  DragManager.prototype._onCancel = function () {
    var s = this.state;
    if (!s) return;
    var wasDragging = s.dragging;
    var info = { el: s.el };
    this._cleanup();
    if (wasDragging && this.opts.onCancel) this.opts.onCancel(info);
  };

  DragManager.prototype._cleanup = function () {
    var s = this.state;
    if (!s) return;
    clearTimeout(s.timer);
    cancelAnimationFrame(s.raf);
    if (s.ghost) s.ghost.remove();
    s.el.classList.remove('is-dragging');
    document.body.classList.remove('dragging-active');
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onCancel);
    this.state = null;
  };

  window.DragManager = DragManager;
})();
