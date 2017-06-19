'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var EvEmitter = function () {
    function EvEmitter() {}

    var proto = EvEmitter.prototype;

    proto.on = function (eventName, listener) {
      if (!eventName || !listener) {
        return;
      }
      var events = this._events = this._events || {};
      var listeners = events[eventName] = events[eventName] || [];
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }

      return this;
    };

    proto.once = function (eventName, listener) {
      if (!eventName || !listener) {
        return;
      }
      this.on(eventName, listener);
      var onceEvents = this._onceEvents = this._onceEvents || {};
      var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
      onceListeners[listener] = true;

      return this;
    };

    proto.off = function (eventName, listener) {
      if (typeof eventName === 'undefined') {
        delete this._events;
        delete this._onceEvents;
        return;
      }
      var listeners = this._events && this._events[eventName];
      if (!listeners || !listeners.length) {
        return;
      }
      var index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      return this;
    };

    proto.emitEvent = function (eventName, args) {
      var listeners = this._events && this._events[eventName];
      if (!listeners || !listeners.length) {
        return;
      }
      var i = 0;
      var listener = listeners[i];
      args = args || [];
      var onceListeners = this._onceEvents && this._onceEvents[eventName];

      while (listener) {
        var isOnce = onceListeners && onceListeners[listener];
        if (isOnce) {
          this.off(eventName, listener);
          delete onceListeners[listener];
        }
        listener.apply(this, args);
        i += isOnce ? 0 : 1;
        listener = listeners[i];
      }

      return this;
    };

    return EvEmitter;
  }

  /**
   * feature detection and helper functions
   */

  ();var log = function log() {
    console.log.apply(console, arguments);
  };

  var hasEventListeners = !!window.addEventListener;

  var document = window.document;

  var addEvent = function addEvent(el, e, callback, capture) {
    if (hasEventListeners) {
      el.addEventListener(e, callback, !!capture);
    } else {
      el.attachEvent('on' + e, callback);
    }
  };

  var removeEvent = function removeEvent(el, e, callback, capture) {
    if (hasEventListeners) {
      el.removeEventListener(e, callback, !!capture);
    } else {
      el.detachEvent('on' + e, callback);
    }
  };

  var fireEvent = function fireEvent(el, eventName, data) {
    var ev = void 0;

    if (document.createEvent) {
      ev = document.createEvent('HTMLEvents');
      ev.initEvent(eventName, true, false);
      ev = extend(ev, data);
      el.dispatchEvent(ev);
    } else if (document.createEventObject) {
      ev = document.createEventObject();
      ev = extend(ev, data);
      el.fireEvent('on' + eventName, ev);
    }
  };

  var trim = function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  };

  var hasClass = function hasClass(el, cn) {
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
  };

  var addClass = function addClass(el, cn) {
    if (!hasClass(el, cn)) {
      el.className = el.className === '' ? cn : el.className + ' ' + cn;
    }
  };

  var removeClass = function removeClass(el, cn) {
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
  };

  var isArray = function isArray(obj) {
    return (/Array/.test(Object.prototype.toString.call(obj))
    );
  };

  var isDate = function isDate(obj) {
    return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
    );
  };

  var isWeekend = function isWeekend(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  };

  var isLeapYear = function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  };

  var getDaysInMonth = function getDaysInMonth(year, month) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };

  var setToStartOfDay = function setToStartOfDay(date) {
    if (isDate(date)) date.setHours(0, 0, 0, 0);
  };

  var areDatesEqual = function areDatesEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.getTime() === b.getTime();
  };

  var toISODateString = function toISODateString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1);
    var d = String(date.getDate());
    return y + '/' + (m.length === 1 ? '0' : '') + m + '/' + (d.length === 1 ? '0' : '') + d;
  };

  var extend = function extend(to, from, overwrite) {
    for (var prop in from) {
      var hasProp = to[prop] !== undefined;
      if (hasProp && _typeof(from[prop]) === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
        if (isDate(from[prop])) {
          if (overwrite) {
            to[prop] = new Date(from[prop].getTime());
          }
        } else if (isArray(from[prop])) {
          if (overwrite) {
            to[prop] = from[prop].slice(0);
          }
        } else {
          to[prop] = extend({}, from[prop], overwrite);
        }
      } else if (overwrite || !hasProp) {
        to[prop] = from[prop];
      }
    }
    return to;
  };

  var adjustCalendar = function adjustCalendar(calendar) {
    if (calendar.month < 0) {
      calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
      calendar.month += 12;
    }
    if (calendar.month > 11) {
      calendar.year += Math.floor(Math.abs(calendar.month) / 12);
      calendar.month -= 12;
    }
    return calendar;
  };

  var containsElement = function containsElement(container, element) {
    while (element) {
      if (container === element) {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  };

  /**
   * defaults and localisation
   */
  var defaults = {
    // initialise right away, if false, you have to call new PlainPicker(options).init();
    autoInit: true,

    // bind the picker to a form field
    field: null,

    // default `field` if `field` is set
    trigger: null,

    // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
    bound: undefined,

    // position of the datepicker, relative to the field (default to bottom & left)
    // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
    positionTarget: null,
    position: 'bottom left',

    // automatically fit in the viewport even if it means repositioning from the position option
    reposition: true,

    // the default output format for `.toString()` and `field` value
    // a function(date) { return string }
    // could be date.toLocaleDateString(this._o.i18n.language, {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'})
    formatFn: function formatFn(date) {
      return toISODateString(date);
    },

    parseFn: function parseFn(value) {
      return new Date(Date.parse(value));
    },

    // the initial date to view when first opened
    defaultDate: null,

    // make the `defaultDate` the initial selected value
    setDefaultDate: false,

    // first day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    disableDayFn: null,

    labelFn: function labelFn(day) {
      var dateStr = day.date.toLocaleDateString(this._o.i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      var dayStr = this._o.i18n.weekdays[day.date.getDay()];
      var text = dayStr + ', ' + dateStr;
      if (day.isToday) {
        text += ' (' + this._o.i18n.today + ')';
      }
      if (day.isDisabled) {
        text = '(' + this._o.i18n.disabled + ') ' + text;
      }
      return text;
    },

    textFn: function textFn(day) {
      var text = day.day;
      return text;
    },

    // the minimum/earliest date that can be selected
    minDate: null,
    // the maximum/latest date that can be selected
    maxDate: null,

    // number of years either side, or array of upper/lower range
    yearRange: 10,

    // show week numbers at head of row
    showWeekNumber: false,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Additional text to append to the year in the calendar title
    yearSuffix: '',

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // how many months are visible
    numberOfMonths: 1,

    // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
    // only used for the first display or when a selected date is not visible
    mainCalendar: 'left',

    // Specify a DOM element to render the calendar in
    container: undefined,

    // internationalization
    i18n: {
      language: document.querySelector('html').getAttribute('lang') || undefined,
      today: 'Today',
      disabled: 'Disabled',
      help: 'Use arrow keys to choose a date.',

      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },

    // Theme Classname
    theme: null,

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null

    /**
     * templating functions to abstract HTML rendering
     */
  };var renderDayName = function renderDayName(opts, day, abbr) {
    day += opts.firstDay;
    while (day >= 7) {
      day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
  };

  var renderDay = function renderDay(opts) {
    var arr = [];
    var ariaSelected = 'false';
    var ariaLabel = opts.label || '';
    var tabindex = opts.tabindex;
    if (opts.isEmpty) {
      if (opts.showDaysInNextAndPreviousMonths) {
        arr.push('is-outside-curent-month');
      } else {
        return '<td class="is-empty"></td>';
      }
    }
    if (opts.isDisabled) {
      arr.push('is-disabled');
    }
    if (opts.isToday) {
      arr.push('is-today');
    }
    if (opts.isSelected) {
      arr.push('is-selected');
      ariaSelected = 'true';
    }
    if (opts.isInRange) {
      arr.push('is-inrange');
    }
    if (opts.isStartRange) {
      arr.push('is-startrange');
    }
    if (opts.isEndRange) {
      arr.push('is-endrange');
    }
    return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '">' + '<button class="datepicker__button datepicker__day" type="button" ' + 'data-datepicker-year="' + opts.year + '" data-datepicker-month="' + opts.month + '" data-datepicker-day="' + opts.day + '" aria-selected="' + ariaSelected + '" aria-label="' + ariaLabel + '" tabindex="' + tabindex + '">' + opts.text + '</button>' + '</td>';
  };

  var renderWeek = function renderWeek(d, m, y) {
    var onejan = new Date(y, 0, 1);
    var weekNum = Math.ceil(((new Date(y, m, d) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return '<td class="datepicker__week">' + weekNum + '</td>';
  };

  var renderRow = function renderRow(days, isRTL) {
    return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
  };

  var renderBody = function renderBody(rows) {
    return '<tbody>' + rows.join('') + '</tbody>';
  };

  var renderHead = function renderHead(opts) {
    var i = void 0;
    var arr = [];
    if (opts.showWeekNumber) {
      arr.push('<th></th>');
    }
    for (i = 0; i < 7; i++) {
      arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
    }
    return '<thead aria-hidden="true"><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
  };

  var renderTitle = function renderTitle(instance, c, year, month, refYear, randId) {
    var i = void 0;
    var j = void 0;
    var arr = void 0;
    var opts = instance._o;
    var isMinYear = year === opts.minYear;
    var isMaxYear = year === opts.maxYear;
    var html = '<div class="datepicker__title" aria-hidden="true">';
    var monthHtml = void 0;
    var yearHtml = void 0;
    var prev = true;
    var next = true;

    for (arr = [], i = 0; i < 12; i++) {
      arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
    }

    monthHtml = '<div class="datepicker__label">' + opts.i18n.months[month] + '<select class="datepicker__select datepicker__select-month" tabindex="-1">' + arr.join('') + '</select></div>';

    if (isArray(opts.yearRange)) {
      i = opts.yearRange[0];
      j = opts.yearRange[1] + 1;
    } else {
      i = year - opts.yearRange;
      j = 1 + year + opts.yearRange;
    }

    for (arr = []; i < j && i <= opts.maxYear; i++) {
      if (i >= opts.minYear) {
        arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + i + '</option>');
      }
    }
    yearHtml = '<div class="datepicker__label">' + year + opts.yearSuffix + '<select class="datepicker__select datepicker__select-year" tabindex="-1">' + arr.join('') + '</select></div>';

    if (opts.showMonthAfterYear) {
      html += yearHtml + monthHtml;
    } else {
      html += monthHtml + yearHtml;
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) {
      prev = false;
    }

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
      next = false;
    }

    if (c === 0) {
      html += '<button class="datepicker__prev' + (prev ? '' : ' is-disabled') + '" ' + (prev ? '' : 'disabled ') + 'type="button" aria-labelledby="' + randId + '" tabindex="-1">' + opts.i18n.previousMonth + '</button>';
    }
    if (c === instance._o.numberOfMonths - 1) {
      html += '<button class="datepicker__next' + (next ? '' : ' is-disabled') + '" ' + (next ? '' : 'disabled ') + 'type="button" aria-labelledby="' + randId + '" tabindex="-1">' + opts.i18n.nextMonth + '</button>';
    }

    html += '</div>';

    return html;
  };

  var renderTable = function renderTable(opts, data, randId) {
    return '<table cellpadding="0" cellspacing="0" class="datepicker__table" role="presentation">' + renderHead(opts) + renderBody(data) + '</table>';
  };

  /**
   * PlainPicker constructor
   */
  var PlainPicker = function PlainPicker(options) {
    var self = this;
    var opts = self.config(options);

    self._onClick = function (e) {
      if (!self._v) {
        return;
      }
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return;
      }

      e.stopPropagation();

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          if (opts.bound) {
            this._v && console.log('Hiding soon because date has been selected and picker is bound.');
            self.hideAfter(200);
          }
          self.setDate(new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day')));
        } else if (hasClass(target, 'datepicker__prev')) {
          self.prevMonth();
        } else if (hasClass(target, 'datepicker__next')) {
          self.nextMonth();
        }
      }
      if (!hasClass(target, 'datepicker__select')) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
          return false;
        }
      } else {
        self._c = true;
      }
    };

    self._onChange = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return;
      }
      if (hasClass(target, 'datepicker__select-month')) {
        self.gotoMonth(target.value);
      } else if (hasClass(target, 'datepicker__select-year')) {
        self.gotoYear(target.value);
      }
    };

    self._onKeyChange = function (e) {
      e = e || window.event;

      function captureKey() {
        self.hasKey = true;
        stopEvent();
      }

      function stopEvent() {
        e.preventDefault();
        e.stopPropagation();
      }

      if (self.isVisible()) {
        switch (e.keyCode) {
          case 9 /* TAB */:
            if (self.hasKey && self._o.trigger) {
              self._o.trigger.focus();
              self.hasKey = false;
            }
            break;
          case 32: /* SPACE */
          case 13 /* ENTER */:
            if (self.hasKey && !opts.container) {
              stopEvent();
              if (self._o.trigger) {
                self._o.trigger.focus();
                try {
                  self._o.trigger.select();
                } catch (e) {}
              }
              self.hide();
            }
            break;
          case 27 /* ESCAPE */:
            if (!opts.container) {
              stopEvent();
              self.cancel();
            }
            break;
          case 37 /* LEFT */:
            captureKey();
            self.adjustDate(-1);
            break;
          case 38 /* UP */:
            captureKey();
            self.adjustDate(-7);
            break;
          case 39 /* RIGHT */:
            captureKey();
            self.adjustDate(+1);
            break;
          case 40 /* DOWN */:
            captureKey();
            self.adjustDate(+7);
            break;
          case 33 /* PAGE_UP */:
            captureKey();
            self.adjustMonth(-1);
            break;
          case 34 /* PAGE_DOWN */:
            captureKey();
            self.adjustMonth(+1);
            break;
          case 35 /* END */:
            captureKey();
            self.adjustYear(+1);
            break;
          case 36 /* HOME */:
            captureKey();
            self.adjustYear(-1);
            break;
        }
      }
    };

    self._onInputChange = function (e) {
      if (e.firedBy === self) {
        return;
      }

      var date = opts.parseFn.call(self, opts.field.value);

      if (isDate(date)) {
        self.setDate(date);
      } else {
        self.setDate(null);
      }
    };

    self._onTouch = function (event) {
      if (!self.isVisible() || event.target !== opts.field) {
        self.touched = true;
      }
    };

    self._onInputFocus = function (event) {
      if (self.touched && opts.field && opts.field.nodeName === 'INPUT') {
        opts.field.blur();
        self.touched = false;
        self.focusInside = true;
      }
      self.show();
    };

    self._onInputClick = function (event) {
      self.touched = false;
      self.show();
    };

    self._onInputBlur = function (event) {
      if (self.hasKey) {
        return;
      }

      var pEl = document.activeElement;
      do {
        if (hasClass(pEl, 'datepicker') || pEl === self.el) {
          return;
        }
      } while (pEl = pEl.parentNode);

      if (!self._c) {
        this._v && log('Hiding soon because input was blured', event.target, self._b);
        self.hide(true);
      }
      self._c = false;
    };

    self._onDocumentClick = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      var pEl = target;
      if (!target) {
        return;
      }
      if (containsElement(self.el, target)) {
        return;
      }
      if (!hasEventListeners && hasClass(target, 'datepicker__select')) {
        if (!target.onchange) {
          target.setAttribute('onchange', 'return;');
          addEvent(target, 'change', self._onChange);
        }
      }
      do {
        if (hasClass(pEl, 'datepicker') || pEl === opts.trigger) {
          return;
        }
      } while (pEl = pEl.parentNode);
      if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
        self.hide(true);
      }
    };

    self.init = function () {
      this._v = false;

      self.el = document.createElement('div');
      self.el.className = 'datepicker' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');
      self.el.setAttribute('role', 'application');
      self.el.setAttribute('aria-label', self.getLabel());

      self.speakEl = document.createElement('div');
      self.speakEl.setAttribute('role', 'status');
      self.speakEl.setAttribute('aria-live', 'assertive');
      self.speakEl.setAttribute('aria-atomic', 'true');
      self.speakEl.setAttribute('style', 'position: absolute; left: -9999px; opacity: 0;');

      addEvent(self.el, 'mousedown', self._onClick, true);
      addEvent(self.el, 'touchend', self._onClick, true);
      addEvent(self.el, 'change', self._onChange);
      addEvent(self.el, 'keydown', self._onKeyChange);

      if (opts.field) {
        addEvent(opts.field, 'change', self._onInputChange);

        if (!opts.defaultDate) {
          opts.defaultDate = opts.parseFn.call(self, opts.field.value);
          opts.setDefaultDate = true;
        }
      }

      var defDate = opts.defaultDate;

      if (isDate(defDate)) {
        if (opts.setDefaultDate) {
          self.setDate(defDate, true);
        } else {
          self.gotoDate(defDate);
        }
      } else {
        defDate = new Date();
        if (opts.minDate && opts.minDate > defDate) {
          defDate = opts.minDate;
        } else if (opts.maxDate && opts.maxDate < defDate) {
          defDate = opts.maxDate;
        }
        self.gotoDate(defDate);
      }

      if (opts.bound) {
        this.hide();
        self.el.className += ' is-bound';
        addEvent(opts.trigger, 'click', self._onInputClick);
        addEvent(document, 'touchstart', self._onTouch);
        addEvent(opts.trigger, 'focus', self._onInputFocus);
        addEvent(opts.trigger, 'blur', self._onInputBlur);
        addEvent(opts.trigger, 'keydown', self._onKeyChange);
      } else {
        this.show();
      }

      this.emitEvent('init');
    };

    if (opts.autoInit) {
      this.init();
    }
  };

  PlainPicker.EvEmitter = EvEmitter;

  var now = new Date();
  setToStartOfDay(now

  /**
   * public PlainPicker API
   */

  );PlainPicker.prototype = {
    /**
     * configure functionality
     */
    config: function config(options) {
      var self = this;

      if (!this._o) {
        this._o = extend({}, defaults, true);
      }

      var opts = extend(this._o, options, true);

      opts.isRTL = !!opts.isRTL;

      opts.field = opts.field && opts.field.nodeName ? opts.field : null;

      opts.theme = typeof opts.theme === 'string' && opts.theme ? opts.theme : null;

      opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

      opts.trigger = opts.trigger && opts.trigger.nodeName ? opts.trigger : opts.field;

      opts.disableWeekends = !!opts.disableWeekends;

      opts.disableDayFn = typeof opts.disableDayFn === 'function' ? opts.disableDayFn : null;

      opts.labelFn = typeof opts.labelFn === 'function' ? opts.labelFn : null;

      var nom = parseInt(opts.numberOfMonths, 10) || 1;
      opts.numberOfMonths = nom > 4 ? 4 : nom;

      opts.minDate = opts.parseFn.call(self, opts.minDate);
      opts.maxDate = opts.parseFn.call(self, opts.maxDate);
      if (!isDate(opts.minDate)) {
        opts.minDate = false;
      }
      if (!isDate(opts.maxDate)) {
        opts.maxDate = false;
      }
      if (opts.minDate && opts.maxDate && opts.maxDate < opts.minDate) {
        opts.maxDate = opts.minDate = false;
      }
      if (opts.minDate) {
        this.setMinDate(opts.minDate);
      }
      if (opts.maxDate) {
        this.setMaxDate(opts.maxDate);
      }

      if (isArray(opts.yearRange)) {
        var fallback = new Date().getFullYear() - 10;
        opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
        opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
      } else {
        opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
        if (opts.yearRange > 100) {
          opts.yearRange = 100;
        }
      }

      var eventTest = /^on([A-Z]\w+)$/;
      Object.keys(opts).forEach(function (key) {
        var match = key.match(eventTest);
        if (match) {
          var type = match[1].toLowerCase();
          this.on(type, opts[key]);
          delete opts[key];
        }
      }.bind(this));

      return opts;
    },

    /**
     * return a formatted string of the current selection
     */
    toString: function toString() {
      if (!isDate(this._d)) {
        return '';
      }
      if (typeof this._o.formatFn === 'function') {
        return this._o.formatFn.call(this, this._d);
      }
      return this._d.toDateString();
    },

    /**
     * return a Date object of the current selection with fallback for the current date
     */
    getDate: function getDate() {
      return isDate(this._d) ? new Date(this._d.getTime()) : new Date();
    },

    /**
     * return a Date object of the current selection
     */
    getSelectedDate: function getSelectedDate() {
      return isDate(this._d) ? new Date(this._d.getTime()) : null;
    },

    /**
     * return a Date object of the current selection
     */
    getVisibleDate: function getVisibleDate() {
      return new Date(this.calendars[0].year, this.calendars[0].month, 1);
    },

    /**
     * set the current selection
     */
    setDate: function setDate(date, preventOnSelect) {
      if (!date) {
        this._d = null;

        if (this._o.field) {
          this._o.field.value = '';
          fireEvent(this._o.field, 'change', { firedBy: this });
        }

        this.emitEvent('change', [this._d]);

        return this.draw();
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!isDate(date)) {
        return;
      }

      setToStartOfDay(date);

      var min = this._o.minDate;
      var max = this._o.maxDate;

      if (isDate(min) && date < min) {
        date = min;
      } else if (isDate(max) && date > max) {
        date = max;
      }

      if (areDatesEqual(this._d, date)) {
        return;
      }

      this._d = new Date(date.getTime());
      setToStartOfDay(this._d);
      this.gotoDate(this._d);

      if (this._o.field) {
        this._o.field.value = this.toString();
        fireEvent(this._o.field, 'change', { firedBy: this });
      }
      if (!preventOnSelect) {
        this.emitEvent('select', [this.getDate()]);
      }
      this.emitEvent('change', [this._d]);
    },

    selectDate: function selectDate(date) {
      this.setDate(date);
      if (this._d) {
        this.speak(this.getDayConfig(this._d).label);
      }
    },

    getLabel: function getLabel() {
      var label = '';
      var opts = this._o;

      if (opts.field && opts.field.id) {
        label = document.querySelector('label[for="' + opts.field.id + '"]');
        label = label ? label.textContent || label.innerText : '';
      }

      if (!label && opts.trigger) {
        label = opts.trigger.textContent || opts.trigger.innerText;
      }

      label += ' (' + opts.i18n.help + ')';

      return label;
    },

    speak: function speak(html) {
      this.speak.innerHTML = '';
      this.speakEl.innerHTML = html;
    },

    /**
     * change view to a specific date
     */
    gotoDate: function gotoDate(date) {
      var newCalendar = true;

      if (!isDate(date)) {
        return;
      }

      if (this.calendars) {
        var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1);
        var lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1);
        var visibleDate = date.getTime();

        lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
        lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
        newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
      }

      if (newCalendar) {
        this.calendars = [{
          month: date.getMonth(),
          year: date.getFullYear()
        }];
        if (this._o.mainCalendar === 'right') {
          this.calendars[0].month += 1 - this._o.numberOfMonths;
        }
      }

      this.adjustCalendars();
    },

    adjustDate: function adjustDate(days) {
      var day = this.getDate();
      var difference = parseInt(days);
      var newDay = new Date(day.valueOf());
      newDay.setDate(newDay.getDate() + difference);
      this.selectDate(newDay);
    },

    adjustCalendars: function adjustCalendars() {
      var c = void 0;
      this.calendars[0] = adjustCalendar(this.calendars[0]);
      for (c = 1; c < this._o.numberOfMonths; c++) {
        this.calendars[c] = adjustCalendar({
          month: this.calendars[0].month + c,
          year: this.calendars[0].year
        });
      }
      this.draw();
    },

    gotoToday: function gotoToday() {
      this.gotoDate(new Date());
    },

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth: function gotoMonth(month) {
      if (!isNaN(month)) {
        this.calendars[0].month = parseInt(month, 10);
        this.adjustCalendars();
      }
    },

    nextMonth: function nextMonth() {
      this.calendars[0].month++;
      this.adjustCalendars();
    },

    prevMonth: function prevMonth() {
      this.calendars[0].month--;
      this.adjustCalendars();
    },

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear: function gotoYear(year) {
      if (!isNaN(year)) {
        this.calendars[0].year = parseInt(year, 10);
        this.adjustCalendars();
      }
    },

    /**
     * change the minDate
     */
    setMinDate: function setMinDate(value) {
      var self = this;
      var d = this._o.parseFn.call(self, value);

      if (isDate(d)) {
        setToStartOfDay(d);
        this._o.minDate = d;
        this._o.minYear = d.getFullYear();
        this._o.minMonth = d.getMonth();
      } else {
        this._o.minDate = defaults.minDate;
        this._o.minYear = defaults.minYear;
        this._o.minMonth = defaults.minMonth;
      }

      this.draw();
    },

    /**
     * change the maxDate
     */
    setMaxDate: function setMaxDate(value) {
      var self = this;

      var d = this._o.parseFn.call(self, value);
      if (isDate(d)) {
        setToStartOfDay(d);
        this._o.maxDate = d;
        this._o.maxYear = d.getFullYear();
        this._o.maxMonth = d.getMonth();
      } else {
        this._o.maxDate = defaults.maxDate;
        this._o.maxYear = defaults.maxYear;
        this._o.maxMonth = defaults.maxMonth;
      }

      this.draw();
    },

    setStartRange: function setStartRange(value) {
      if (!areDatesEqual(this._o.startRange, value)) {
        this._o.startRange = value;
        this.draw();
        this.emitEvent('startrange', [this._o.startRange]);
      }
    },

    setEndRange: function setEndRange(value) {
      if (!areDatesEqual(this._o.endRange, value)) {
        this._o.endRange = value;
        this.draw();
        this.emitEvent('endrange', [this._o.endRange]);
      }
    },

    getStartRange: function getStartRange(value) {
      return this._o.startRange;
    },

    getEndRange: function getEndRange(value) {
      return this._o.endRange;
    },

    _request: function _request(action) {
      var self = this;

      if (window.requestAnimationFrame) {
        if (!this.requested) {
          this.requested = {
            request: window.requestAnimationFrame(function () {
              if (self.requested.draw) {
                self._draw();
              }
              if (self.requested.adjustPosition) {
                self._adjustPosition();
              }
              self.focusPicker();
              self.requested = null;
            })
          };
        }
        this.requested[action] = true;
      } else {
        this['_' + action]();
      }
    },

    /**
     * request refreshing HTML
     * (uses requestAnimationFrame if available to improve performance)
     */
    draw: function draw(force) {
      if (!this._v) {
        return;
      }
      if (force) {
        this._draw(force);
      } else {
        this._request('draw');
      }
    },

    /**
     * refresh the HTML
     */
    _draw: function _draw(force) {
      if (!this._v && !force) {
        return;
      }
      var opts = this._o;
      // var self = this
      var minYear = opts.minYear;
      var maxYear = opts.maxYear;
      var minMonth = opts.minMonth;
      var maxMonth = opts.maxMonth;
      var html = '';
      var randId = void 0;

      if (this._y <= minYear) {
        this._y = minYear;
        if (!isNaN(minMonth) && this._m < minMonth) {
          this._m = minMonth;
        }
      }
      if (this._y >= maxYear) {
        this._y = maxYear;
        if (!isNaN(maxMonth) && this._m > maxMonth) {
          this._m = maxMonth;
        }
      }

      randId = 'datepicker__title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

      var label = this.getLabel();

      if (this._o.field && this._o.trigger === this._o.field && opts.bound) {
        this._o.field.setAttribute('aria-label', label);
      }

      var c = void 0;
      for (c = 0; c < opts.numberOfMonths; c++) {
        html += '<div class="datepicker__lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
      }

      this.el.innerHTML = html;

      var autofocus = this.el.querySelector('td.is-selected > .datepicker__button');
      if (!autofocus) {
        autofocus = this.el.querySelector('td.is-today > .datepicker__button');
      }
      if (!autofocus) {
        autofocus = this.el.querySelector('td:not(.is-disabled) > .datepicker__button');
      }
      if (!autofocus) {
        autofocus = this.el.querySelector('.datepicker__button');
      }
      autofocus.setAttribute('tabindex', '0');

      this.emitEvent('draw');
    },

    focusPicker: function focusPicker() {
      var self = this;
      var opts = this._o;

      if (!this.hasKey && !this.focusInside) {
        return;
      }

      self.el.querySelector('.datepicker__button[tabindex="0"]').focus();

      if (opts.bound) {
        if (opts.field.type !== 'hidden') {
          window.setTimeout(function () {
            self.el.querySelector('.datepicker__button[tabindex="0"]').focus();
          }, 1);
        }
      }

      this.focusInside = false;
    },

    adjustPosition: function adjustPosition() {
      this._request('adjustPosition');
    },

    _adjustPosition: function _adjustPosition() {
      var left = void 0;
      var top = void 0;
      var clientRect = void 0;

      if (this._o.container) return;

      this.el.style.position = 'absolute';

      var field = this._o.positionTarget || this._o.trigger;
      var pEl = field;
      var width = this.el.offsetWidth;
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      if (typeof field.getBoundingClientRect === 'function') {
        clientRect = field.getBoundingClientRect();
        left = clientRect.left + window.pageXOffset;
        top = clientRect.bottom + window.pageYOffset;
      } else {
        left = pEl.offsetLeft;
        top = pEl.offsetTop + pEl.offsetHeight;
        while (pEl = pEl.offsetParent) {
          left += pEl.offsetLeft;
          top += pEl.offsetTop;
        }
      }

      var halign = 0;
      if (this._o.position.indexOf('right') > -1) {
        halign = 1;
      } else if (this._o.position.indexOf('center') > -1) {
        halign = 0.5;
      }

      left -= (width - field.offsetWidth) * halign;

      if (this._o.reposition) {
        var overflow = {
          right: Math.max(0, left + width - (viewportWidth - 20)),
          left: Math.max(0, 20 - left),
          top: Math.max(0, -top)
        };
        left += overflow.left - overflow.right;
        top += overflow.top;
      }

      this.el.style.left = left + 'px';
      this.el.style.top = top + 'px';
    },

    getDayConfig: function getDayConfig(day) {
      var opts = this._o;
      var isSelected = isDate(this._d) ? areDatesEqual(day, this._d) : false;
      var isToday = areDatesEqual(day, now);
      var dayNumber = day.getDate();
      var monthNumber = day.getMonth();
      var yearNumber = day.getFullYear();
      var isStartRange = opts.startRange && areDatesEqual(opts.startRange, day);
      var isEndRange = opts.endRange && areDatesEqual(opts.endRange, day);
      var isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;
      var isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && isWeekend(day) || opts.disableDayFn && opts.disableDayFn.call(this, day);

      var dayConfig = {
        date: day,
        day: dayNumber,
        month: monthNumber,
        year: yearNumber,
        isSelected: isSelected,
        isToday: isToday,
        isDisabled: isDisabled,
        isStartRange: isStartRange,
        isEndRange: isEndRange,
        isInRange: isInRange,
        showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
      };

      dayConfig.text = opts.textFn ? opts.textFn.call(this, dayConfig) : dayNumber;
      dayConfig.label = opts.labelFn ? opts.labelFn.call(this, dayConfig) : day.toDateString();

      return dayConfig;
    },

    /**
     * render HTML for a particular month
     */
    render: function render(year, month, randId) {
      var opts = this._o;
      var days = getDaysInMonth(year, month);
      var before = new Date(year, month, 1).getDay();
      var data = [];
      var row = [];

      var now = new Date();
      setToStartOfDay(now);
      if (opts.firstDay > 0) {
        before -= opts.firstDay;
        if (before < 0) {
          before += 7;
        }
      }

      var cells = days + before;
      var after = cells;

      // var selectedInMonth

      while (after > 7) {
        after -= 7;
      }
      cells += 7 - after;
      // if (this._d && new Date(year, month, 1) <= this._d && new Date(year, month + 1, 1) > this._d) {
      //   selectedInMonth = this._d
      // } else if (new Date(year, month, 1) <= now && new Date(year, month + 1, 1) > now) {
      //   selectedInMonth = now
      // } else {
      //   selectedInMonth = new Date(year, month, 1)
      // }

      var i = void 0,
          r = void 0;
      for (i = 0, r = 0; i < cells; i++) {
        var day = new Date(year, month, 1 + (i - before));
        var dayConfig = this.getDayConfig(day);

        dayConfig.isEmpty = i < before || i >= days + before;
        dayConfig.tabindex = '-1';

        row.push(renderDay(dayConfig));

        if (++r === 7) {
          if (opts.showWeekNumber) {
            row.unshift(renderWeek(i - before, month, year));
          }
          data.push(renderRow(row, opts.isRTL));
          row = [];
          r = 0;
        }
      }
      return renderTable(opts, data, randId);
    },

    isValid: function isValid() {
      if (!isDate(this._d)) {
        return 0;
      }
      if (isDate(this._o.minDate) && this._d < this._o.minDate) {
        return false;
      }
      if (isDate(this._o.maxDate) && this._d > this._o.maxDate) {
        return false;
      }
      return true;
    },

    isVisible: function isVisible() {
      return this._v;
    },

    show: function show() {
      var opts = this._o;
      clearTimeout(this.hideTimeout);

      if (this._d) {
        this.gotoDate(this._d);
      }

      document.body.appendChild(this.speakEl);
      if (opts.field) {
        if (opts.container) {
          opts.container.appendChild(this.el);
        } else if (opts.bound) {
          document.body.appendChild(this.el);
        } else {
          opts.field.parentNode.insertBefore(this.el, opts.field.nextSibling);
        }
      }

      if (!this.isVisible()) {
        removeClass(this.el, 'is-hidden');
        this._v = true;
        this.draw();
        if (this._o.bound) {
          addEvent(document, 'click', this._onDocumentClick);
          this.adjustPosition();
        }
        if (this._o.field) {
          addClass(this._o.field, 'is-visible-datepicker');
          this.recentValue = this._o.field.value;
        }
        this.emitEvent('open');
        if (this._o.field && this._o.field !== this._o.trigger) {
          this.speak(this.getLabel());
        }
      }
    },

    cancel: function cancel() {
      var field = this._o.field;

      if (field) {
        field.value = this.recentValue;
      }
      try {
        field.select();
      } catch (e) {}
      this.hide(true);
    },

    hideAfter: function hideAfter(delay, cancelled) {
      var self = this;

      clearTimeout(this.hideTimeout);
      if (this._v !== false) {
        this.hideTimeout = window.setTimeout(function () {
          self.hide(cancelled);
        }, delay);
      }
    },

    hide: function hide(cancelled) {
      var v = this._v;
      if (v !== false) {
        clearTimeout(this.hideTimeout);
        this.hasKey = false;
        if (this._o.bound) {
          removeEvent(document, 'click', this._onDocumentClick);
        }
        if (this._o.field) {
          removeClass(this._o.field, 'is-visible-datepicker');
        }
        if (this._o.bound) {
          if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
          }
        }
        this._v = false;
        this.emitEvent('close');
        if (this.speakEl.parentNode) {
          document.body.removeChild(this.speakEl);
        }
      }
    },

    destroy: function destroy() {
      this.hide();

      removeEvent(this.el, 'mousedown', this._onClick, true);
      removeEvent(this.el, 'touchend', this._onClick, true);
      removeEvent(this.el, 'change', this._onChange);
      removeEvent(this.el, 'keydown', this._onKeyChange);
      if (this._o.field) {
        removeEvent(this._o.field, 'change', this._onInputChange);
        if (this._o.bound) {
          removeEvent(this._o.trigger, 'click', this._onInputClick);
          removeEvent(document, 'touchstart', this._onTouch);
          removeEvent(this._o.trigger, 'focus', this._onInputFocus);
          removeEvent(this._o.trigger, 'blur', this._onInputBlur);
          removeEvent(this._o.trigger, 'keydown', this._onKeyChange);
        }
      }

      this.emitEvent('destroy');
      this.off();
    }
  };

  for (var name in EvEmitter.prototype) {
    PlainPicker.prototype[name] = EvEmitter.prototype[name];
  }

  window.PlainPicker = PlainPicker;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhaW5waWNrZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9wbGFpbnBpY2tlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKCkge1xuICBjb25zdCBFdkVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRXZFbWl0dGVyKCkge31cblxuICAgIGNvbnN0IHByb3RvID0gRXZFbWl0dGVyLnByb3RvdHlwZVxuXG4gICAgcHJvdG8ub24gPSBmdW5jdGlvbihldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBldmVudHMgPSAodGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9KVxuICAgICAgY29uc3QgbGlzdGVuZXJzID0gKGV2ZW50c1tldmVudE5hbWVdID0gZXZlbnRzW2V2ZW50TmFtZV0gfHwgW10pXG4gICAgICBpZiAobGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBwcm90by5vbmNlID0gZnVuY3Rpb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKCFldmVudE5hbWUgfHwgIWxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5vbihldmVudE5hbWUsIGxpc3RlbmVyKVxuICAgICAgY29uc3Qgb25jZUV2ZW50cyA9ICh0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fSlcbiAgICAgIGNvbnN0IG9uY2VMaXN0ZW5lcnMgPSAob25jZUV2ZW50c1tldmVudE5hbWVdID0gb25jZUV2ZW50c1tldmVudE5hbWVdIHx8IHt9KVxuICAgICAgb25jZUxpc3RlbmVyc1tsaXN0ZW5lcl0gPSB0cnVlXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcHJvdG8ub2ZmID0gZnVuY3Rpb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBldmVudE5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNcbiAgICAgICAgZGVsZXRlIHRoaXMuX29uY2VFdmVudHNcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV1cbiAgICAgIGlmICghbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcilcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBwcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGFyZ3MpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZlbnROYW1lXVxuICAgICAgaWYgKCFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsZXQgaSA9IDBcbiAgICAgIGxldCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgICAgYXJncyA9IGFyZ3MgfHwgW11cbiAgICAgIGNvbnN0IG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbZXZlbnROYW1lXVxuXG4gICAgICB3aGlsZSAobGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzW2xpc3RlbmVyXVxuICAgICAgICBpZiAoaXNPbmNlKSB7XG4gICAgICAgICAgdGhpcy5vZmYoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAgICAgICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1tsaXN0ZW5lcl1cbiAgICAgICAgfVxuICAgICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgICBpICs9IGlzT25jZSA/IDAgOiAxXG4gICAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcmV0dXJuIEV2RW1pdHRlclxuICB9KSgpXG5cbiAgLyoqXG4gICAqIGZlYXR1cmUgZGV0ZWN0aW9uIGFuZCBoZWxwZXIgZnVuY3Rpb25zXG4gICAqL1xuXG4gIGNvbnN0IGxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cylcbiAgfVxuXG4gIGNvbnN0IGhhc0V2ZW50TGlzdGVuZXJzID0gISF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuXG4gIGNvbnN0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50XG5cbiAgY29uc3QgYWRkRXZlbnQgPSBmdW5jdGlvbihlbCwgZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcbiAgICBpZiAoaGFzRXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZSwgY2FsbGJhY2ssICEhY2FwdHVyZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuYXR0YWNoRXZlbnQoJ29uJyArIGUsIGNhbGxiYWNrKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUV2ZW50ID0gZnVuY3Rpb24oZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG4gICAgaWYgKGhhc0V2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGUsIGNhbGxiYWNrLCAhIWNhcHR1cmUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyBlLCBjYWxsYmFjaylcbiAgICB9XG4gIH1cblxuICBjb25zdCBmaXJlRXZlbnQgPSBmdW5jdGlvbihlbCwgZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgbGV0IGV2XG5cbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKVxuICAgICAgZXYuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQoZXYpXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBldilcbiAgICB9XG4gIH1cblxuICBjb25zdCB0cmltID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgfVxuXG4gIGNvbnN0IGhhc0NsYXNzID0gZnVuY3Rpb24oZWwsIGNuKSB7XG4gICAgcmV0dXJuICgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLmluZGV4T2YoJyAnICsgY24gKyAnICcpICE9PSAtMVxuICB9XG5cbiAgY29uc3QgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbCwgY24pIHtcbiAgICBpZiAoIWhhc0NsYXNzKGVsLCBjbikpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSA9PT0gJycgPyBjbiA6IGVsLmNsYXNzTmFtZSArICcgJyArIGNuXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY24pIHtcbiAgICBlbC5jbGFzc05hbWUgPSB0cmltKCgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLnJlcGxhY2UoJyAnICsgY24gKyAnICcsICcgJykpXG4gIH1cblxuICBjb25zdCBpc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIC9BcnJheS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcbiAgfVxuXG4gIGNvbnN0IGlzRGF0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAvRGF0ZS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgJiYgIWlzTmFOKG9iai5nZXRUaW1lKCkpXG4gIH1cblxuICBjb25zdCBpc1dlZWtlbmQgPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXkoKVxuICAgIHJldHVybiBkYXkgPT09IDAgfHwgZGF5ID09PSA2XG4gIH1cblxuICBjb25zdCBpc0xlYXBZZWFyID0gZnVuY3Rpb24oeWVhcikge1xuICAgIHJldHVybiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCkgfHwgeWVhciAlIDQwMCA9PT0gMFxuICB9XG5cbiAgY29uc3QgZ2V0RGF5c0luTW9udGggPSBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgIHJldHVybiBbMzEsIGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV1bbW9udGhdXG4gIH1cblxuICBjb25zdCBzZXRUb1N0YXJ0T2ZEYXkgPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgaWYgKGlzRGF0ZShkYXRlKSkgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICB9XG5cbiAgY29uc3QgYXJlRGF0ZXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKCFhIHx8ICFiKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgY29uc3QgdG9JU09EYXRlU3RyaW5nID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgIGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICBjb25zdCBtID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpXG4gICAgY29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSlcbiAgICByZXR1cm4geSArICcvJyArIChtLmxlbmd0aCA9PT0gMSA/ICcwJyA6ICcnKSArIG0gKyAnLycgKyAoZC5sZW5ndGggPT09IDEgPyAnMCcgOiAnJykgKyBkXG4gIH1cblxuICBjb25zdCBleHRlbmQgPSBmdW5jdGlvbih0bywgZnJvbSwgb3ZlcndyaXRlKSB7XG4gICAgZm9yIChjb25zdCBwcm9wIGluIGZyb20pIHtcbiAgICAgIGNvbnN0IGhhc1Byb3AgPSB0b1twcm9wXSAhPT0gdW5kZWZpbmVkXG4gICAgICBpZiAoaGFzUHJvcCAmJiB0eXBlb2YgZnJvbVtwcm9wXSA9PT0gJ29iamVjdCcgJiYgZnJvbVtwcm9wXSAhPT0gbnVsbCAmJiBmcm9tW3Byb3BdLm5vZGVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzRGF0ZShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gbmV3IERhdGUoZnJvbVtwcm9wXS5nZXRUaW1lKCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF0uc2xpY2UoMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9bcHJvcF0gPSBleHRlbmQoe30sIGZyb21bcHJvcF0sIG92ZXJ3cml0ZSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvdmVyd3JpdGUgfHwgIWhhc1Byb3ApIHtcbiAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBmdW5jdGlvbihjYWxlbmRhcikge1xuICAgIGlmIChjYWxlbmRhci5tb250aCA8IDApIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgLT0gTWF0aC5jZWlsKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggKz0gMTJcbiAgICB9XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoID4gMTEpIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgKz0gTWF0aC5mbG9vcihNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoIC09IDEyXG4gICAgfVxuICAgIHJldHVybiBjYWxlbmRhclxuICB9XG5cbiAgY29uc3QgY29udGFpbnNFbGVtZW50ID0gZnVuY3Rpb24oY29udGFpbmVyLCBlbGVtZW50KSB7XG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChjb250YWluZXIgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgLy8gaW5pdGlhbGlzZSByaWdodCBhd2F5LCBpZiBmYWxzZSwgeW91IGhhdmUgdG8gY2FsbCBuZXcgUGxhaW5QaWNrZXIob3B0aW9ucykuaW5pdCgpO1xuICAgIGF1dG9Jbml0OiB0cnVlLFxuXG4gICAgLy8gYmluZCB0aGUgcGlja2VyIHRvIGEgZm9ybSBmaWVsZFxuICAgIGZpZWxkOiBudWxsLFxuXG4gICAgLy8gZGVmYXVsdCBgZmllbGRgIGlmIGBmaWVsZGAgaXMgc2V0XG4gICAgdHJpZ2dlcjogbnVsbCxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgc2hvdy9oaWRlIHRoZSBwaWNrZXIgb24gYGZpZWxkYCBmb2N1cyAoZGVmYXVsdCBgdHJ1ZWAgaWYgYGZpZWxkYCBpcyBzZXQpXG4gICAgYm91bmQ6IHVuZGVmaW5lZCxcblxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyLCByZWxhdGl2ZSB0byB0aGUgZmllbGQgKGRlZmF1bHQgdG8gYm90dG9tICYgbGVmdClcbiAgICAvLyAoJ2JvdHRvbScgJiAnbGVmdCcga2V5d29yZHMgYXJlIG5vdCB1c2VkLCAndG9wJyAmICdyaWdodCcgYXJlIG1vZGlmaWVyIG9uIHRoZSBib3R0b20vbGVmdCBwb3NpdGlvbilcbiAgICBwb3NpdGlvblRhcmdldDogbnVsbCxcbiAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgZml0IGluIHRoZSB2aWV3cG9ydCBldmVuIGlmIGl0IG1lYW5zIHJlcG9zaXRpb25pbmcgZnJvbSB0aGUgcG9zaXRpb24gb3B0aW9uXG4gICAgcmVwb3NpdGlvbjogdHJ1ZSxcblxuICAgIC8vIHRoZSBkZWZhdWx0IG91dHB1dCBmb3JtYXQgZm9yIGAudG9TdHJpbmcoKWAgYW5kIGBmaWVsZGAgdmFsdWVcbiAgICAvLyBhIGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIHN0cmluZyB9XG4gICAgLy8gY291bGQgYmUgZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcodGhpcy5fby5pMThuLmxhbmd1YWdlLCB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycsIHdlZWtkYXk6ICdzaG9ydCd9KVxuICAgIGZvcm1hdEZuOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICByZXR1cm4gdG9JU09EYXRlU3RyaW5nKGRhdGUpXG4gICAgfSxcblxuICAgIHBhcnNlRm46IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5wYXJzZSh2YWx1ZSkpXG4gICAgfSxcblxuICAgIC8vIHRoZSBpbml0aWFsIGRhdGUgdG8gdmlldyB3aGVuIGZpcnN0IG9wZW5lZFxuICAgIGRlZmF1bHREYXRlOiBudWxsLFxuXG4gICAgLy8gbWFrZSB0aGUgYGRlZmF1bHREYXRlYCB0aGUgaW5pdGlhbCBzZWxlY3RlZCB2YWx1ZVxuICAgIHNldERlZmF1bHREYXRlOiBmYWxzZSxcblxuICAgIC8vIGZpcnN0IGRheSBvZiB3ZWVrICgwOiBTdW5kYXksIDE6IE1vbmRheSBldGMpXG4gICAgZmlyc3REYXk6IDAsXG5cbiAgICBkaXNhYmxlRGF5Rm46IG51bGwsXG5cbiAgICBsYWJlbEZuOiBmdW5jdGlvbihkYXkpIHtcbiAgICAgIGNvbnN0IGRhdGVTdHIgPSBkYXkuZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcodGhpcy5fby5pMThuLmxhbmd1YWdlLCB7XG4gICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgbW9udGg6ICdsb25nJyxcbiAgICAgICAgZGF5OiAnbnVtZXJpYydcbiAgICAgIH0pXG4gICAgICBjb25zdCBkYXlTdHIgPSB0aGlzLl9vLmkxOG4ud2Vla2RheXNbZGF5LmRhdGUuZ2V0RGF5KCldXG4gICAgICBsZXQgdGV4dCA9IGRheVN0ciArICcsICcgKyBkYXRlU3RyXG4gICAgICBpZiAoZGF5LmlzVG9kYXkpIHtcbiAgICAgICAgdGV4dCArPSAnICgnICsgdGhpcy5fby5pMThuLnRvZGF5ICsgJyknXG4gICAgICB9XG4gICAgICBpZiAoZGF5LmlzRGlzYWJsZWQpIHtcbiAgICAgICAgdGV4dCA9ICcoJyArIHRoaXMuX28uaTE4bi5kaXNhYmxlZCArICcpICcgKyB0ZXh0XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dFxuICAgIH0sXG5cbiAgICB0ZXh0Rm46IGZ1bmN0aW9uKGRheSkge1xuICAgICAgY29uc3QgdGV4dCA9IGRheS5kYXlcbiAgICAgIHJldHVybiB0ZXh0XG4gICAgfSxcblxuICAgIC8vIHRoZSBtaW5pbXVtL2VhcmxpZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtaW5EYXRlOiBudWxsLFxuICAgIC8vIHRoZSBtYXhpbXVtL2xhdGVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgbWF4RGF0ZTogbnVsbCxcblxuICAgIC8vIG51bWJlciBvZiB5ZWFycyBlaXRoZXIgc2lkZSwgb3IgYXJyYXkgb2YgdXBwZXIvbG93ZXIgcmFuZ2VcbiAgICB5ZWFyUmFuZ2U6IDEwLFxuXG4gICAgLy8gc2hvdyB3ZWVrIG51bWJlcnMgYXQgaGVhZCBvZiByb3dcbiAgICBzaG93V2Vla051bWJlcjogZmFsc2UsXG5cbiAgICAvLyB1c2VkIGludGVybmFsbHkgKGRvbid0IGNvbmZpZyBvdXRzaWRlKVxuICAgIG1pblllYXI6IDAsXG4gICAgbWF4WWVhcjogOTk5OSxcbiAgICBtaW5Nb250aDogdW5kZWZpbmVkLFxuICAgIG1heE1vbnRoOiB1bmRlZmluZWQsXG5cbiAgICBzdGFydFJhbmdlOiBudWxsLFxuICAgIGVuZFJhbmdlOiBudWxsLFxuXG4gICAgaXNSVEw6IGZhbHNlLFxuXG4gICAgLy8gQWRkaXRpb25hbCB0ZXh0IHRvIGFwcGVuZCB0byB0aGUgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICB5ZWFyU3VmZml4OiAnJyxcblxuICAgIC8vIFJlbmRlciB0aGUgbW9udGggYWZ0ZXIgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICBzaG93TW9udGhBZnRlclllYXI6IGZhbHNlLFxuXG4gICAgLy8gUmVuZGVyIGRheXMgb2YgdGhlIGNhbGVuZGFyIGdyaWQgdGhhdCBmYWxsIGluIHRoZSBuZXh0IG9yIHByZXZpb3VzIG1vbnRoXG4gICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBpbnRlcm5hdGlvbmFsaXphdGlvblxuICAgIGkxOG46IHtcbiAgICAgIGxhbmd1YWdlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJykuZ2V0QXR0cmlidXRlKCdsYW5nJykgfHwgdW5kZWZpbmVkLFxuICAgICAgdG9kYXk6ICdUb2RheScsXG4gICAgICBkaXNhYmxlZDogJ0Rpc2FibGVkJyxcbiAgICAgIGhlbHA6ICdVc2UgYXJyb3cga2V5cyB0byBjaG9vc2UgYSBkYXRlLicsXG5cbiAgICAgIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXG4gICAgICB3ZWVrZGF5czogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgICAgd2Vla2RheXNTaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXVxuICAgIH0sXG5cbiAgICAvLyBUaGVtZSBDbGFzc25hbWVcbiAgICB0aGVtZTogbnVsbCxcblxuICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgb25TZWxlY3Q6IG51bGwsXG4gICAgb25PcGVuOiBudWxsLFxuICAgIG9uQ2xvc2U6IG51bGwsXG4gICAgb25EcmF3OiBudWxsXG4gIH1cblxuICAvKipcbiAgICogdGVtcGxhdGluZyBmdW5jdGlvbnMgdG8gYWJzdHJhY3QgSFRNTCByZW5kZXJpbmdcbiAgICovXG4gIGNvbnN0IHJlbmRlckRheU5hbWUgPSBmdW5jdGlvbihvcHRzLCBkYXksIGFiYnIpIHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICBsZXQgYXJyID0gW11cbiAgICBsZXQgYXJpYVNlbGVjdGVkID0gJ2ZhbHNlJ1xuICAgIGNvbnN0IGFyaWFMYWJlbCA9IG9wdHMubGFiZWwgfHwgJydcbiAgICBjb25zdCB0YWJpbmRleCA9IG9wdHMudGFiaW5kZXhcbiAgICBpZiAob3B0cy5pc0VtcHR5KSB7XG4gICAgICBpZiAob3B0cy5zaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgIGFyci5wdXNoKCdpcy1vdXRzaWRlLWN1cmVudC1tb250aCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImlzLWVtcHR5XCI+PC90ZD4nXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRzLmlzRGlzYWJsZWQpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1kaXNhYmxlZCcpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzVG9kYXkpIHtcbiAgICAgIGFyci5wdXNoKCdpcy10b2RheScpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzU2VsZWN0ZWQpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zZWxlY3RlZCcpXG4gICAgICBhcmlhU2VsZWN0ZWQgPSAndHJ1ZSdcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNJblJhbmdlKSB7XG4gICAgICBhcnIucHVzaCgnaXMtaW5yYW5nZScpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzU3RhcnRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXN0YXJ0cmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc0VuZFJhbmdlKSB7XG4gICAgICBhcnIucHVzaCgnaXMtZW5kcmFuZ2UnKVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgJzx0ZCBkYXRhLWRheT1cIicgK1xuICAgICAgb3B0cy5kYXkgK1xuICAgICAgJ1wiIGNsYXNzPVwiJyArXG4gICAgICBhcnIuam9pbignICcpICtcbiAgICAgICdcIj4nICtcbiAgICAgICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fYnV0dG9uIGRhdGVwaWNrZXJfX2RheVwiIHR5cGU9XCJidXR0b25cIiAnICtcbiAgICAgICdkYXRhLWRhdGVwaWNrZXIteWVhcj1cIicgK1xuICAgICAgb3B0cy55ZWFyICtcbiAgICAgICdcIiBkYXRhLWRhdGVwaWNrZXItbW9udGg9XCInICtcbiAgICAgIG9wdHMubW9udGggK1xuICAgICAgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIiBhcmlhLXNlbGVjdGVkPVwiJyArXG4gICAgICBhcmlhU2VsZWN0ZWQgK1xuICAgICAgJ1wiIGFyaWEtbGFiZWw9XCInICtcbiAgICAgIGFyaWFMYWJlbCArXG4gICAgICAnXCIgdGFiaW5kZXg9XCInICtcbiAgICAgIHRhYmluZGV4ICtcbiAgICAgICdcIj4nICtcbiAgICAgIG9wdHMudGV4dCArXG4gICAgICAnPC9idXR0b24+JyArXG4gICAgICAnPC90ZD4nXG4gICAgKVxuICB9XG5cbiAgY29uc3QgcmVuZGVyV2VlayA9IGZ1bmN0aW9uKGQsIG0sIHkpIHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKChuZXcgRGF0ZSh5LCBtLCBkKSAtIG9uZWphbikgLyA4NjQwMDAwMCArIG9uZWphbi5nZXREYXkoKSArIDEpIC8gNylcbiAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImRhdGVwaWNrZXJfX3dlZWtcIj4nICsgd2Vla051bSArICc8L3RkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclJvdyA9IGZ1bmN0aW9uKGRheXMsIGlzUlRMKSB7XG4gICAgcmV0dXJuICc8dHI+JyArIChpc1JUTCA/IGRheXMucmV2ZXJzZSgpIDogZGF5cykuam9pbignJykgKyAnPC90cj4nXG4gIH1cblxuICBjb25zdCByZW5kZXJCb2R5ID0gZnVuY3Rpb24ocm93cykge1xuICAgIHJldHVybiAnPHRib2R5PicgKyByb3dzLmpvaW4oJycpICsgJzwvdGJvZHk+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICBsZXQgaVxuICAgIGxldCBhcnIgPSBbXVxuICAgIGlmIChvcHRzLnNob3dXZWVrTnVtYmVyKSB7XG4gICAgICBhcnIucHVzaCgnPHRoPjwvdGg+JylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzx0aCBzY29wZT1cImNvbFwiPjxhYmJyIHRpdGxlPVwiJyArIHJlbmRlckRheU5hbWUob3B0cywgaSkgKyAnXCI+JyArIHJlbmRlckRheU5hbWUob3B0cywgaSwgdHJ1ZSkgKyAnPC9hYmJyPjwvdGg+JylcbiAgICB9XG4gICAgcmV0dXJuICc8dGhlYWQgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHRyPicgKyAob3B0cy5pc1JUTCA/IGFyci5yZXZlcnNlKCkgOiBhcnIpLmpvaW4oJycpICsgJzwvdHI+PC90aGVhZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJUaXRsZSA9IGZ1bmN0aW9uKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGl0bGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj4nXG4gICAgbGV0IG1vbnRoSHRtbFxuICAgIGxldCB5ZWFySHRtbFxuICAgIGxldCBwcmV2ID0gdHJ1ZVxuICAgIGxldCBuZXh0ID0gdHJ1ZVxuXG4gICAgZm9yIChhcnIgPSBbXSwgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBhcnIucHVzaChcbiAgICAgICAgJzxvcHRpb24gdmFsdWU9XCInICtcbiAgICAgICAgICAoeWVhciA9PT0gcmVmWWVhciA/IGkgLSBjIDogMTIgKyBpIC0gYykgK1xuICAgICAgICAgICdcIicgK1xuICAgICAgICAgIChpID09PSBtb250aCA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArXG4gICAgICAgICAgKChpc01pblllYXIgJiYgaSA8IG9wdHMubWluTW9udGgpIHx8IChpc01heFllYXIgJiYgaSA+IG9wdHMubWF4TW9udGgpID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJykgK1xuICAgICAgICAgICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArXG4gICAgICAgICAgJzwvb3B0aW9uPidcbiAgICAgIClcbiAgICB9XG5cbiAgICBtb250aEh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgYXJyLmpvaW4oJycpICtcbiAgICAgICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikge1xuICAgICAgICBhcnIucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiJyArIChpID09PSB5ZWFyID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICsgJz4nICsgaSArICc8L29wdGlvbj4nKVxuICAgICAgfVxuICAgIH1cbiAgICB5ZWFySHRtbCA9XG4gICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xhYmVsXCI+JyArXG4gICAgICB5ZWFyICtcbiAgICAgIG9wdHMueWVhclN1ZmZpeCArXG4gICAgICAnPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXJfX3NlbGVjdCBkYXRlcGlja2VyX19zZWxlY3QteWVhclwiIHRhYmluZGV4PVwiLTFcIj4nICtcbiAgICAgIGFyci5qb2luKCcnKSArXG4gICAgICAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKG9wdHMuc2hvd01vbnRoQWZ0ZXJZZWFyKSB7XG4gICAgICBodG1sICs9IHllYXJIdG1sICsgbW9udGhIdG1sXG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgKz0gbW9udGhIdG1sICsgeWVhckh0bWxcbiAgICB9XG5cbiAgICBpZiAoaXNNaW5ZZWFyICYmIChtb250aCA9PT0gMCB8fCBvcHRzLm1pbk1vbnRoID49IG1vbnRoKSkge1xuICAgICAgcHJldiA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGlzTWF4WWVhciAmJiAobW9udGggPT09IDExIHx8IG9wdHMubWF4TW9udGggPD0gbW9udGgpKSB7XG4gICAgICBuZXh0ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoYyA9PT0gMCkge1xuICAgICAgaHRtbCArPVxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX3ByZXYnICtcbiAgICAgICAgKHByZXYgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArXG4gICAgICAgICdcIiAnICtcbiAgICAgICAgKHByZXYgPyAnJyA6ICdkaXNhYmxlZCAnKSArXG4gICAgICAgICd0eXBlPVwiYnV0dG9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArXG4gICAgICAgIHJhbmRJZCArXG4gICAgICAgICdcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICAgIG9wdHMuaTE4bi5wcmV2aW91c01vbnRoICtcbiAgICAgICAgJzwvYnV0dG9uPidcbiAgICB9XG4gICAgaWYgKGMgPT09IGluc3RhbmNlLl9vLm51bWJlck9mTW9udGhzIC0gMSkge1xuICAgICAgaHRtbCArPVxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX25leHQnICtcbiAgICAgICAgKG5leHQgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArXG4gICAgICAgICdcIiAnICtcbiAgICAgICAgKG5leHQgPyAnJyA6ICdkaXNhYmxlZCAnKSArXG4gICAgICAgICd0eXBlPVwiYnV0dG9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArXG4gICAgICAgIHJhbmRJZCArXG4gICAgICAgICdcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICAgIG9wdHMuaTE4bi5uZXh0TW9udGggK1xuICAgICAgICAnPC9idXR0b24+J1xuICAgIH1cblxuICAgIGh0bWwgKz0gJzwvZGl2PidcblxuICAgIHJldHVybiBodG1sXG4gIH1cblxuICBjb25zdCByZW5kZXJUYWJsZSA9IGZ1bmN0aW9uKG9wdHMsIGRhdGEsIHJhbmRJZCkge1xuICAgIHJldHVybiAoXG4gICAgICAnPHRhYmxlIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGFibGVcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+JyArXG4gICAgICByZW5kZXJIZWFkKG9wdHMpICtcbiAgICAgIHJlbmRlckJvZHkoZGF0YSkgK1xuICAgICAgJzwvdGFibGU+J1xuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGFpblBpY2tlciBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3QgUGxhaW5QaWNrZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICBjb25zdCBvcHRzID0gc2VsZi5jb25maWcob3B0aW9ucylcblxuICAgIHNlbGYuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoIXNlbGYuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3YgJiYgY29uc29sZS5sb2coJ0hpZGluZyBzb29uIGJlY2F1c2UgZGF0ZSBoYXMgYmVlbiBzZWxlY3RlZCBhbmQgcGlja2VyIGlzIGJvdW5kLicpXG4gICAgICAgICAgICBzZWxmLmhpZGVBZnRlcigyMDApXG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYuc2V0RGF0ZShcbiAgICAgICAgICAgIG5ldyBEYXRlKFxuICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXIteWVhcicpLFxuICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItbW9udGgnKSxcbiAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3ByZXYnKSkge1xuICAgICAgICAgIHNlbGYucHJldk1vbnRoKClcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19uZXh0JykpIHtcbiAgICAgICAgICBzZWxmLm5leHRNb250aCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0JykpIHtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlLnJldHVyblZhbHVlID0gZmFsc2VcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5fYyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9vbkNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QtbW9udGgnKSkge1xuICAgICAgICBzZWxmLmdvdG9Nb250aCh0YXJnZXQudmFsdWUpXG4gICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC15ZWFyJykpIHtcbiAgICAgICAgc2VsZi5nb3RvWWVhcih0YXJnZXQudmFsdWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25LZXlDaGFuZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcblxuICAgICAgZnVuY3Rpb24gY2FwdHVyZUtleSgpIHtcbiAgICAgICAgc2VsZi5oYXNLZXkgPSB0cnVlXG4gICAgICAgIHN0b3BFdmVudCgpXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHN0b3BFdmVudCgpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIDkgLyogVEFCICovOlxuICAgICAgICAgICAgaWYgKHNlbGYuaGFzS2V5ICYmIHNlbGYuX28udHJpZ2dlcikge1xuICAgICAgICAgICAgICBzZWxmLl9vLnRyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgICAgICBzZWxmLmhhc0tleSA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzI6IC8qIFNQQUNFICovXG4gICAgICAgICAgY2FzZSAxMyAvKiBFTlRFUiAqLzpcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0tleSAmJiAhb3B0cy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgc3RvcEV2ZW50KClcbiAgICAgICAgICAgICAgaWYgKHNlbGYuX28udHJpZ2dlcikge1xuICAgICAgICAgICAgICAgIHNlbGYuX28udHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX28udHJpZ2dlci5zZWxlY3QoKVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAyNyAvKiBFU0NBUEUgKi86XG4gICAgICAgICAgICBpZiAoIW9wdHMuY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgIHN0b3BFdmVudCgpXG4gICAgICAgICAgICAgIHNlbGYuY2FuY2VsKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzNyAvKiBMRUZUICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoLTEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzggLyogVVAgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgtNylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzOSAvKiBSSUdIVCAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCsxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDQwIC8qIERPV04gKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgrNylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzMyAvKiBQQUdFX1VQICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdE1vbnRoKC0xKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM0IC8qIFBBR0VfRE9XTiAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3RNb250aCgrMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzNSAvKiBFTkQgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0WWVhcigrMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzNiAvKiBIT01FICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdFllYXIoLTEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmZpcmVkQnkgPT09IHNlbGYpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLmZpZWxkLnZhbHVlKVxuXG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5zZXREYXRlKG51bGwpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25Ub3VjaCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoIXNlbGYuaXNWaXNpYmxlKCkgfHwgZXZlbnQudGFyZ2V0ICE9PSBvcHRzLmZpZWxkKSB7XG4gICAgICAgIHNlbGYudG91Y2hlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Rm9jdXMgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKHNlbGYudG91Y2hlZCAmJiBvcHRzLmZpZWxkICYmIG9wdHMuZmllbGQubm9kZU5hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgc2VsZi50b3VjaGVkID0gZmFsc2VcbiAgICAgICAgc2VsZi5mb2N1c0luc2lkZSA9IHRydWVcbiAgICAgIH1cbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHNlbGYudG91Y2hlZCA9IGZhbHNlXG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRCbHVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChzZWxmLmhhc0tleSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IHBFbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSB8fCBwRWwgPT09IHNlbGYuZWwpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHRoaXMuX3YgJiYgbG9nKCdIaWRpbmcgc29vbiBiZWNhdXNlIGlucHV0IHdhcyBibHVyZWQnLCBldmVudC50YXJnZXQsIHNlbGYuX2IpXG4gICAgICAgIHNlbGYuaGlkZSh0cnVlKVxuICAgICAgfVxuICAgICAgc2VsZi5fYyA9IGZhbHNlXG4gICAgfVxuXG4gICAgc2VsZi5fb25Eb2N1bWVudENsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGxldCBwRWwgPSB0YXJnZXRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGNvbnRhaW5zRWxlbWVudChzZWxmLmVsLCB0YXJnZXQpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFoYXNFdmVudExpc3RlbmVycyAmJiBoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QnKSkge1xuICAgICAgICBpZiAoIXRhcmdldC5vbmNoYW5nZSkge1xuICAgICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ29uY2hhbmdlJywgJ3JldHVybjsnKVxuICAgICAgICAgIGFkZEV2ZW50KHRhcmdldCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcbiAgICAgIGlmIChzZWxmLl92ICYmIHRhcmdldCAhPT0gb3B0cy50cmlnZ2VyICYmIHBFbCAhPT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgIHNlbGYuaGlkZSh0cnVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdiA9IGZhbHNlXG5cbiAgICAgIHNlbGYuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgc2VsZi5lbC5jbGFzc05hbWUgPSAnZGF0ZXBpY2tlcicgKyAob3B0cy5pc1JUTCA/ICcgaXMtcnRsJyA6ICcnKSArIChvcHRzLnRoZW1lID8gJyAnICsgb3B0cy50aGVtZSA6ICcnKVxuICAgICAgc2VsZi5lbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYXBwbGljYXRpb24nKVxuICAgICAgc2VsZi5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBzZWxmLmdldExhYmVsKCkpXG5cbiAgICAgIHNlbGYuc3BlYWtFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBzZWxmLnNwZWFrRWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3N0YXR1cycpXG4gICAgICBzZWxmLnNwZWFrRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnYXNzZXJ0aXZlJylcbiAgICAgIHNlbGYuc3BlYWtFbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtYXRvbWljJywgJ3RydWUnKVxuICAgICAgc2VsZi5zcGVha0VsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAncG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAtOTk5OXB4OyBvcGFjaXR5OiAwOycpXG5cbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdtb3VzZWRvd24nLCBzZWxmLl9vbkNsaWNrLCB0cnVlKVxuICAgICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25DbGljaywgdHJ1ZSlcbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdjaGFuZ2UnLCBzZWxmLl9vbkNoYW5nZSlcbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdrZXlkb3duJywgc2VsZi5fb25LZXlDaGFuZ2UpXG5cbiAgICAgIGlmIChvcHRzLmZpZWxkKSB7XG4gICAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICAgIGlmICghb3B0cy5kZWZhdWx0RGF0ZSkge1xuICAgICAgICAgIG9wdHMuZGVmYXVsdERhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLmZpZWxkLnZhbHVlKVxuICAgICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGRlZkRhdGUgPSBvcHRzLmRlZmF1bHREYXRlXG5cbiAgICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgICAgaWYgKG9wdHMuc2V0RGVmYXVsdERhdGUpIHtcbiAgICAgICAgICBzZWxmLnNldERhdGUoZGVmRGF0ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmdvdG9EYXRlKGRlZkRhdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZkRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIGlmIChvcHRzLm1pbkRhdGUgJiYgb3B0cy5taW5EYXRlID4gZGVmRGF0ZSkge1xuICAgICAgICAgIGRlZkRhdGUgPSBvcHRzLm1pbkRhdGVcbiAgICAgICAgfSBlbHNlIGlmIChvcHRzLm1heERhdGUgJiYgb3B0cy5tYXhEYXRlIDwgZGVmRGF0ZSkge1xuICAgICAgICAgIGRlZkRhdGUgPSBvcHRzLm1heERhdGVcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmdvdG9EYXRlKGRlZkRhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICAgIHNlbGYuZWwuY2xhc3NOYW1lICs9ICcgaXMtYm91bmQnXG4gICAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2NsaWNrJywgc2VsZi5fb25JbnB1dENsaWNrKVxuICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ3RvdWNoc3RhcnQnLCBzZWxmLl9vblRvdWNoKVxuICAgICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnYmx1cicsIHNlbGYuX29uSW5wdXRCbHVyKVxuICAgICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdrZXlkb3duJywgc2VsZi5fb25LZXlDaGFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNob3coKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXRFdmVudCgnaW5pdCcpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYXV0b0luaXQpIHtcbiAgICAgIHRoaXMuaW5pdCgpXG4gICAgfVxuICB9XG5cbiAgUGxhaW5QaWNrZXIuRXZFbWl0dGVyID0gRXZFbWl0dGVyXG5cbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBzZXRUb1N0YXJ0T2ZEYXkobm93KVxuXG4gIC8qKlxuICAgKiBwdWJsaWMgUGxhaW5QaWNrZXIgQVBJXG4gICAqL1xuXG4gIFBsYWluUGlja2VyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBjb25maWd1cmUgZnVuY3Rpb25hbGl0eVxuICAgICAqL1xuICAgIGNvbmZpZzogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgaWYgKCF0aGlzLl9vKSB7XG4gICAgICAgIHRoaXMuX28gPSBleHRlbmQoe30sIGRlZmF1bHRzLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRzID0gZXh0ZW5kKHRoaXMuX28sIG9wdGlvbnMsIHRydWUpXG5cbiAgICAgIG9wdHMuaXNSVEwgPSAhIW9wdHMuaXNSVExcblxuICAgICAgb3B0cy5maWVsZCA9IG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSA/IG9wdHMuZmllbGQgOiBudWxsXG5cbiAgICAgIG9wdHMudGhlbWUgPSB0eXBlb2Ygb3B0cy50aGVtZSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSBvcHRzLnRyaWdnZXIgJiYgb3B0cy50cmlnZ2VyLm5vZGVOYW1lID8gb3B0cy50cmlnZ2VyIDogb3B0cy5maWVsZFxuXG4gICAgICBvcHRzLmRpc2FibGVXZWVrZW5kcyA9ICEhb3B0cy5kaXNhYmxlV2Vla2VuZHNcblxuICAgICAgb3B0cy5kaXNhYmxlRGF5Rm4gPSB0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4gPT09ICdmdW5jdGlvbicgPyBvcHRzLmRpc2FibGVEYXlGbiA6IG51bGxcblxuICAgICAgb3B0cy5sYWJlbEZuID0gdHlwZW9mIG9wdHMubGFiZWxGbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wdHMubGFiZWxGbiA6IG51bGxcblxuICAgICAgY29uc3Qgbm9tID0gcGFyc2VJbnQob3B0cy5udW1iZXJPZk1vbnRocywgMTApIHx8IDFcbiAgICAgIG9wdHMubnVtYmVyT2ZNb250aHMgPSBub20gPiA0ID8gNCA6IG5vbVxuXG4gICAgICBvcHRzLm1pbkRhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLm1pbkRhdGUpXG4gICAgICBvcHRzLm1heERhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLm1heERhdGUpXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1pbkRhdGUpKSB7XG4gICAgICAgIG9wdHMubWluRGF0ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1heERhdGUpKSB7XG4gICAgICAgIG9wdHMubWF4RGF0ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAob3B0cy5taW5EYXRlICYmIG9wdHMubWF4RGF0ZSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBldmVudFRlc3QgPSAvXm9uKFtBLVpdXFx3KykkL1xuICAgICAgT2JqZWN0LmtleXMob3B0cykuZm9yRWFjaChcbiAgICAgICAgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goZXZlbnRUZXN0KVxuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIHRoaXMub24odHlwZSwgb3B0c1trZXldKVxuICAgICAgICAgICAgZGVsZXRlIG9wdHNba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApXG5cbiAgICAgIHJldHVybiBvcHRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28uZm9ybWF0Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX28uZm9ybWF0Rm4uY2FsbCh0aGlzLCB0aGlzLl9kKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHdpdGggZmFsbGJhY2sgZm9yIHRoZSBjdXJyZW50IGRhdGVcbiAgICAgKi9cbiAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBuZXcgRGF0ZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldFNlbGVjdGVkRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaXNEYXRlKHRoaXMuX2QpID8gbmV3IERhdGUodGhpcy5fZC5nZXRUaW1lKCkpIDogbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBEYXRlIG9iamVjdCBvZiB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBnZXRWaXNpYmxlRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbihkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aGlzLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB7ZmlyZWRCeTogdGhpc30pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoZGF0ZSlcblxuICAgICAgY29uc3QgbWluID0gdGhpcy5fby5taW5EYXRlXG4gICAgICBjb25zdCBtYXggPSB0aGlzLl9vLm1heERhdGVcblxuICAgICAgaWYgKGlzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcbiAgICAgICAgZGF0ZSA9IG1pblxuICAgICAgfSBlbHNlIGlmIChpc0RhdGUobWF4KSAmJiBkYXRlID4gbWF4KSB7XG4gICAgICAgIGRhdGUgPSBtYXhcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZURhdGVzRXF1YWwodGhpcy5fZCwgZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSlcbiAgICAgIHNldFRvU3RhcnRPZkRheSh0aGlzLl9kKVxuICAgICAgdGhpcy5nb3RvRGF0ZSh0aGlzLl9kKVxuXG4gICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICB0aGlzLl9vLmZpZWxkLnZhbHVlID0gdGhpcy50b1N0cmluZygpXG4gICAgICAgIGZpcmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywge2ZpcmVkQnk6IHRoaXN9KVxuICAgICAgfVxuICAgICAgaWYgKCFwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3NlbGVjdCcsIFt0aGlzLmdldERhdGUoKV0pXG4gICAgICB9XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuICAgIH0sXG5cbiAgICBzZWxlY3REYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB0aGlzLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICh0aGlzLl9kKSB7XG4gICAgICAgIHRoaXMuc3BlYWsodGhpcy5nZXREYXlDb25maWcodGhpcy5fZCkubGFiZWwpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldExhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBsYWJlbCA9ICcnXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuXG4gICAgICBpZiAob3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLmlkKSB7XG4gICAgICAgIGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIG9wdHMuZmllbGQuaWQgKyAnXCJdJylcbiAgICAgICAgbGFiZWwgPSBsYWJlbCA/IGxhYmVsLnRleHRDb250ZW50IHx8IGxhYmVsLmlubmVyVGV4dCA6ICcnXG4gICAgICB9XG5cbiAgICAgIGlmICghbGFiZWwgJiYgb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgIGxhYmVsID0gb3B0cy50cmlnZ2VyLnRleHRDb250ZW50IHx8IG9wdHMudHJpZ2dlci5pbm5lclRleHRcbiAgICAgIH1cblxuICAgICAgbGFiZWwgKz0gJyAoJyArIG9wdHMuaTE4bi5oZWxwICsgJyknXG5cbiAgICAgIHJldHVybiBsYWJlbFxuICAgIH0sXG5cbiAgICBzcGVhazogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgdGhpcy5zcGVhay5pbm5lckhUTUwgPSAnJ1xuICAgICAgdGhpcy5zcGVha0VsLmlubmVySFRNTCA9IGh0bWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXG4gICAgICovXG4gICAgZ290b0RhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIGxldCBuZXdDYWxlbmRhciA9IHRydWVcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG5cbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldE1vbnRoKGxhc3RWaXNpYmxlRGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpXG4gICAgICAgIG5ld0NhbGVuZGFyID0gdmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uKGRheXMpIHtcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuZ2V0RGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cylcbiAgICAgIGNvbnN0IG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkpXG4gICAgICBuZXdEYXkuc2V0RGF0ZShuZXdEYXkuZ2V0RGF0ZSgpICsgZGlmZmVyZW5jZSlcbiAgICAgIHRoaXMuc2VsZWN0RGF0ZShuZXdEYXkpXG4gICAgfSxcblxuICAgIGFkanVzdENhbGVuZGFyczogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSBhZGp1c3RDYWxlbmRhcih0aGlzLmNhbGVuZGFyc1swXSlcbiAgICAgIGZvciAoYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIG1vbnRoICh6ZXJvLWluZGV4LCBlLmcuIDA6IEphbnVhcnkpXG4gICAgICovXG4gICAgZ290b01vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS1cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBmdWxsIHllYXIgKGUuZy4gXCIyMDEyXCIpXG4gICAgICovXG4gICAgZ290b1llYXI6IGZ1bmN0aW9uKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgICAgY29uc3QgZCA9IHRoaXMuX28ucGFyc2VGbi5jYWxsKHNlbGYsIHZhbHVlKVxuXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkZWZhdWx0cy5taW5EYXRlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGRlZmF1bHRzLm1pblllYXJcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IGRlZmF1bHRzLm1pbk1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBjb25zdCBkID0gdGhpcy5fby5wYXJzZUZuLmNhbGwoc2VsZiwgdmFsdWUpXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5zdGFydFJhbmdlLCB2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3N0YXJ0cmFuZ2UnLCBbdGhpcy5fby5zdGFydFJhbmdlXSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5lbmRSYW5nZSwgdmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnZW5kcmFuZ2UnLCBbdGhpcy5fby5lbmRSYW5nZV0pXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fby5zdGFydFJhbmdlXG4gICAgfSxcblxuICAgIGdldEVuZFJhbmdlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX28uZW5kUmFuZ2VcbiAgICB9LFxuXG4gICAgX3JlcXVlc3Q6IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgaWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlcXVlc3RlZCkge1xuICAgICAgICAgIHRoaXMucmVxdWVzdGVkID0ge1xuICAgICAgICAgICAgcmVxdWVzdDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYucmVxdWVzdGVkLmRyYXcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kcmF3KClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc2VsZi5yZXF1ZXN0ZWQuYWRqdXN0UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5mb2N1c1BpY2tlcigpXG4gICAgICAgICAgICAgIHNlbGYucmVxdWVzdGVkID0gbnVsbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXF1ZXN0ZWRbYWN0aW9uXSA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbJ18nICsgYWN0aW9uXSgpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlcXVlc3QgcmVmcmVzaGluZyBIVE1MXG4gICAgICogKHVzZXMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlmIGF2YWlsYWJsZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlKVxuICAgICAqL1xuICAgIGRyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5fZHJhdyhmb3JjZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QoJ2RyYXcnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgX2RyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIC8vIHZhciBzZWxmID0gdGhpc1xuICAgICAgY29uc3QgbWluWWVhciA9IG9wdHMubWluWWVhclxuICAgICAgY29uc3QgbWF4WWVhciA9IG9wdHMubWF4WWVhclxuICAgICAgY29uc3QgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICBjb25zdCBtYXhNb250aCA9IG9wdHMubWF4TW9udGhcbiAgICAgIGxldCBodG1sID0gJydcbiAgICAgIGxldCByYW5kSWRcblxuICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWluWWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3kgPj0gbWF4WWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWF4WWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlcl9fdGl0bGUtJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgJycpLnN1YnN0cigwLCAyKVxuXG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0TGFiZWwoKVxuXG4gICAgICBpZiAodGhpcy5fby5maWVsZCAmJiB0aGlzLl9vLnRyaWdnZXIgPT09IHRoaXMuX28uZmllbGQgJiYgb3B0cy5ib3VuZCkge1xuICAgICAgICB0aGlzLl9vLmZpZWxkLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKVxuICAgICAgfVxuXG4gICAgICBsZXQgY1xuICAgICAgZm9yIChjID0gMDsgYyA8IG9wdHMubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICBodG1sICs9XG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sZW5kYXJcIj4nICtcbiAgICAgICAgICByZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArXG4gICAgICAgICAgdGhpcy5yZW5kZXIodGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHJhbmRJZCkgK1xuICAgICAgICAgICc8L2Rpdj4nXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICBsZXQgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZC5pcy1zZWxlY3RlZCA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZC5pcy10b2RheSA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgfVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZDpub3QoLmlzLWRpc2FibGVkKSA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgfVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fYnV0dG9uJylcbiAgICAgIH1cbiAgICAgIGF1dG9mb2N1cy5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKVxuXG4gICAgICB0aGlzLmVtaXRFdmVudCgnZHJhdycpXG4gICAgfSxcblxuICAgIGZvY3VzUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuXG4gICAgICBpZiAoIXRoaXMuaGFzS2V5ICYmICF0aGlzLmZvY3VzSW5zaWRlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBzZWxmLmVsLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlcGlja2VyX19idXR0b25bdGFiaW5kZXg9XCIwXCJdJykuZm9jdXMoKVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICBpZiAob3B0cy5maWVsZC50eXBlICE9PSAnaGlkZGVuJykge1xuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5lbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fYnV0dG9uW3RhYmluZGV4PVwiMFwiXScpLmZvY3VzKClcbiAgICAgICAgICB9LCAxKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZm9jdXNJbnNpZGUgPSBmYWxzZVxuICAgIH0sXG5cbiAgICBhZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXF1ZXN0KCdhZGp1c3RQb3NpdGlvbicpXG4gICAgfSxcblxuICAgIF9hZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgbGVmdFxuICAgICAgbGV0IHRvcFxuICAgICAgbGV0IGNsaWVudFJlY3RcblxuICAgICAgaWYgKHRoaXMuX28uY29udGFpbmVyKSByZXR1cm5cblxuICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLl9vLnBvc2l0aW9uVGFyZ2V0IHx8IHRoaXMuX28udHJpZ2dlclxuICAgICAgbGV0IHBFbCA9IGZpZWxkXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZWwub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcblxuICAgICAgaWYgKHR5cGVvZiBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2xpZW50UmVjdCA9IGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGxlZnQgPSBjbGllbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXRcbiAgICAgICAgdG9wID0gY2xpZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZnQgPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICB0b3AgPSBwRWwub2Zmc2V0VG9wICsgcEVsLm9mZnNldEhlaWdodFxuICAgICAgICB3aGlsZSAoKHBFbCA9IHBFbC5vZmZzZXRQYXJlbnQpKSB7XG4gICAgICAgICAgbGVmdCArPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICAgIHRvcCArPSBwRWwub2Zmc2V0VG9wXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGhhbGlnbiA9IDBcbiAgICAgIGlmICh0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSkge1xuICAgICAgICBoYWxpZ24gPSAxXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICBoYWxpZ24gPSAwLjVcbiAgICAgIH1cblxuICAgICAgbGVmdCAtPSAod2lkdGggLSBmaWVsZC5vZmZzZXRXaWR0aCkgKiBoYWxpZ25cblxuICAgICAgaWYgKHRoaXMuX28ucmVwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBvdmVyZmxvdyA9IHtcbiAgICAgICAgICByaWdodDogTWF0aC5tYXgoMCwgbGVmdCArIHdpZHRoIC0gKHZpZXdwb3J0V2lkdGggLSAyMCkpLFxuICAgICAgICAgIGxlZnQ6IE1hdGgubWF4KDAsIDIwIC0gbGVmdCksXG4gICAgICAgICAgdG9wOiBNYXRoLm1heCgwLCAtdG9wKVxuICAgICAgICB9XG4gICAgICAgIGxlZnQgKz0gb3ZlcmZsb3cubGVmdCAtIG92ZXJmbG93LnJpZ2h0XG4gICAgICAgIHRvcCArPSBvdmVyZmxvdy50b3BcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCdcbiAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgIH0sXG5cbiAgICBnZXREYXlDb25maWc6IGZ1bmN0aW9uKGRheSkge1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc0RhdGUodGhpcy5fZCkgPyBhcmVEYXRlc0VxdWFsKGRheSwgdGhpcy5fZCkgOiBmYWxzZVxuICAgICAgY29uc3QgaXNUb2RheSA9IGFyZURhdGVzRXF1YWwoZGF5LCBub3cpXG4gICAgICBjb25zdCBkYXlOdW1iZXIgPSBkYXkuZ2V0RGF0ZSgpXG4gICAgICBjb25zdCBtb250aE51bWJlciA9IGRheS5nZXRNb250aCgpXG4gICAgICBjb25zdCB5ZWFyTnVtYmVyID0gZGF5LmdldEZ1bGxZZWFyKClcbiAgICAgIGNvbnN0IGlzU3RhcnRSYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBhcmVEYXRlc0VxdWFsKG9wdHMuc3RhcnRSYW5nZSwgZGF5KVxuICAgICAgY29uc3QgaXNFbmRSYW5nZSA9IG9wdHMuZW5kUmFuZ2UgJiYgYXJlRGF0ZXNFcXVhbChvcHRzLmVuZFJhbmdlLCBkYXkpXG4gICAgICBjb25zdCBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgY29uc3QgaXNEaXNhYmxlZCA9XG4gICAgICAgIChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxuICAgICAgICAob3B0cy5tYXhEYXRlICYmIGRheSA+IG9wdHMubWF4RGF0ZSkgfHxcbiAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIGlzV2Vla2VuZChkYXkpKSB8fFxuICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4uY2FsbCh0aGlzLCBkYXkpKVxuXG4gICAgICBjb25zdCBkYXlDb25maWcgPSB7XG4gICAgICAgIGRhdGU6IGRheSxcbiAgICAgICAgZGF5OiBkYXlOdW1iZXIsXG4gICAgICAgIG1vbnRoOiBtb250aE51bWJlcixcbiAgICAgICAgeWVhcjogeWVhck51bWJlcixcbiAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgaXNUb2RheTogaXNUb2RheSxcbiAgICAgICAgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCxcbiAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXG4gICAgICAgIGlzRW5kUmFuZ2U6IGlzRW5kUmFuZ2UsXG4gICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxuICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHNcbiAgICAgIH1cblxuICAgICAgZGF5Q29uZmlnLnRleHQgPSBvcHRzLnRleHRGbiA/IG9wdHMudGV4dEZuLmNhbGwodGhpcywgZGF5Q29uZmlnKSA6IGRheU51bWJlclxuICAgICAgZGF5Q29uZmlnLmxhYmVsID0gb3B0cy5sYWJlbEZuID8gb3B0cy5sYWJlbEZuLmNhbGwodGhpcywgZGF5Q29uZmlnKSA6IGRheS50b0RhdGVTdHJpbmcoKVxuXG4gICAgICByZXR1cm4gZGF5Q29uZmlnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbmRlciBIVE1MIGZvciBhIHBhcnRpY3VsYXIgbW9udGhcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBkYXlzID0gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpXG4gICAgICBsZXQgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gICAgICBsZXQgZGF0YSA9IFtdXG4gICAgICBsZXQgcm93ID0gW11cblxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcbiAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheVxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xuICAgICAgICAgIGJlZm9yZSArPSA3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNlbGxzID0gZGF5cyArIGJlZm9yZVxuICAgICAgbGV0IGFmdGVyID0gY2VsbHNcblxuICAgICAgLy8gdmFyIHNlbGVjdGVkSW5Nb250aFxuXG4gICAgICB3aGlsZSAoYWZ0ZXIgPiA3KSB7XG4gICAgICAgIGFmdGVyIC09IDdcbiAgICAgIH1cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgLy8gaWYgKHRoaXMuX2QgJiYgbmV3IERhdGUoeWVhciwgbW9udGgsIDEpIDw9IHRoaXMuX2QgJiYgbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAxKSA+IHRoaXMuX2QpIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRJbk1vbnRoID0gdGhpcy5fZFxuICAgICAgLy8gfSBlbHNlIGlmIChuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkgPD0gbm93ICYmIG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMSkgPiBub3cpIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRJbk1vbnRoID0gbm93XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBzZWxlY3RlZEluTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSlcbiAgICAgIC8vIH1cblxuICAgICAgbGV0IGksIHJcbiAgICAgIGZvciAoaSA9IDAsIHIgPSAwOyBpIDwgY2VsbHM7IGkrKykge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSlcbiAgICAgICAgY29uc3QgZGF5Q29uZmlnID0gdGhpcy5nZXREYXlDb25maWcoZGF5KVxuXG4gICAgICAgIGRheUNvbmZpZy5pc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IGRheXMgKyBiZWZvcmVcbiAgICAgICAgZGF5Q29uZmlnLnRhYmluZGV4ID0gJy0xJ1xuXG4gICAgICAgIHJvdy5wdXNoKHJlbmRlckRheShkYXlDb25maWcpKVxuXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcbiAgICAgICAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgICAgICAgcm93LnVuc2hpZnQocmVuZGVyV2VlayhpIC0gYmVmb3JlLCBtb250aCwgeWVhcikpXG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEucHVzaChyZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMKSlcbiAgICAgICAgICByb3cgPSBbXVxuICAgICAgICAgIHIgPSAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJUYWJsZShvcHRzLCBkYXRhLCByYW5kSWQpXG4gICAgfSxcblxuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmIChpc0RhdGUodGhpcy5fby5taW5EYXRlKSAmJiB0aGlzLl9kIDwgdGhpcy5fby5taW5EYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKGlzRGF0ZSh0aGlzLl9vLm1heERhdGUpICYmIHRoaXMuX2QgPiB0aGlzLl9vLm1heERhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICBpc1Zpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGlkZVRpbWVvdXQpXG5cbiAgICAgIGlmICh0aGlzLl9kKSB7XG4gICAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5fZClcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnNwZWFrRWwpXG4gICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICBpZiAob3B0cy5jb250YWluZXIpIHtcbiAgICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuICAgICAgICB9IGVsc2UgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0cy5maWVsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmVsLCBvcHRzLmZpZWxkLm5leHRTaWJsaW5nKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IHRydWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25Eb2N1bWVudENsaWNrKVxuICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgYWRkQ2xhc3ModGhpcy5fby5maWVsZCwgJ2lzLXZpc2libGUtZGF0ZXBpY2tlcicpXG4gICAgICAgICAgdGhpcy5yZWNlbnRWYWx1ZSA9IHRoaXMuX28uZmllbGQudmFsdWVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnb3BlbicpXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkICYmIHRoaXMuX28uZmllbGQgIT09IHRoaXMuX28udHJpZ2dlcikge1xuICAgICAgICAgIHRoaXMuc3BlYWsodGhpcy5nZXRMYWJlbCgpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuX28uZmllbGRcblxuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gdGhpcy5yZWNlbnRWYWx1ZVxuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgZmllbGQuc2VsZWN0KClcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB0aGlzLmhpZGUodHJ1ZSlcbiAgICB9LFxuXG4gICAgaGlkZUFmdGVyOiBmdW5jdGlvbihkZWxheSwgY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oaWRlVGltZW91dClcbiAgICAgIGlmICh0aGlzLl92ICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmhpZGVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKGNhbmNlbGxlZClcbiAgICAgICAgfSwgZGVsYXkpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uKGNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgdiA9IHRoaXMuX3ZcbiAgICAgIGlmICh2ICE9PSBmYWxzZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5oaWRlVGltZW91dClcbiAgICAgICAgdGhpcy5oYXNLZXkgPSBmYWxzZVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkRvY3VtZW50Q2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLl9vLmZpZWxkLCAnaXMtdmlzaWJsZS1kYXRlcGlja2VyJylcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIGlmICh0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92ID0gZmFsc2VcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ2Nsb3NlJylcbiAgICAgICAgaWYgKHRoaXMuc3BlYWtFbC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLnNwZWFrRWwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25DbGljaywgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uQ2xpY2ssIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAna2V5ZG93bicsIHRoaXMuX29uS2V5Q2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaClcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdmb2N1cycsIHRoaXMuX29uSW5wdXRGb2N1cylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdibHVyJywgdGhpcy5fb25JbnB1dEJsdXIpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAna2V5ZG93bicsIHRoaXMuX29uS2V5Q2hhbmdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW1pdEV2ZW50KCdkZXN0cm95JylcbiAgICAgIHRoaXMub2ZmKClcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBuYW1lIGluIEV2RW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBQbGFpblBpY2tlci5wcm90b3R5cGVbbmFtZV0gPSBFdkVtaXR0ZXIucHJvdG90eXBlW25hbWVdXG4gIH1cblxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbIkV2RW1pdHRlciIsInByb3RvIiwicHJvdG90eXBlIiwib24iLCJldmVudE5hbWUiLCJsaXN0ZW5lciIsImV2ZW50cyIsIl9ldmVudHMiLCJsaXN0ZW5lcnMiLCJpbmRleE9mIiwicHVzaCIsIm9uY2UiLCJvbmNlRXZlbnRzIiwiX29uY2VFdmVudHMiLCJvbmNlTGlzdGVuZXJzIiwib2ZmIiwibGVuZ3RoIiwiaW5kZXgiLCJzcGxpY2UiLCJlbWl0RXZlbnQiLCJhcmdzIiwiaSIsImlzT25jZSIsImFwcGx5IiwibG9nIiwiY29uc29sZSIsImFyZ3VtZW50cyIsImhhc0V2ZW50TGlzdGVuZXJzIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImRvY3VtZW50IiwiYWRkRXZlbnQiLCJlbCIsImUiLCJjYWxsYmFjayIsImNhcHR1cmUiLCJhdHRhY2hFdmVudCIsInJlbW92ZUV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwiZmlyZUV2ZW50IiwiZGF0YSIsImV2IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJleHRlbmQiLCJkaXNwYXRjaEV2ZW50IiwiY3JlYXRlRXZlbnRPYmplY3QiLCJ0cmltIiwic3RyIiwicmVwbGFjZSIsImhhc0NsYXNzIiwiY24iLCJjbGFzc05hbWUiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaXNBcnJheSIsIm9iaiIsInRlc3QiLCJPYmplY3QiLCJ0b1N0cmluZyIsImNhbGwiLCJpc0RhdGUiLCJpc05hTiIsImdldFRpbWUiLCJpc1dlZWtlbmQiLCJkYXRlIiwiZGF5IiwiZ2V0RGF5IiwiaXNMZWFwWWVhciIsInllYXIiLCJnZXREYXlzSW5Nb250aCIsIm1vbnRoIiwic2V0VG9TdGFydE9mRGF5Iiwic2V0SG91cnMiLCJhcmVEYXRlc0VxdWFsIiwiYSIsImIiLCJ0b0lTT0RhdGVTdHJpbmciLCJ5IiwiZ2V0RnVsbFllYXIiLCJtIiwiU3RyaW5nIiwiZ2V0TW9udGgiLCJkIiwiZ2V0RGF0ZSIsInRvIiwiZnJvbSIsIm92ZXJ3cml0ZSIsInByb3AiLCJoYXNQcm9wIiwidW5kZWZpbmVkIiwibm9kZU5hbWUiLCJEYXRlIiwic2xpY2UiLCJhZGp1c3RDYWxlbmRhciIsImNhbGVuZGFyIiwiTWF0aCIsImNlaWwiLCJhYnMiLCJmbG9vciIsImNvbnRhaW5zRWxlbWVudCIsImNvbnRhaW5lciIsImVsZW1lbnQiLCJwYXJlbnROb2RlIiwiZGVmYXVsdHMiLCJ2YWx1ZSIsInBhcnNlIiwiZGF0ZVN0ciIsInRvTG9jYWxlRGF0ZVN0cmluZyIsIl9vIiwiaTE4biIsImxhbmd1YWdlIiwiZGF5U3RyIiwid2Vla2RheXMiLCJ0ZXh0IiwiaXNUb2RheSIsInRvZGF5IiwiaXNEaXNhYmxlZCIsImRpc2FibGVkIiwicXVlcnlTZWxlY3RvciIsImdldEF0dHJpYnV0ZSIsInJlbmRlckRheU5hbWUiLCJvcHRzIiwiYWJiciIsImZpcnN0RGF5Iiwid2Vla2RheXNTaG9ydCIsInJlbmRlckRheSIsImFyciIsImFyaWFTZWxlY3RlZCIsImFyaWFMYWJlbCIsImxhYmVsIiwidGFiaW5kZXgiLCJpc0VtcHR5Iiwic2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsImlzU2VsZWN0ZWQiLCJpc0luUmFuZ2UiLCJpc1N0YXJ0UmFuZ2UiLCJpc0VuZFJhbmdlIiwiam9pbiIsInJlbmRlcldlZWsiLCJvbmVqYW4iLCJ3ZWVrTnVtIiwicmVuZGVyUm93IiwiZGF5cyIsImlzUlRMIiwicmV2ZXJzZSIsInJlbmRlckJvZHkiLCJyb3dzIiwicmVuZGVySGVhZCIsInNob3dXZWVrTnVtYmVyIiwicmVuZGVyVGl0bGUiLCJpbnN0YW5jZSIsImMiLCJyZWZZZWFyIiwicmFuZElkIiwiaiIsImlzTWluWWVhciIsIm1pblllYXIiLCJpc01heFllYXIiLCJtYXhZZWFyIiwiaHRtbCIsIm1vbnRoSHRtbCIsInllYXJIdG1sIiwicHJldiIsIm5leHQiLCJtaW5Nb250aCIsIm1heE1vbnRoIiwibW9udGhzIiwieWVhclJhbmdlIiwieWVhclN1ZmZpeCIsInNob3dNb250aEFmdGVyWWVhciIsInByZXZpb3VzTW9udGgiLCJudW1iZXJPZk1vbnRocyIsIm5leHRNb250aCIsInJlbmRlclRhYmxlIiwiUGxhaW5QaWNrZXIiLCJvcHRpb25zIiwic2VsZiIsImNvbmZpZyIsIl9vbkNsaWNrIiwiX3YiLCJldmVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJib3VuZCIsImhpZGVBZnRlciIsInNldERhdGUiLCJwcmV2TW9udGgiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwiX2MiLCJfb25DaGFuZ2UiLCJnb3RvTW9udGgiLCJnb3RvWWVhciIsIl9vbktleUNoYW5nZSIsImNhcHR1cmVLZXkiLCJoYXNLZXkiLCJzdG9wRXZlbnQiLCJpc1Zpc2libGUiLCJrZXlDb2RlIiwidHJpZ2dlciIsImZvY3VzIiwic2VsZWN0IiwiaGlkZSIsImNhbmNlbCIsImFkanVzdERhdGUiLCJhZGp1c3RNb250aCIsImFkanVzdFllYXIiLCJfb25JbnB1dENoYW5nZSIsImZpcmVkQnkiLCJwYXJzZUZuIiwiZmllbGQiLCJfb25Ub3VjaCIsInRvdWNoZWQiLCJfb25JbnB1dEZvY3VzIiwiYmx1ciIsImZvY3VzSW5zaWRlIiwic2hvdyIsIl9vbklucHV0Q2xpY2siLCJfb25JbnB1dEJsdXIiLCJwRWwiLCJhY3RpdmVFbGVtZW50IiwiX2IiLCJfb25Eb2N1bWVudENsaWNrIiwib25jaGFuZ2UiLCJzZXRBdHRyaWJ1dGUiLCJpbml0IiwiY3JlYXRlRWxlbWVudCIsInRoZW1lIiwiZ2V0TGFiZWwiLCJzcGVha0VsIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsIm1pbkRhdGUiLCJtYXhEYXRlIiwiYXV0b0luaXQiLCJub3ciLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJsYWJlbEZuIiwibm9tIiwicGFyc2VJbnQiLCJzZXRNaW5EYXRlIiwic2V0TWF4RGF0ZSIsImZhbGxiYWNrIiwiZXZlbnRUZXN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJtYXRjaCIsInR5cGUiLCJ0b0xvd2VyQ2FzZSIsImJpbmQiLCJfZCIsImZvcm1hdEZuIiwidG9EYXRlU3RyaW5nIiwiY2FsZW5kYXJzIiwicHJldmVudE9uU2VsZWN0IiwiZHJhdyIsIm1pbiIsIm1heCIsInNwZWFrIiwiZ2V0RGF5Q29uZmlnIiwiaWQiLCJ0ZXh0Q29udGVudCIsImlubmVyVGV4dCIsImhlbHAiLCJpbm5lckhUTUwiLCJuZXdDYWxlbmRhciIsImZpcnN0VmlzaWJsZURhdGUiLCJsYXN0VmlzaWJsZURhdGUiLCJ2aXNpYmxlRGF0ZSIsInNldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwiZGlmZmVyZW5jZSIsIm5ld0RheSIsInZhbHVlT2YiLCJzZWxlY3REYXRlIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiYWN0aW9uIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicmVxdWVzdGVkIiwiX2RyYXciLCJhZGp1c3RQb3NpdGlvbiIsIl9hZGp1c3RQb3NpdGlvbiIsImZvY3VzUGlja2VyIiwiZm9yY2UiLCJfcmVxdWVzdCIsIl95IiwiX20iLCJyYW5kb20iLCJzdWJzdHIiLCJyZW5kZXIiLCJhdXRvZm9jdXMiLCJzZXRUaW1lb3V0IiwibGVmdCIsInRvcCIsImNsaWVudFJlY3QiLCJzdHlsZSIsInBvc2l0aW9uIiwicG9zaXRpb25UYXJnZXQiLCJ3aWR0aCIsIm9mZnNldFdpZHRoIiwidmlld3BvcnRXaWR0aCIsImlubmVyV2lkdGgiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhZ2VYT2Zmc2V0IiwiYm90dG9tIiwicGFnZVlPZmZzZXQiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0UGFyZW50IiwiaGFsaWduIiwicmVwb3NpdGlvbiIsIm92ZXJmbG93IiwicmlnaHQiLCJkYXlOdW1iZXIiLCJtb250aE51bWJlciIsInllYXJOdW1iZXIiLCJkYXlDb25maWciLCJ0ZXh0Rm4iLCJiZWZvcmUiLCJyb3ciLCJjZWxscyIsImFmdGVyIiwiciIsInVuc2hpZnQiLCJoaWRlVGltZW91dCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwicmVjZW50VmFsdWUiLCJkZWxheSIsImNhbmNlbGxlZCIsInYiLCJyZW1vdmVDaGlsZCIsIm5hbWUiXSwibWFwcGluZ3Mi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
