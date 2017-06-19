'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

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

  // const log = function() {
  //   console.log.apply(console, arguments)
  // }

  ();var hasEventListeners = !!window.addEventListener;

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
            // this._v && console.log('Hiding soon because date has been selected and picker is bound.')
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
        // this._v && log('Hiding soon because input was blured', event.target, self._b)
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

      // const eventTest = /^on([A-Z]\w+)$/
      // Object.keys(opts).forEach(
      //   function(key) {
      //     const match = key.match(eventTest)
      //     console.log(eventTest)
      //     if (match) {
      //       const type = match[1].toLowerCase()
      //       console.log(type)
      //       this.on(type, opts[key])
      //       delete opts[key]
      //     }
      //   }.bind(this)
      // )

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhaW5waWNrZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9wbGFpbnBpY2tlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcbiAgY29uc3QgRXZFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbiAgICBjb25zdCBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGVcblxuICAgIHByb3RvLm9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKCFldmVudE5hbWUgfHwgIWxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZXZlbnRzID0gKHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fSlcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IChldmVudHNbZXZlbnROYW1lXSA9IGV2ZW50c1tldmVudE5hbWVdIHx8IFtdKVxuICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcHJvdG8ub25jZSA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICghZXZlbnROYW1lIHx8ICFsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMub24oZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAgICAgIGNvbnN0IG9uY2VFdmVudHMgPSAodGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge30pXG4gICAgICBjb25zdCBvbmNlTGlzdGVuZXJzID0gKG9uY2VFdmVudHNbZXZlbnROYW1lXSA9IG9uY2VFdmVudHNbZXZlbnROYW1lXSB8fCB7fSlcbiAgICAgIG9uY2VMaXN0ZW5lcnNbbGlzdGVuZXJdID0gdHJ1ZVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHByb3RvLm9mZiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgZXZlbnROYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldmVudE5hbWVdXG4gICAgICBpZiAoIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBhcmdzKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV1cbiAgICAgIGlmICghbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGV0IGkgPSAwXG4gICAgICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICAgIGFyZ3MgPSBhcmdzIHx8IFtdXG4gICAgICBjb25zdCBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzW2V2ZW50TmFtZV1cblxuICAgICAgd2hpbGUgKGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1tsaXN0ZW5lcl1cbiAgICAgICAgaWYgKGlzT25jZSkge1xuICAgICAgICAgIHRoaXMub2ZmKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gICAgICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbbGlzdGVuZXJdXG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgaSArPSBpc09uY2UgPyAwIDogMVxuICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHJldHVybiBFdkVtaXR0ZXJcbiAgfSkoKVxuXG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cblxuICAvLyBjb25zdCBsb2cgPSBmdW5jdGlvbigpIHtcbiAgLy8gICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXG4gIC8vIH1cblxuICBjb25zdCBoYXNFdmVudExpc3RlbmVycyA9ICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcblxuICBjb25zdCBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudFxuXG4gIGNvbnN0IGFkZEV2ZW50ID0gZnVuY3Rpb24oZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG4gICAgaWYgKGhhc0V2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGUsIGNhbGxiYWNrLCAhIWNhcHR1cmUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBlLCBjYWxsYmFjaylcbiAgICB9XG4gIH1cblxuICBjb25zdCByZW1vdmVFdmVudCA9IGZ1bmN0aW9uKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkge1xuICAgIGlmIChoYXNFdmVudExpc3RlbmVycykge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICAgIH0gZWxzZSB7XG4gICAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgZSwgY2FsbGJhY2spXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZmlyZUV2ZW50ID0gZnVuY3Rpb24oZWwsIGV2ZW50TmFtZSwgZGF0YSkge1xuICAgIGxldCBldlxuXG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJylcbiAgICAgIGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5maXJlRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgZXYpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgdHJpbSA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gIH1cblxuICBjb25zdCBoYXNDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbikge1xuICAgIHJldHVybiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcbiAgfVxuXG4gIGNvbnN0IGFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNuKSB7XG4gICAgaWYgKCFoYXNDbGFzcyhlbCwgY24pKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgPT09ICcnID8gY24gOiBlbC5jbGFzc05hbWUgKyAnICcgKyBjblxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oZWwsIGNuKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gdHJpbSgoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5yZXBsYWNlKCcgJyArIGNuICsgJyAnLCAnICcpKVxuICB9XG5cbiAgY29uc3QgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAvQXJyYXkvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpXG4gIH1cblxuICBjb25zdCBpc0RhdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gL0RhdGUvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuICB9XG5cbiAgY29uc3QgaXNXZWVrZW5kID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgY29uc3QgaXNMZWFwWWVhciA9IGZ1bmN0aW9uKHllYXIpIHtcbiAgICByZXR1cm4gKHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDApIHx8IHllYXIgJSA0MDAgPT09IDBcbiAgfVxuXG4gIGNvbnN0IGdldERheXNJbk1vbnRoID0gZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICByZXR1cm4gWzMxLCBpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdW21vbnRoXVxuICB9XG5cbiAgY29uc3Qgc2V0VG9TdGFydE9mRGF5ID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGFyZURhdGVzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmICghYSB8fCAhYikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBhLmdldFRpbWUoKSA9PT0gYi5nZXRUaW1lKClcbiAgfVxuXG4gIGNvbnN0IHRvSVNPRGF0ZVN0cmluZyA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpXG4gICAgY29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKVxuICAgIGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpXG4gICAgcmV0dXJuIHkgKyAnLycgKyAobS5sZW5ndGggPT09IDEgPyAnMCcgOiAnJykgKyBtICsgJy8nICsgKGQubGVuZ3RoID09PSAxID8gJzAnIDogJycpICsgZFxuICB9XG5cbiAgY29uc3QgZXh0ZW5kID0gZnVuY3Rpb24odG8sIGZyb20sIG92ZXJ3cml0ZSkge1xuICAgIGZvciAoY29uc3QgcHJvcCBpbiBmcm9tKSB7XG4gICAgICBjb25zdCBoYXNQcm9wID0gdG9bcHJvcF0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKGhhc1Byb3AgJiYgdHlwZW9mIGZyb21bcHJvcF0gPT09ICdvYmplY3QnICYmIGZyb21bcHJvcF0gIT09IG51bGwgJiYgZnJvbVtwcm9wXS5ub2RlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChpc0RhdGUoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IG5ldyBEYXRlKGZyb21bcHJvcF0uZ2V0VGltZSgpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdLnNsaWNlKDApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvW3Byb3BdID0gZXh0ZW5kKHt9LCBmcm9tW3Byb3BdLCBvdmVyd3JpdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3ZlcndyaXRlIHx8ICFoYXNQcm9wKSB7XG4gICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9cbiAgfVxuXG4gIGNvbnN0IGFkanVzdENhbGVuZGFyID0gZnVuY3Rpb24oY2FsZW5kYXIpIHtcbiAgICBpZiAoY2FsZW5kYXIubW9udGggPCAwKSB7XG4gICAgICBjYWxlbmRhci55ZWFyIC09IE1hdGguY2VpbChNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoICs9IDEyXG4gICAgfVxuICAgIGlmIChjYWxlbmRhci5tb250aCA+IDExKSB7XG4gICAgICBjYWxlbmRhci55ZWFyICs9IE1hdGguZmxvb3IoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCAtPSAxMlxuICAgIH1cbiAgICByZXR1cm4gY2FsZW5kYXJcbiAgfVxuXG4gIGNvbnN0IGNvbnRhaW5zRWxlbWVudCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZWxlbWVudCkge1xuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoY29udGFpbmVyID09PSBlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmF1bHRzIGFuZCBsb2NhbGlzYXRpb25cbiAgICovXG4gIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgIC8vIGluaXRpYWxpc2UgcmlnaHQgYXdheSwgaWYgZmFsc2UsIHlvdSBoYXZlIHRvIGNhbGwgbmV3IFBsYWluUGlja2VyKG9wdGlvbnMpLmluaXQoKTtcbiAgICBhdXRvSW5pdDogdHJ1ZSxcblxuICAgIC8vIGJpbmQgdGhlIHBpY2tlciB0byBhIGZvcm0gZmllbGRcbiAgICBmaWVsZDogbnVsbCxcblxuICAgIC8vIGRlZmF1bHQgYGZpZWxkYCBpZiBgZmllbGRgIGlzIHNldFxuICAgIHRyaWdnZXI6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb25UYXJnZXQ6IG51bGwsXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgLy8gYSBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBzdHJpbmcgfVxuICAgIC8vIGNvdWxkIGJlIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKHRoaXMuX28uaTE4bi5sYW5ndWFnZSwge3llYXI6ICdudW1lcmljJywgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnLCB3ZWVrZGF5OiAnc2hvcnQnfSlcbiAgICBmb3JtYXRGbjogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgcmV0dXJuIHRvSVNPRGF0ZVN0cmluZyhkYXRlKVxuICAgIH0sXG5cbiAgICBwYXJzZUZuOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKERhdGUucGFyc2UodmFsdWUpKVxuICAgIH0sXG5cbiAgICAvLyB0aGUgaW5pdGlhbCBkYXRlIHRvIHZpZXcgd2hlbiBmaXJzdCBvcGVuZWRcbiAgICBkZWZhdWx0RGF0ZTogbnVsbCxcblxuICAgIC8vIG1ha2UgdGhlIGBkZWZhdWx0RGF0ZWAgdGhlIGluaXRpYWwgc2VsZWN0ZWQgdmFsdWVcbiAgICBzZXREZWZhdWx0RGF0ZTogZmFsc2UsXG5cbiAgICAvLyBmaXJzdCBkYXkgb2Ygd2VlayAoMDogU3VuZGF5LCAxOiBNb25kYXkgZXRjKVxuICAgIGZpcnN0RGF5OiAwLFxuXG4gICAgZGlzYWJsZURheUZuOiBudWxsLFxuXG4gICAgbGFiZWxGbjogZnVuY3Rpb24oZGF5KSB7XG4gICAgICBjb25zdCBkYXRlU3RyID0gZGF5LmRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKHRoaXMuX28uaTE4bi5sYW5ndWFnZSwge1xuICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgIG1vbnRoOiAnbG9uZycsXG4gICAgICAgIGRheTogJ251bWVyaWMnXG4gICAgICB9KVxuICAgICAgY29uc3QgZGF5U3RyID0gdGhpcy5fby5pMThuLndlZWtkYXlzW2RheS5kYXRlLmdldERheSgpXVxuICAgICAgbGV0IHRleHQgPSBkYXlTdHIgKyAnLCAnICsgZGF0ZVN0clxuICAgICAgaWYgKGRheS5pc1RvZGF5KSB7XG4gICAgICAgIHRleHQgKz0gJyAoJyArIHRoaXMuX28uaTE4bi50b2RheSArICcpJ1xuICAgICAgfVxuICAgICAgaWYgKGRheS5pc0Rpc2FibGVkKSB7XG4gICAgICAgIHRleHQgPSAnKCcgKyB0aGlzLl9vLmkxOG4uZGlzYWJsZWQgKyAnKSAnICsgdGV4dFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuXG4gICAgdGV4dEZuOiBmdW5jdGlvbihkYXkpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBkYXkuZGF5XG4gICAgICByZXR1cm4gdGV4dFxuICAgIH0sXG5cbiAgICAvLyB0aGUgbWluaW11bS9lYXJsaWVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgbWluRGF0ZTogbnVsbCxcbiAgICAvLyB0aGUgbWF4aW11bS9sYXRlc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1heERhdGU6IG51bGwsXG5cbiAgICAvLyBudW1iZXIgb2YgeWVhcnMgZWl0aGVyIHNpZGUsIG9yIGFycmF5IG9mIHVwcGVyL2xvd2VyIHJhbmdlXG4gICAgeWVhclJhbmdlOiAxMCxcblxuICAgIC8vIHNob3cgd2VlayBudW1iZXJzIGF0IGhlYWQgb2Ygcm93XG4gICAgc2hvd1dlZWtOdW1iZXI6IGZhbHNlLFxuXG4gICAgLy8gdXNlZCBpbnRlcm5hbGx5IChkb24ndCBjb25maWcgb3V0c2lkZSlcbiAgICBtaW5ZZWFyOiAwLFxuICAgIG1heFllYXI6IDk5OTksXG4gICAgbWluTW9udGg6IHVuZGVmaW5lZCxcbiAgICBtYXhNb250aDogdW5kZWZpbmVkLFxuXG4gICAgc3RhcnRSYW5nZTogbnVsbCxcbiAgICBlbmRSYW5nZTogbnVsbCxcblxuICAgIGlzUlRMOiBmYWxzZSxcblxuICAgIC8vIEFkZGl0aW9uYWwgdGV4dCB0byBhcHBlbmQgdG8gdGhlIHllYXIgaW4gdGhlIGNhbGVuZGFyIHRpdGxlXG4gICAgeWVhclN1ZmZpeDogJycsXG5cbiAgICAvLyBSZW5kZXIgdGhlIG1vbnRoIGFmdGVyIHllYXIgaW4gdGhlIGNhbGVuZGFyIHRpdGxlXG4gICAgc2hvd01vbnRoQWZ0ZXJZZWFyOiBmYWxzZSxcblxuICAgIC8vIFJlbmRlciBkYXlzIG9mIHRoZSBjYWxlbmRhciBncmlkIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IGZhbHNlLFxuXG4gICAgLy8gaG93IG1hbnkgbW9udGhzIGFyZSB2aXNpYmxlXG4gICAgbnVtYmVyT2ZNb250aHM6IDEsXG5cbiAgICAvLyB3aGVuIG51bWJlck9mTW9udGhzIGlzIHVzZWQsIHRoaXMgd2lsbCBoZWxwIHlvdSB0byBjaG9vc2Ugd2hlcmUgdGhlIG1haW4gY2FsZW5kYXIgd2lsbCBiZSAoZGVmYXVsdCBgbGVmdGAsIGNhbiBiZSBzZXQgdG8gYHJpZ2h0YClcbiAgICAvLyBvbmx5IHVzZWQgZm9yIHRoZSBmaXJzdCBkaXNwbGF5IG9yIHdoZW4gYSBzZWxlY3RlZCBkYXRlIGlzIG5vdCB2aXNpYmxlXG4gICAgbWFpbkNhbGVuZGFyOiAnbGVmdCcsXG5cbiAgICAvLyBTcGVjaWZ5IGEgRE9NIGVsZW1lbnQgdG8gcmVuZGVyIHRoZSBjYWxlbmRhciBpblxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBsYW5ndWFnZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpLmdldEF0dHJpYnV0ZSgnbGFuZycpIHx8IHVuZGVmaW5lZCxcbiAgICAgIHRvZGF5OiAnVG9kYXknLFxuICAgICAgZGlzYWJsZWQ6ICdEaXNhYmxlZCcsXG4gICAgICBoZWxwOiAnVXNlIGFycm93IGtleXMgdG8gY2hvb3NlIGEgZGF0ZS4nLFxuXG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldmlvdXMgTW9udGgnLFxuICAgICAgbmV4dE1vbnRoOiAnTmV4dCBNb250aCcsXG4gICAgICBtb250aHM6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBjYWxsYmFjayBmdW5jdGlvblxuICAgIG9uU2VsZWN0OiBudWxsLFxuICAgIG9uT3BlbjogbnVsbCxcbiAgICBvbkNsb3NlOiBudWxsLFxuICAgIG9uRHJhdzogbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIHRlbXBsYXRpbmcgZnVuY3Rpb25zIHRvIGFic3RyYWN0IEhUTUwgcmVuZGVyaW5nXG4gICAqL1xuICBjb25zdCByZW5kZXJEYXlOYW1lID0gZnVuY3Rpb24ob3B0cywgZGF5LCBhYmJyKSB7XG4gICAgZGF5ICs9IG9wdHMuZmlyc3REYXlcbiAgICB3aGlsZSAoZGF5ID49IDcpIHtcbiAgICAgIGRheSAtPSA3XG4gICAgfVxuICAgIHJldHVybiBhYmJyID8gb3B0cy5pMThuLndlZWtkYXlzU2hvcnRbZGF5XSA6IG9wdHMuaTE4bi53ZWVrZGF5c1tkYXldXG4gIH1cblxuICBjb25zdCByZW5kZXJEYXkgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgbGV0IGFyciA9IFtdXG4gICAgbGV0IGFyaWFTZWxlY3RlZCA9ICdmYWxzZSdcbiAgICBjb25zdCBhcmlhTGFiZWwgPSBvcHRzLmxhYmVsIHx8ICcnXG4gICAgY29uc3QgdGFiaW5kZXggPSBvcHRzLnRhYmluZGV4XG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJlbnQtbW9udGgnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICc8dGQgY2xhc3M9XCJpcy1lbXB0eVwiPjwvdGQ+J1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0cy5pc0Rpc2FibGVkKSB7XG4gICAgICBhcnIucHVzaCgnaXMtZGlzYWJsZWQnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1RvZGF5KSB7XG4gICAgICBhcnIucHVzaCgnaXMtdG9kYXknKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1NlbGVjdGVkKSB7XG4gICAgICBhcnIucHVzaCgnaXMtc2VsZWN0ZWQnKVxuICAgICAgYXJpYVNlbGVjdGVkID0gJ3RydWUnXG4gICAgfVxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1N0YXJ0UmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zdGFydHJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICc8dGQgZGF0YS1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIiBjbGFzcz1cIicgK1xuICAgICAgYXJyLmpvaW4oJyAnKSArXG4gICAgICAnXCI+JyArXG4gICAgICAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX2J1dHRvbiBkYXRlcGlja2VyX19kYXlcIiB0eXBlPVwiYnV0dG9uXCIgJyArXG4gICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICtcbiAgICAgIG9wdHMueWVhciArXG4gICAgICAnXCIgZGF0YS1kYXRlcGlja2VyLW1vbnRoPVwiJyArXG4gICAgICBvcHRzLm1vbnRoICtcbiAgICAgICdcIiBkYXRhLWRhdGVwaWNrZXItZGF5PVwiJyArXG4gICAgICBvcHRzLmRheSArXG4gICAgICAnXCIgYXJpYS1zZWxlY3RlZD1cIicgK1xuICAgICAgYXJpYVNlbGVjdGVkICtcbiAgICAgICdcIiBhcmlhLWxhYmVsPVwiJyArXG4gICAgICBhcmlhTGFiZWwgK1xuICAgICAgJ1wiIHRhYmluZGV4PVwiJyArXG4gICAgICB0YWJpbmRleCArXG4gICAgICAnXCI+JyArXG4gICAgICBvcHRzLnRleHQgK1xuICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgJzwvdGQ+J1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IHJlbmRlcldlZWsgPSBmdW5jdGlvbihkLCBtLCB5KSB7XG4gICAgY29uc3Qgb25lamFuID0gbmV3IERhdGUoeSwgMCwgMSlcbiAgICBjb25zdCB3ZWVrTnVtID0gTWF0aC5jZWlsKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDAgKyBvbmVqYW4uZ2V0RGF5KCkgKyAxKSAvIDcpXG4gICAgcmV0dXJuICc8dGQgY2xhc3M9XCJkYXRlcGlja2VyX193ZWVrXCI+JyArIHdlZWtOdW0gKyAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJSb3cgPSBmdW5jdGlvbihkYXlzLCBpc1JUTCkge1xuICAgIHJldHVybiAnPHRyPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IGZ1bmN0aW9uKHJvd3MpIHtcbiAgICByZXR1cm4gJzx0Ym9keT4nICsgcm93cy5qb2luKCcnKSArICc8L3Rib2R5PidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlckhlYWQgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgbGV0IGlcbiAgICBsZXQgYXJyID0gW11cbiAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgYXJyLnB1c2goJzx0aD48L3RoPicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgIGFyci5wdXNoKCc8dGggc2NvcGU9XCJjb2xcIj48YWJiciB0aXRsZT1cIicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGkpICsgJ1wiPicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGksIHRydWUpICsgJzwvYWJicj48L3RoPicpXG4gICAgfVxuICAgIHJldHVybiAnPHRoZWFkIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjx0cj4nICsgKG9wdHMuaXNSVEwgPyBhcnIucmV2ZXJzZSgpIDogYXJyKS5qb2luKCcnKSArICc8L3RyPjwvdGhlYWQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyVGl0bGUgPSBmdW5jdGlvbihpbnN0YW5jZSwgYywgeWVhciwgbW9udGgsIHJlZlllYXIsIHJhbmRJZCkge1xuICAgIGxldCBpXG4gICAgbGV0IGpcbiAgICBsZXQgYXJyXG4gICAgY29uc3Qgb3B0cyA9IGluc3RhbmNlLl9vXG4gICAgY29uc3QgaXNNaW5ZZWFyID0geWVhciA9PT0gb3B0cy5taW5ZZWFyXG4gICAgY29uc3QgaXNNYXhZZWFyID0geWVhciA9PT0gb3B0cy5tYXhZZWFyXG4gICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+J1xuICAgIGxldCBtb250aEh0bWxcbiAgICBsZXQgeWVhckh0bWxcbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goXG4gICAgICAgICc8b3B0aW9uIHZhbHVlPVwiJyArXG4gICAgICAgICAgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICtcbiAgICAgICAgICAnXCInICtcbiAgICAgICAgICAoaSA9PT0gbW9udGggPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgK1xuICAgICAgICAgICgoaXNNaW5ZZWFyICYmIGkgPCBvcHRzLm1pbk1vbnRoKSB8fCAoaXNNYXhZZWFyICYmIGkgPiBvcHRzLm1heE1vbnRoKSA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpICtcbiAgICAgICAgICAnPicgK1xuICAgICAgICAgIG9wdHMuaTE4bi5tb250aHNbaV0gK1xuICAgICAgICAgICc8L29wdGlvbj4nXG4gICAgICApXG4gICAgfVxuXG4gICAgbW9udGhIdG1sID1cbiAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICtcbiAgICAgIG9wdHMuaTE4bi5tb250aHNbbW9udGhdICtcbiAgICAgICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC1tb250aFwiIHRhYmluZGV4PVwiLTFcIj4nICtcbiAgICAgIGFyci5qb2luKCcnKSArXG4gICAgICAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICBpID0gb3B0cy55ZWFyUmFuZ2VbMF1cbiAgICAgIGogPSBvcHRzLnllYXJSYW5nZVsxXSArIDFcbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZVxuICAgICAgaiA9IDEgKyB5ZWFyICsgb3B0cy55ZWFyUmFuZ2VcbiAgICB9XG5cbiAgICBmb3IgKGFyciA9IFtdOyBpIDwgaiAmJiBpIDw9IG9wdHMubWF4WWVhcjsgaSsrKSB7XG4gICAgICBpZiAoaSA+PSBvcHRzLm1pblllYXIpIHtcbiAgICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIGkgKyAnPC9vcHRpb24+JylcbiAgICAgIH1cbiAgICB9XG4gICAgeWVhckh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgeWVhciArXG4gICAgICBvcHRzLnllYXJTdWZmaXggK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICBhcnIuam9pbignJykgK1xuICAgICAgJzwvc2VsZWN0PjwvZGl2PidcblxuICAgIGlmIChvcHRzLnNob3dNb250aEFmdGVyWWVhcikge1xuICAgICAgaHRtbCArPSB5ZWFySHRtbCArIG1vbnRoSHRtbFxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9IG1vbnRoSHRtbCArIHllYXJIdG1sXG4gICAgfVxuXG4gICAgaWYgKGlzTWluWWVhciAmJiAobW9udGggPT09IDAgfHwgb3B0cy5taW5Nb250aCA+PSBtb250aCkpIHtcbiAgICAgIHByZXYgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChpc01heFllYXIgJiYgKG1vbnRoID09PSAxMSB8fCBvcHRzLm1heE1vbnRoIDw9IG1vbnRoKSkge1xuICAgICAgbmV4dCA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGMgPT09IDApIHtcbiAgICAgIGh0bWwgKz1cbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19wcmV2JyArXG4gICAgICAgIChwcmV2ID8gJycgOiAnIGlzLWRpc2FibGVkJykgK1xuICAgICAgICAnXCIgJyArXG4gICAgICAgIChwcmV2ID8gJycgOiAnZGlzYWJsZWQgJykgK1xuICAgICAgICAndHlwZT1cImJ1dHRvblwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICByYW5kSWQgK1xuICAgICAgICAnXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgICBvcHRzLmkxOG4ucHJldmlvdXNNb250aCArXG4gICAgICAgICc8L2J1dHRvbj4nXG4gICAgfVxuICAgIGlmIChjID09PSBpbnN0YW5jZS5fby5udW1iZXJPZk1vbnRocyAtIDEpIHtcbiAgICAgIGh0bWwgKz1cbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19uZXh0JyArXG4gICAgICAgIChuZXh0ID8gJycgOiAnIGlzLWRpc2FibGVkJykgK1xuICAgICAgICAnXCIgJyArXG4gICAgICAgIChuZXh0ID8gJycgOiAnZGlzYWJsZWQgJykgK1xuICAgICAgICAndHlwZT1cImJ1dHRvblwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICByYW5kSWQgK1xuICAgICAgICAnXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgICBvcHRzLmkxOG4ubmV4dE1vbnRoICtcbiAgICAgICAgJzwvYnV0dG9uPidcbiAgICB9XG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSBmdW5jdGlvbihvcHRzLCBkYXRhLCByYW5kSWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgJzx0YWJsZSBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RhYmxlXCIgcm9sZT1cInByZXNlbnRhdGlvblwiPicgK1xuICAgICAgcmVuZGVySGVhZChvcHRzKSArXG4gICAgICByZW5kZXJCb2R5KGRhdGEpICtcbiAgICAgICc8L3RhYmxlPidcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgY29uc3Qgb3B0cyA9IHNlbGYuY29uZmlnKG9wdGlvbnMpXG5cbiAgICBzZWxmLl9vbkNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uJykgJiYgIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWVtcHR5JykgJiYgIWhhc0NsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgICAvLyB0aGlzLl92ICYmIGNvbnNvbGUubG9nKCdIaWRpbmcgc29vbiBiZWNhdXNlIGRhdGUgaGFzIGJlZW4gc2VsZWN0ZWQgYW5kIHBpY2tlciBpcyBib3VuZC4nKVxuICAgICAgICAgICAgc2VsZi5oaWRlQWZ0ZXIoMjAwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnNldERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShcbiAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSxcbiAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLW1vbnRoJyksXG4gICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25DaGFuZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoJykpIHtcbiAgICAgICAgc2VsZi5nb3RvTW9udGgodGFyZ2V0LnZhbHVlKVxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QteWVhcicpKSB7XG4gICAgICAgIHNlbGYuZ290b1llYXIodGFyZ2V0LnZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uS2V5Q2hhbmdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICAgIGZ1bmN0aW9uIGNhcHR1cmVLZXkoKSB7XG4gICAgICAgIHNlbGYuaGFzS2V5ID0gdHJ1ZVxuICAgICAgICBzdG9wRXZlbnQoKVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdG9wRXZlbnQoKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSA5IC8qIFRBQiAqLzpcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0tleSAmJiBzZWxmLl9vLnRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgc2VsZi5fby50cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICAgICAgc2VsZi5oYXNLZXkgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDMyOiAvKiBTUEFDRSAqL1xuICAgICAgICAgIGNhc2UgMTMgLyogRU5URVIgKi86XG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNLZXkgJiYgIW9wdHMuY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgIHN0b3BFdmVudCgpXG4gICAgICAgICAgICAgIGlmIChzZWxmLl9vLnRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vLnRyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9vLnRyaWdnZXIuc2VsZWN0KClcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMjcgLyogRVNDQVBFICovOlxuICAgICAgICAgICAgaWYgKCFvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgICBzdG9wRXZlbnQoKVxuICAgICAgICAgICAgICBzZWxmLmNhbmNlbCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzcgLyogTEVGVCAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKC0xKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM4IC8qIFVQICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoLTcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzkgLyogUklHSFQgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgrMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSA0MCAvKiBET1dOICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoKzcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzMgLyogUEFHRV9VUCAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3RNb250aCgtMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzNCAvKiBQQUdFX0RPV04gKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0TW9udGgoKzEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzUgLyogRU5EICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdFllYXIoKzEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzYgLyogSE9NRSAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3RZZWFyKC0xKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDaGFuZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5maXJlZEJ5ID09PSBzZWxmKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRlID0gb3B0cy5wYXJzZUZuLmNhbGwoc2VsZiwgb3B0cy5maWVsZC52YWx1ZSlcblxuICAgICAgaWYgKGlzRGF0ZShkYXRlKSkge1xuICAgICAgICBzZWxmLnNldERhdGUoZGF0ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShudWxsKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uVG91Y2ggPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKCFzZWxmLmlzVmlzaWJsZSgpIHx8IGV2ZW50LnRhcmdldCAhPT0gb3B0cy5maWVsZCkge1xuICAgICAgICBzZWxmLnRvdWNoZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChzZWxmLnRvdWNoZWQgJiYgb3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLm5vZGVOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgIG9wdHMuZmllbGQuYmx1cigpXG4gICAgICAgIHNlbGYudG91Y2hlZCA9IGZhbHNlXG4gICAgICAgIHNlbGYuZm9jdXNJbnNpZGUgPSB0cnVlXG4gICAgICB9XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBzZWxmLnRvdWNoZWQgPSBmYWxzZVxuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Qmx1ciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoc2VsZi5oYXNLZXkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxldCBwRWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBzZWxmLmVsKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKChwRWwgPSBwRWwucGFyZW50Tm9kZSkpXG5cbiAgICAgIGlmICghc2VsZi5fYykge1xuICAgICAgICAvLyB0aGlzLl92ICYmIGxvZygnSGlkaW5nIHNvb24gYmVjYXVzZSBpbnB1dCB3YXMgYmx1cmVkJywgZXZlbnQudGFyZ2V0LCBzZWxmLl9iKVxuICAgICAgICBzZWxmLmhpZGUodHJ1ZSlcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uRG9jdW1lbnRDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBsZXQgcEVsID0gdGFyZ2V0XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChjb250YWluc0VsZW1lbnQoc2VsZi5lbCwgdGFyZ2V0KSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghaGFzRXZlbnRMaXN0ZW5lcnMgJiYgaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0JykpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQub25jaGFuZ2UpIHtcbiAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdvbmNoYW5nZScsICdyZXR1cm47JylcbiAgICAgICAgICBhZGRFdmVudCh0YXJnZXQsICdjaGFuZ2UnLCBzZWxmLl9vbkNoYW5nZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKChwRWwgPSBwRWwucGFyZW50Tm9kZSkpXG4gICAgICBpZiAoc2VsZi5fdiAmJiB0YXJnZXQgIT09IG9wdHMudHJpZ2dlciAmJiBwRWwgIT09IG9wdHMudHJpZ2dlcikge1xuICAgICAgICBzZWxmLmhpZGUodHJ1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3YgPSBmYWxzZVxuXG4gICAgICBzZWxmLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gJ2RhdGVwaWNrZXInICsgKG9wdHMuaXNSVEwgPyAnIGlzLXJ0bCcgOiAnJykgKyAob3B0cy50aGVtZSA/ICcgJyArIG9wdHMudGhlbWUgOiAnJylcbiAgICAgIHNlbGYuZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2FwcGxpY2F0aW9uJylcbiAgICAgIHNlbGYuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgc2VsZi5nZXRMYWJlbCgpKVxuXG4gICAgICBzZWxmLnNwZWFrRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgc2VsZi5zcGVha0VsLnNldEF0dHJpYnV0ZSgncm9sZScsICdzdGF0dXMnKVxuICAgICAgc2VsZi5zcGVha0VsLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ2Fzc2VydGl2ZScpXG4gICAgICBzZWxmLnNwZWFrRWwuc2V0QXR0cmlidXRlKCdhcmlhLWF0b21pYycsICd0cnVlJylcbiAgICAgIHNlbGYuc3BlYWtFbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogLTk5OTlweDsgb3BhY2l0eTogMDsnKVxuXG4gICAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2Vkb3duJywgc2VsZi5fb25DbGljaywgdHJ1ZSlcbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICd0b3VjaGVuZCcsIHNlbGYuX29uQ2xpY2ssIHRydWUpXG4gICAgICBhZGRFdmVudChzZWxmLmVsLCAnY2hhbmdlJywgc2VsZi5fb25DaGFuZ2UpXG4gICAgICBhZGRFdmVudChzZWxmLmVsLCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICBhZGRFdmVudChvcHRzLmZpZWxkLCAnY2hhbmdlJywgc2VsZi5fb25JbnB1dENoYW5nZSlcblxuICAgICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgICBvcHRzLmRlZmF1bHREYXRlID0gb3B0cy5wYXJzZUZuLmNhbGwoc2VsZiwgb3B0cy5maWVsZC52YWx1ZSlcbiAgICAgICAgICBvcHRzLnNldERlZmF1bHREYXRlID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBkZWZEYXRlID0gb3B0cy5kZWZhdWx0RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKGRlZkRhdGUpKSB7XG4gICAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgICAgc2VsZi5zZXREYXRlKGRlZkRhdGUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZEYXRlID0gbmV3IERhdGUoKVxuICAgICAgICBpZiAob3B0cy5taW5EYXRlICYmIG9wdHMubWluRGF0ZSA+IGRlZkRhdGUpIHtcbiAgICAgICAgICBkZWZEYXRlID0gb3B0cy5taW5EYXRlXG4gICAgICAgIH0gZWxzZSBpZiAob3B0cy5tYXhEYXRlICYmIG9wdHMubWF4RGF0ZSA8IGRlZkRhdGUpIHtcbiAgICAgICAgICBkZWZEYXRlID0gb3B0cy5tYXhEYXRlXG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdjbGljaycsIHNlbGYuX29uSW5wdXRDbGljaylcbiAgICAgICAgYWRkRXZlbnQoZG9jdW1lbnQsICd0b3VjaHN0YXJ0Jywgc2VsZi5fb25Ub3VjaClcbiAgICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnZm9jdXMnLCBzZWxmLl9vbklucHV0Rm9jdXMpXG4gICAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaG93KClcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbWl0RXZlbnQoJ2luaXQnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmF1dG9Jbml0KSB7XG4gICAgICB0aGlzLmluaXQoKVxuICAgIH1cbiAgfVxuXG4gIFBsYWluUGlja2VyLkV2RW1pdHRlciA9IEV2RW1pdHRlclxuXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgc2V0VG9TdGFydE9mRGF5KG5vdylcblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cblxuICBQbGFpblBpY2tlci5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogY29uZmlndXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKi9cbiAgICBjb25maWc6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG5cbiAgICAgIGlmICghdGhpcy5fbykge1xuICAgICAgICB0aGlzLl9vID0gZXh0ZW5kKHt9LCBkZWZhdWx0cywgdHJ1ZSlcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0cyA9IGV4dGVuZCh0aGlzLl9vLCBvcHRpb25zLCB0cnVlKVxuXG4gICAgICBvcHRzLmlzUlRMID0gISFvcHRzLmlzUlRMXG5cbiAgICAgIG9wdHMuZmllbGQgPSBvcHRzLmZpZWxkICYmIG9wdHMuZmllbGQubm9kZU5hbWUgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gdHlwZW9mIG9wdHMudGhlbWUgPT09ICdzdHJpbmcnICYmIG9wdHMudGhlbWUgPyBvcHRzLnRoZW1lIDogbnVsbFxuXG4gICAgICBvcHRzLmJvdW5kID0gISEob3B0cy5ib3VuZCAhPT0gdW5kZWZpbmVkID8gb3B0cy5maWVsZCAmJiBvcHRzLmJvdW5kIDogb3B0cy5maWVsZClcblxuICAgICAgb3B0cy50cmlnZ2VyID0gb3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSA/IG9wdHMudHJpZ2dlciA6IG9wdHMuZmllbGRcblxuICAgICAgb3B0cy5kaXNhYmxlV2Vla2VuZHMgPSAhIW9wdHMuZGlzYWJsZVdlZWtlbmRzXG5cbiAgICAgIG9wdHMuZGlzYWJsZURheUZuID0gdHlwZW9mIG9wdHMuZGlzYWJsZURheUZuID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIG9wdHMubGFiZWxGbiA9IHR5cGVvZiBvcHRzLmxhYmVsRm4gPT09ICdmdW5jdGlvbicgPyBvcHRzLmxhYmVsRm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgb3B0cy5taW5EYXRlID0gb3B0cy5wYXJzZUZuLmNhbGwoc2VsZiwgb3B0cy5taW5EYXRlKVxuICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5wYXJzZUZuLmNhbGwoc2VsZiwgb3B0cy5tYXhEYXRlKVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkge1xuICAgICAgICBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkge1xuICAgICAgICBvcHRzLm1heERhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMubWluRGF0ZSAmJiBvcHRzLm1heERhdGUgJiYgb3B0cy5tYXhEYXRlIDwgb3B0cy5taW5EYXRlKSB7XG4gICAgICAgIG9wdHMubWF4RGF0ZSA9IG9wdHMubWluRGF0ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAob3B0cy5taW5EYXRlKSB7XG4gICAgICAgIHRoaXMuc2V0TWluRGF0ZShvcHRzLm1pbkRhdGUpXG4gICAgICB9XG4gICAgICBpZiAob3B0cy5tYXhEYXRlKSB7XG4gICAgICAgIHRoaXMuc2V0TWF4RGF0ZShvcHRzLm1heERhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FycmF5KG9wdHMueWVhclJhbmdlKSkge1xuICAgICAgICBjb25zdCBmYWxsYmFjayA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSAtIDEwXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzBdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMF0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgICBvcHRzLnllYXJSYW5nZVsxXSA9IHBhcnNlSW50KG9wdHMueWVhclJhbmdlWzFdLCAxMCkgfHwgZmFsbGJhY2tcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMueWVhclJhbmdlID0gTWF0aC5hYnMocGFyc2VJbnQob3B0cy55ZWFyUmFuZ2UsIDEwKSkgfHwgZGVmYXVsdHMueWVhclJhbmdlXG4gICAgICAgIGlmIChvcHRzLnllYXJSYW5nZSA+IDEwMCkge1xuICAgICAgICAgIG9wdHMueWVhclJhbmdlID0gMTAwXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29uc3QgZXZlbnRUZXN0ID0gL15vbihbQS1aXVxcdyspJC9cbiAgICAgIC8vIE9iamVjdC5rZXlzKG9wdHMpLmZvckVhY2goXG4gICAgICAvLyAgIGZ1bmN0aW9uKGtleSkge1xuICAgICAgLy8gICAgIGNvbnN0IG1hdGNoID0ga2V5Lm1hdGNoKGV2ZW50VGVzdClcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZyhldmVudFRlc3QpXG4gICAgICAvLyAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAvLyAgICAgICBjb25zdCB0eXBlID0gbWF0Y2hbMV0udG9Mb3dlckNhc2UoKVxuICAgICAgLy8gICAgICAgY29uc29sZS5sb2codHlwZSlcbiAgICAgIC8vICAgICAgIHRoaXMub24odHlwZSwgb3B0c1trZXldKVxuICAgICAgLy8gICAgICAgZGVsZXRlIG9wdHNba2V5XVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfS5iaW5kKHRoaXMpXG4gICAgICAvLyApXG5cbiAgICAgIHJldHVybiBvcHRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28uZm9ybWF0Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX28uZm9ybWF0Rm4uY2FsbCh0aGlzLCB0aGlzLl9kKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHdpdGggZmFsbGJhY2sgZm9yIHRoZSBjdXJyZW50IGRhdGVcbiAgICAgKi9cbiAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBuZXcgRGF0ZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldFNlbGVjdGVkRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaXNEYXRlKHRoaXMuX2QpID8gbmV3IERhdGUodGhpcy5fZC5nZXRUaW1lKCkpIDogbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBEYXRlIG9iamVjdCBvZiB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBnZXRWaXNpYmxlRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbihkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aGlzLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB7ZmlyZWRCeTogdGhpc30pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoZGF0ZSlcblxuICAgICAgY29uc3QgbWluID0gdGhpcy5fby5taW5EYXRlXG4gICAgICBjb25zdCBtYXggPSB0aGlzLl9vLm1heERhdGVcblxuICAgICAgaWYgKGlzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcbiAgICAgICAgZGF0ZSA9IG1pblxuICAgICAgfSBlbHNlIGlmIChpc0RhdGUobWF4KSAmJiBkYXRlID4gbWF4KSB7XG4gICAgICAgIGRhdGUgPSBtYXhcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZURhdGVzRXF1YWwodGhpcy5fZCwgZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSlcbiAgICAgIHNldFRvU3RhcnRPZkRheSh0aGlzLl9kKVxuICAgICAgdGhpcy5nb3RvRGF0ZSh0aGlzLl9kKVxuXG4gICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICB0aGlzLl9vLmZpZWxkLnZhbHVlID0gdGhpcy50b1N0cmluZygpXG4gICAgICAgIGZpcmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywge2ZpcmVkQnk6IHRoaXN9KVxuICAgICAgfVxuICAgICAgaWYgKCFwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3NlbGVjdCcsIFt0aGlzLmdldERhdGUoKV0pXG4gICAgICB9XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuICAgIH0sXG5cbiAgICBzZWxlY3REYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB0aGlzLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICh0aGlzLl9kKSB7XG4gICAgICAgIHRoaXMuc3BlYWsodGhpcy5nZXREYXlDb25maWcodGhpcy5fZCkubGFiZWwpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldExhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBsYWJlbCA9ICcnXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuXG4gICAgICBpZiAob3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLmlkKSB7XG4gICAgICAgIGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIG9wdHMuZmllbGQuaWQgKyAnXCJdJylcbiAgICAgICAgbGFiZWwgPSBsYWJlbCA/IGxhYmVsLnRleHRDb250ZW50IHx8IGxhYmVsLmlubmVyVGV4dCA6ICcnXG4gICAgICB9XG5cbiAgICAgIGlmICghbGFiZWwgJiYgb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgIGxhYmVsID0gb3B0cy50cmlnZ2VyLnRleHRDb250ZW50IHx8IG9wdHMudHJpZ2dlci5pbm5lclRleHRcbiAgICAgIH1cblxuICAgICAgbGFiZWwgKz0gJyAoJyArIG9wdHMuaTE4bi5oZWxwICsgJyknXG5cbiAgICAgIHJldHVybiBsYWJlbFxuICAgIH0sXG5cbiAgICBzcGVhazogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgdGhpcy5zcGVhay5pbm5lckhUTUwgPSAnJ1xuICAgICAgdGhpcy5zcGVha0VsLmlubmVySFRNTCA9IGh0bWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXG4gICAgICovXG4gICAgZ290b0RhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIGxldCBuZXdDYWxlbmRhciA9IHRydWVcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG5cbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldE1vbnRoKGxhc3RWaXNpYmxlRGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpXG4gICAgICAgIG5ld0NhbGVuZGFyID0gdmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uKGRheXMpIHtcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuZ2V0RGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cylcbiAgICAgIGNvbnN0IG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkpXG4gICAgICBuZXdEYXkuc2V0RGF0ZShuZXdEYXkuZ2V0RGF0ZSgpICsgZGlmZmVyZW5jZSlcbiAgICAgIHRoaXMuc2VsZWN0RGF0ZShuZXdEYXkpXG4gICAgfSxcblxuICAgIGFkanVzdENhbGVuZGFyczogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSBhZGp1c3RDYWxlbmRhcih0aGlzLmNhbGVuZGFyc1swXSlcbiAgICAgIGZvciAoYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIG1vbnRoICh6ZXJvLWluZGV4LCBlLmcuIDA6IEphbnVhcnkpXG4gICAgICovXG4gICAgZ290b01vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS1cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBmdWxsIHllYXIgKGUuZy4gXCIyMDEyXCIpXG4gICAgICovXG4gICAgZ290b1llYXI6IGZ1bmN0aW9uKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgICAgY29uc3QgZCA9IHRoaXMuX28ucGFyc2VGbi5jYWxsKHNlbGYsIHZhbHVlKVxuXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkZWZhdWx0cy5taW5EYXRlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGRlZmF1bHRzLm1pblllYXJcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IGRlZmF1bHRzLm1pbk1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBjb25zdCBkID0gdGhpcy5fby5wYXJzZUZuLmNhbGwoc2VsZiwgdmFsdWUpXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5zdGFydFJhbmdlLCB2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3N0YXJ0cmFuZ2UnLCBbdGhpcy5fby5zdGFydFJhbmdlXSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5lbmRSYW5nZSwgdmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnZW5kcmFuZ2UnLCBbdGhpcy5fby5lbmRSYW5nZV0pXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fby5zdGFydFJhbmdlXG4gICAgfSxcblxuICAgIGdldEVuZFJhbmdlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX28uZW5kUmFuZ2VcbiAgICB9LFxuXG4gICAgX3JlcXVlc3Q6IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgaWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlcXVlc3RlZCkge1xuICAgICAgICAgIHRoaXMucmVxdWVzdGVkID0ge1xuICAgICAgICAgICAgcmVxdWVzdDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYucmVxdWVzdGVkLmRyYXcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kcmF3KClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc2VsZi5yZXF1ZXN0ZWQuYWRqdXN0UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5mb2N1c1BpY2tlcigpXG4gICAgICAgICAgICAgIHNlbGYucmVxdWVzdGVkID0gbnVsbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXF1ZXN0ZWRbYWN0aW9uXSA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbJ18nICsgYWN0aW9uXSgpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlcXVlc3QgcmVmcmVzaGluZyBIVE1MXG4gICAgICogKHVzZXMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlmIGF2YWlsYWJsZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlKVxuICAgICAqL1xuICAgIGRyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5fZHJhdyhmb3JjZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QoJ2RyYXcnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgX2RyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIC8vIHZhciBzZWxmID0gdGhpc1xuICAgICAgY29uc3QgbWluWWVhciA9IG9wdHMubWluWWVhclxuICAgICAgY29uc3QgbWF4WWVhciA9IG9wdHMubWF4WWVhclxuICAgICAgY29uc3QgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICBjb25zdCBtYXhNb250aCA9IG9wdHMubWF4TW9udGhcbiAgICAgIGxldCBodG1sID0gJydcbiAgICAgIGxldCByYW5kSWRcblxuICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWluWWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3kgPj0gbWF4WWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWF4WWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlcl9fdGl0bGUtJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgJycpLnN1YnN0cigwLCAyKVxuXG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0TGFiZWwoKVxuXG4gICAgICBpZiAodGhpcy5fby5maWVsZCAmJiB0aGlzLl9vLnRyaWdnZXIgPT09IHRoaXMuX28uZmllbGQgJiYgb3B0cy5ib3VuZCkge1xuICAgICAgICB0aGlzLl9vLmZpZWxkLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKVxuICAgICAgfVxuXG4gICAgICBsZXQgY1xuICAgICAgZm9yIChjID0gMDsgYyA8IG9wdHMubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICBodG1sICs9XG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sZW5kYXJcIj4nICtcbiAgICAgICAgICByZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArXG4gICAgICAgICAgdGhpcy5yZW5kZXIodGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHJhbmRJZCkgK1xuICAgICAgICAgICc8L2Rpdj4nXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICBsZXQgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZC5pcy1zZWxlY3RlZCA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZC5pcy10b2RheSA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgfVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCd0ZDpub3QoLmlzLWRpc2FibGVkKSA+IC5kYXRlcGlja2VyX19idXR0b24nKVxuICAgICAgfVxuICAgICAgaWYgKCFhdXRvZm9jdXMpIHtcbiAgICAgICAgYXV0b2ZvY3VzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fYnV0dG9uJylcbiAgICAgIH1cbiAgICAgIGF1dG9mb2N1cy5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKVxuXG4gICAgICB0aGlzLmVtaXRFdmVudCgnZHJhdycpXG4gICAgfSxcblxuICAgIGZvY3VzUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuXG4gICAgICBpZiAoIXRoaXMuaGFzS2V5ICYmICF0aGlzLmZvY3VzSW5zaWRlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBzZWxmLmVsLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlcGlja2VyX19idXR0b25bdGFiaW5kZXg9XCIwXCJdJykuZm9jdXMoKVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICBpZiAob3B0cy5maWVsZC50eXBlICE9PSAnaGlkZGVuJykge1xuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5lbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fYnV0dG9uW3RhYmluZGV4PVwiMFwiXScpLmZvY3VzKClcbiAgICAgICAgICB9LCAxKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZm9jdXNJbnNpZGUgPSBmYWxzZVxuICAgIH0sXG5cbiAgICBhZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXF1ZXN0KCdhZGp1c3RQb3NpdGlvbicpXG4gICAgfSxcblxuICAgIF9hZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgbGVmdFxuICAgICAgbGV0IHRvcFxuICAgICAgbGV0IGNsaWVudFJlY3RcblxuICAgICAgaWYgKHRoaXMuX28uY29udGFpbmVyKSByZXR1cm5cblxuICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLl9vLnBvc2l0aW9uVGFyZ2V0IHx8IHRoaXMuX28udHJpZ2dlclxuICAgICAgbGV0IHBFbCA9IGZpZWxkXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZWwub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcblxuICAgICAgaWYgKHR5cGVvZiBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2xpZW50UmVjdCA9IGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGxlZnQgPSBjbGllbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXRcbiAgICAgICAgdG9wID0gY2xpZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZnQgPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICB0b3AgPSBwRWwub2Zmc2V0VG9wICsgcEVsLm9mZnNldEhlaWdodFxuICAgICAgICB3aGlsZSAoKHBFbCA9IHBFbC5vZmZzZXRQYXJlbnQpKSB7XG4gICAgICAgICAgbGVmdCArPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICAgIHRvcCArPSBwRWwub2Zmc2V0VG9wXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGhhbGlnbiA9IDBcbiAgICAgIGlmICh0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSkge1xuICAgICAgICBoYWxpZ24gPSAxXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZignY2VudGVyJykgPiAtMSkge1xuICAgICAgICBoYWxpZ24gPSAwLjVcbiAgICAgIH1cblxuICAgICAgbGVmdCAtPSAod2lkdGggLSBmaWVsZC5vZmZzZXRXaWR0aCkgKiBoYWxpZ25cblxuICAgICAgaWYgKHRoaXMuX28ucmVwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBvdmVyZmxvdyA9IHtcbiAgICAgICAgICByaWdodDogTWF0aC5tYXgoMCwgbGVmdCArIHdpZHRoIC0gKHZpZXdwb3J0V2lkdGggLSAyMCkpLFxuICAgICAgICAgIGxlZnQ6IE1hdGgubWF4KDAsIDIwIC0gbGVmdCksXG4gICAgICAgICAgdG9wOiBNYXRoLm1heCgwLCAtdG9wKVxuICAgICAgICB9XG4gICAgICAgIGxlZnQgKz0gb3ZlcmZsb3cubGVmdCAtIG92ZXJmbG93LnJpZ2h0XG4gICAgICAgIHRvcCArPSBvdmVyZmxvdy50b3BcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCdcbiAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgIH0sXG5cbiAgICBnZXREYXlDb25maWc6IGZ1bmN0aW9uKGRheSkge1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc0RhdGUodGhpcy5fZCkgPyBhcmVEYXRlc0VxdWFsKGRheSwgdGhpcy5fZCkgOiBmYWxzZVxuICAgICAgY29uc3QgaXNUb2RheSA9IGFyZURhdGVzRXF1YWwoZGF5LCBub3cpXG4gICAgICBjb25zdCBkYXlOdW1iZXIgPSBkYXkuZ2V0RGF0ZSgpXG4gICAgICBjb25zdCBtb250aE51bWJlciA9IGRheS5nZXRNb250aCgpXG4gICAgICBjb25zdCB5ZWFyTnVtYmVyID0gZGF5LmdldEZ1bGxZZWFyKClcbiAgICAgIGNvbnN0IGlzU3RhcnRSYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBhcmVEYXRlc0VxdWFsKG9wdHMuc3RhcnRSYW5nZSwgZGF5KVxuICAgICAgY29uc3QgaXNFbmRSYW5nZSA9IG9wdHMuZW5kUmFuZ2UgJiYgYXJlRGF0ZXNFcXVhbChvcHRzLmVuZFJhbmdlLCBkYXkpXG4gICAgICBjb25zdCBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgY29uc3QgaXNEaXNhYmxlZCA9XG4gICAgICAgIChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxuICAgICAgICAob3B0cy5tYXhEYXRlICYmIGRheSA+IG9wdHMubWF4RGF0ZSkgfHxcbiAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIGlzV2Vla2VuZChkYXkpKSB8fFxuICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4uY2FsbCh0aGlzLCBkYXkpKVxuXG4gICAgICBjb25zdCBkYXlDb25maWcgPSB7XG4gICAgICAgIGRhdGU6IGRheSxcbiAgICAgICAgZGF5OiBkYXlOdW1iZXIsXG4gICAgICAgIG1vbnRoOiBtb250aE51bWJlcixcbiAgICAgICAgeWVhcjogeWVhck51bWJlcixcbiAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgaXNUb2RheTogaXNUb2RheSxcbiAgICAgICAgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCxcbiAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXG4gICAgICAgIGlzRW5kUmFuZ2U6IGlzRW5kUmFuZ2UsXG4gICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxuICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHNcbiAgICAgIH1cblxuICAgICAgZGF5Q29uZmlnLnRleHQgPSBvcHRzLnRleHRGbiA/IG9wdHMudGV4dEZuLmNhbGwodGhpcywgZGF5Q29uZmlnKSA6IGRheU51bWJlclxuICAgICAgZGF5Q29uZmlnLmxhYmVsID0gb3B0cy5sYWJlbEZuID8gb3B0cy5sYWJlbEZuLmNhbGwodGhpcywgZGF5Q29uZmlnKSA6IGRheS50b0RhdGVTdHJpbmcoKVxuXG4gICAgICByZXR1cm4gZGF5Q29uZmlnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbmRlciBIVE1MIGZvciBhIHBhcnRpY3VsYXIgbW9udGhcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBkYXlzID0gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpXG4gICAgICBsZXQgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gICAgICBsZXQgZGF0YSA9IFtdXG4gICAgICBsZXQgcm93ID0gW11cblxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcbiAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheVxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xuICAgICAgICAgIGJlZm9yZSArPSA3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNlbGxzID0gZGF5cyArIGJlZm9yZVxuICAgICAgbGV0IGFmdGVyID0gY2VsbHNcblxuICAgICAgLy8gdmFyIHNlbGVjdGVkSW5Nb250aFxuXG4gICAgICB3aGlsZSAoYWZ0ZXIgPiA3KSB7XG4gICAgICAgIGFmdGVyIC09IDdcbiAgICAgIH1cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgLy8gaWYgKHRoaXMuX2QgJiYgbmV3IERhdGUoeWVhciwgbW9udGgsIDEpIDw9IHRoaXMuX2QgJiYgbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAxKSA+IHRoaXMuX2QpIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRJbk1vbnRoID0gdGhpcy5fZFxuICAgICAgLy8gfSBlbHNlIGlmIChuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkgPD0gbm93ICYmIG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMSkgPiBub3cpIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRJbk1vbnRoID0gbm93XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBzZWxlY3RlZEluTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSlcbiAgICAgIC8vIH1cblxuICAgICAgbGV0IGksIHJcbiAgICAgIGZvciAoaSA9IDAsIHIgPSAwOyBpIDwgY2VsbHM7IGkrKykge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSlcbiAgICAgICAgY29uc3QgZGF5Q29uZmlnID0gdGhpcy5nZXREYXlDb25maWcoZGF5KVxuXG4gICAgICAgIGRheUNvbmZpZy5pc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IGRheXMgKyBiZWZvcmVcbiAgICAgICAgZGF5Q29uZmlnLnRhYmluZGV4ID0gJy0xJ1xuXG4gICAgICAgIHJvdy5wdXNoKHJlbmRlckRheShkYXlDb25maWcpKVxuXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcbiAgICAgICAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgICAgICAgcm93LnVuc2hpZnQocmVuZGVyV2VlayhpIC0gYmVmb3JlLCBtb250aCwgeWVhcikpXG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEucHVzaChyZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMKSlcbiAgICAgICAgICByb3cgPSBbXVxuICAgICAgICAgIHIgPSAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJUYWJsZShvcHRzLCBkYXRhLCByYW5kSWQpXG4gICAgfSxcblxuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmIChpc0RhdGUodGhpcy5fby5taW5EYXRlKSAmJiB0aGlzLl9kIDwgdGhpcy5fby5taW5EYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKGlzRGF0ZSh0aGlzLl9vLm1heERhdGUpICYmIHRoaXMuX2QgPiB0aGlzLl9vLm1heERhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICBpc1Zpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGlkZVRpbWVvdXQpXG5cbiAgICAgIGlmICh0aGlzLl9kKSB7XG4gICAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5fZClcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnNwZWFrRWwpXG4gICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICBpZiAob3B0cy5jb250YWluZXIpIHtcbiAgICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuICAgICAgICB9IGVsc2UgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0cy5maWVsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmVsLCBvcHRzLmZpZWxkLm5leHRTaWJsaW5nKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IHRydWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25Eb2N1bWVudENsaWNrKVxuICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgYWRkQ2xhc3ModGhpcy5fby5maWVsZCwgJ2lzLXZpc2libGUtZGF0ZXBpY2tlcicpXG4gICAgICAgICAgdGhpcy5yZWNlbnRWYWx1ZSA9IHRoaXMuX28uZmllbGQudmFsdWVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnb3BlbicpXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkICYmIHRoaXMuX28uZmllbGQgIT09IHRoaXMuX28udHJpZ2dlcikge1xuICAgICAgICAgIHRoaXMuc3BlYWsodGhpcy5nZXRMYWJlbCgpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuX28uZmllbGRcblxuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gdGhpcy5yZWNlbnRWYWx1ZVxuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgZmllbGQuc2VsZWN0KClcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB0aGlzLmhpZGUodHJ1ZSlcbiAgICB9LFxuXG4gICAgaGlkZUFmdGVyOiBmdW5jdGlvbihkZWxheSwgY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oaWRlVGltZW91dClcbiAgICAgIGlmICh0aGlzLl92ICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmhpZGVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKGNhbmNlbGxlZClcbiAgICAgICAgfSwgZGVsYXkpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uKGNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgdiA9IHRoaXMuX3ZcbiAgICAgIGlmICh2ICE9PSBmYWxzZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5oaWRlVGltZW91dClcbiAgICAgICAgdGhpcy5oYXNLZXkgPSBmYWxzZVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkRvY3VtZW50Q2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLl9vLmZpZWxkLCAnaXMtdmlzaWJsZS1kYXRlcGlja2VyJylcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIGlmICh0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92ID0gZmFsc2VcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ2Nsb3NlJylcbiAgICAgICAgaWYgKHRoaXMuc3BlYWtFbC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLnNwZWFrRWwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25DbGljaywgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uQ2xpY2ssIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAna2V5ZG93bicsIHRoaXMuX29uS2V5Q2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaClcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdmb2N1cycsIHRoaXMuX29uSW5wdXRGb2N1cylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdibHVyJywgdGhpcy5fb25JbnB1dEJsdXIpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAna2V5ZG93bicsIHRoaXMuX29uS2V5Q2hhbmdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW1pdEV2ZW50KCdkZXN0cm95JylcbiAgICAgIHRoaXMub2ZmKClcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBuYW1lIGluIEV2RW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBQbGFpblBpY2tlci5wcm90b3R5cGVbbmFtZV0gPSBFdkVtaXR0ZXIucHJvdG90eXBlW25hbWVdXG4gIH1cblxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbIkV2RW1pdHRlciIsInByb3RvIiwicHJvdG90eXBlIiwib24iLCJldmVudE5hbWUiLCJsaXN0ZW5lciIsImV2ZW50cyIsIl9ldmVudHMiLCJsaXN0ZW5lcnMiLCJpbmRleE9mIiwicHVzaCIsIm9uY2UiLCJvbmNlRXZlbnRzIiwiX29uY2VFdmVudHMiLCJvbmNlTGlzdGVuZXJzIiwib2ZmIiwibGVuZ3RoIiwiaW5kZXgiLCJzcGxpY2UiLCJlbWl0RXZlbnQiLCJhcmdzIiwiaSIsImlzT25jZSIsImFwcGx5IiwiaGFzRXZlbnRMaXN0ZW5lcnMiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZG9jdW1lbnQiLCJhZGRFdmVudCIsImVsIiwiZSIsImNhbGxiYWNrIiwiY2FwdHVyZSIsImF0dGFjaEV2ZW50IiwicmVtb3ZlRXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJmaXJlRXZlbnQiLCJkYXRhIiwiZXYiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImV4dGVuZCIsImRpc3BhdGNoRXZlbnQiLCJjcmVhdGVFdmVudE9iamVjdCIsInRyaW0iLCJzdHIiLCJyZXBsYWNlIiwiaGFzQ2xhc3MiLCJjbiIsImNsYXNzTmFtZSIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0FycmF5Iiwib2JqIiwidGVzdCIsIk9iamVjdCIsInRvU3RyaW5nIiwiY2FsbCIsImlzRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsImlzV2Vla2VuZCIsImRhdGUiLCJkYXkiLCJnZXREYXkiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImFyZURhdGVzRXF1YWwiLCJhIiwiYiIsInRvSVNPRGF0ZVN0cmluZyIsInkiLCJnZXRGdWxsWWVhciIsIm0iLCJTdHJpbmciLCJnZXRNb250aCIsImQiLCJnZXREYXRlIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJzbGljZSIsImFkanVzdENhbGVuZGFyIiwiY2FsZW5kYXIiLCJNYXRoIiwiY2VpbCIsImFicyIsImZsb29yIiwiY29udGFpbnNFbGVtZW50IiwiY29udGFpbmVyIiwiZWxlbWVudCIsInBhcmVudE5vZGUiLCJkZWZhdWx0cyIsInZhbHVlIiwicGFyc2UiLCJkYXRlU3RyIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwiX28iLCJpMThuIiwibGFuZ3VhZ2UiLCJkYXlTdHIiLCJ3ZWVrZGF5cyIsInRleHQiLCJpc1RvZGF5IiwidG9kYXkiLCJpc0Rpc2FibGVkIiwiZGlzYWJsZWQiLCJxdWVyeVNlbGVjdG9yIiwiZ2V0QXR0cmlidXRlIiwicmVuZGVyRGF5TmFtZSIsIm9wdHMiLCJhYmJyIiwiZmlyc3REYXkiLCJ3ZWVrZGF5c1Nob3J0IiwicmVuZGVyRGF5IiwiYXJyIiwiYXJpYVNlbGVjdGVkIiwiYXJpYUxhYmVsIiwibGFiZWwiLCJ0YWJpbmRleCIsImlzRW1wdHkiLCJzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzIiwiaXNTZWxlY3RlZCIsImlzSW5SYW5nZSIsImlzU3RhcnRSYW5nZSIsImlzRW5kUmFuZ2UiLCJqb2luIiwicmVuZGVyV2VlayIsIm9uZWphbiIsIndlZWtOdW0iLCJyZW5kZXJSb3ciLCJkYXlzIiwiaXNSVEwiLCJyZXZlcnNlIiwicmVuZGVyQm9keSIsInJvd3MiLCJyZW5kZXJIZWFkIiwic2hvd1dlZWtOdW1iZXIiLCJyZW5kZXJUaXRsZSIsImluc3RhbmNlIiwiYyIsInJlZlllYXIiLCJyYW5kSWQiLCJqIiwiaXNNaW5ZZWFyIiwibWluWWVhciIsImlzTWF4WWVhciIsIm1heFllYXIiLCJodG1sIiwibW9udGhIdG1sIiwieWVhckh0bWwiLCJwcmV2IiwibmV4dCIsIm1pbk1vbnRoIiwibWF4TW9udGgiLCJtb250aHMiLCJ5ZWFyUmFuZ2UiLCJ5ZWFyU3VmZml4Iiwic2hvd01vbnRoQWZ0ZXJZZWFyIiwicHJldmlvdXNNb250aCIsIm51bWJlck9mTW9udGhzIiwibmV4dE1vbnRoIiwicmVuZGVyVGFibGUiLCJQbGFpblBpY2tlciIsIm9wdGlvbnMiLCJzZWxmIiwiY29uZmlnIiwiX29uQ2xpY2siLCJfdiIsImV2ZW50IiwidGFyZ2V0Iiwic3JjRWxlbWVudCIsInN0b3BQcm9wYWdhdGlvbiIsImJvdW5kIiwiaGlkZUFmdGVyIiwic2V0RGF0ZSIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbkNoYW5nZSIsImdvdG9Nb250aCIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiY2FwdHVyZUtleSIsImhhc0tleSIsInN0b3BFdmVudCIsImlzVmlzaWJsZSIsImtleUNvZGUiLCJ0cmlnZ2VyIiwiZm9jdXMiLCJzZWxlY3QiLCJoaWRlIiwiY2FuY2VsIiwiYWRqdXN0RGF0ZSIsImFkanVzdE1vbnRoIiwiYWRqdXN0WWVhciIsIl9vbklucHV0Q2hhbmdlIiwiZmlyZWRCeSIsInBhcnNlRm4iLCJmaWVsZCIsIl9vblRvdWNoIiwidG91Y2hlZCIsIl9vbklucHV0Rm9jdXMiLCJibHVyIiwiZm9jdXNJbnNpZGUiLCJzaG93IiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfb25Eb2N1bWVudENsaWNrIiwib25jaGFuZ2UiLCJzZXRBdHRyaWJ1dGUiLCJpbml0IiwiY3JlYXRlRWxlbWVudCIsInRoZW1lIiwiZ2V0TGFiZWwiLCJzcGVha0VsIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsIm1pbkRhdGUiLCJtYXhEYXRlIiwiYXV0b0luaXQiLCJub3ciLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJsYWJlbEZuIiwibm9tIiwicGFyc2VJbnQiLCJzZXRNaW5EYXRlIiwic2V0TWF4RGF0ZSIsImZhbGxiYWNrIiwiX2QiLCJmb3JtYXRGbiIsInRvRGF0ZVN0cmluZyIsImNhbGVuZGFycyIsInByZXZlbnRPblNlbGVjdCIsImRyYXciLCJtaW4iLCJtYXgiLCJzcGVhayIsImdldERheUNvbmZpZyIsImlkIiwidGV4dENvbnRlbnQiLCJpbm5lclRleHQiLCJoZWxwIiwiaW5uZXJIVE1MIiwibmV3Q2FsZW5kYXIiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsIm1haW5DYWxlbmRhciIsImFkanVzdENhbGVuZGFycyIsImRpZmZlcmVuY2UiLCJuZXdEYXkiLCJ2YWx1ZU9mIiwic2VsZWN0RGF0ZSIsInN0YXJ0UmFuZ2UiLCJlbmRSYW5nZSIsImFjdGlvbiIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlcXVlc3RlZCIsIl9kcmF3IiwiYWRqdXN0UG9zaXRpb24iLCJfYWRqdXN0UG9zaXRpb24iLCJmb2N1c1BpY2tlciIsImZvcmNlIiwiX3JlcXVlc3QiLCJfeSIsIl9tIiwicmFuZG9tIiwic3Vic3RyIiwicmVuZGVyIiwiYXV0b2ZvY3VzIiwidHlwZSIsInNldFRpbWVvdXQiLCJsZWZ0IiwidG9wIiwiY2xpZW50UmVjdCIsInN0eWxlIiwicG9zaXRpb24iLCJwb3NpdGlvblRhcmdldCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFnZVhPZmZzZXQiLCJib3R0b20iLCJwYWdlWU9mZnNldCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJvZmZzZXRQYXJlbnQiLCJoYWxpZ24iLCJyZXBvc2l0aW9uIiwib3ZlcmZsb3ciLCJyaWdodCIsImRheU51bWJlciIsIm1vbnRoTnVtYmVyIiwieWVhck51bWJlciIsImRheUNvbmZpZyIsInRleHRGbiIsImJlZm9yZSIsInJvdyIsImNlbGxzIiwiYWZ0ZXIiLCJyIiwidW5zaGlmdCIsImhpZGVUaW1lb3V0IiwiYm9keSIsImFwcGVuZENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwibmV4dFNpYmxpbmciLCJyZWNlbnRWYWx1ZSIsImRlbGF5IiwiY2FuY2VsbGVk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
