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
    return el.addEventListener(e, callback, !!capture);
  };

  var removeEvent = function removeEvent(el, e, callback, capture) {
    return el.removeEventListener(e, callback, !!capture);
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
    if (!hasClass(el, cn)) el.className = el.className === '' ? cn : el.className + ' ' + cn;
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

    // SELECT
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

      var captureKey = function captureKey() {
        self.hasKey = true;
        stopEvent();
      };

      var stopEvent = function stopEvent() {
        e.preventDefault();
        e.stopPropagation();
      };

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

    self._onTouch = function (e) {
      if (!self.isVisible() || e.target !== opts.field) {
        self.touched = true;
      }
    };

    self._onInputFocus = function () {
      if (self.touched && opts.field && opts.field.nodeName === 'INPUT') {
        opts.field.blur();
        self.touched = false;
        self.focusInside = true;
      }
      self.show();
    };

    self._onInputClick = function () {
      self.touched = false;
      self.show();
    };

    self._onInputBlur = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhaW5waWNrZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9wbGFpbnBpY2tlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcbiAgY29uc3QgRXZFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbiAgICBjb25zdCBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGVcblxuICAgIHByb3RvLm9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKCFldmVudE5hbWUgfHwgIWxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZXZlbnRzID0gKHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fSlcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IChldmVudHNbZXZlbnROYW1lXSA9IGV2ZW50c1tldmVudE5hbWVdIHx8IFtdKVxuICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcHJvdG8ub25jZSA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICghZXZlbnROYW1lIHx8ICFsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMub24oZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAgICAgIGNvbnN0IG9uY2VFdmVudHMgPSAodGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge30pXG4gICAgICBjb25zdCBvbmNlTGlzdGVuZXJzID0gKG9uY2VFdmVudHNbZXZlbnROYW1lXSA9IG9uY2VFdmVudHNbZXZlbnROYW1lXSB8fCB7fSlcbiAgICAgIG9uY2VMaXN0ZW5lcnNbbGlzdGVuZXJdID0gdHJ1ZVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHByb3RvLm9mZiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgZXZlbnROYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldmVudE5hbWVdXG4gICAgICBpZiAoIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgcHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBhcmdzKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV1cbiAgICAgIGlmICghbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGV0IGkgPSAwXG4gICAgICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICAgIGFyZ3MgPSBhcmdzIHx8IFtdXG4gICAgICBjb25zdCBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzW2V2ZW50TmFtZV1cblxuICAgICAgd2hpbGUgKGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1tsaXN0ZW5lcl1cbiAgICAgICAgaWYgKGlzT25jZSkge1xuICAgICAgICAgIHRoaXMub2ZmKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gICAgICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbbGlzdGVuZXJdXG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgaSArPSBpc09uY2UgPyAwIDogMVxuICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHJldHVybiBFdkVtaXR0ZXJcbiAgfSkoKVxuXG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cblxuICAvLyBjb25zdCBsb2cgPSBmdW5jdGlvbigpIHtcbiAgLy8gICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXG4gIC8vIH1cblxuICBjb25zdCBoYXNFdmVudExpc3RlbmVycyA9ICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcblxuICBjb25zdCBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudFxuXG4gIGNvbnN0IGFkZEV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHJlbW92ZUV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IGZpcmVFdmVudCA9IChlbCwgZXZlbnROYW1lLCBkYXRhKSA9PiB7XG4gICAgbGV0IGV2XG5cbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKVxuICAgICAgZXYuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQoZXYpXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBldilcbiAgICB9XG4gIH1cblxuICBjb25zdCB0cmltID0gc3RyID0+IChzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpKVxuXG4gIGNvbnN0IGhhc0NsYXNzID0gKGVsLCBjbikgPT4gKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykuaW5kZXhPZignICcgKyBjbiArICcgJykgIT09IC0xXG5cbiAgY29uc3QgYWRkQ2xhc3MgPSAoZWwsIGNuKSA9PiB7XG4gICAgaWYgKCFoYXNDbGFzcyhlbCwgY24pKSBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgPT09ICcnID8gY24gOiBlbC5jbGFzc05hbWUgKyAnICcgKyBjblxuICB9XG5cbiAgY29uc3QgcmVtb3ZlQ2xhc3MgPSAoZWwsIGNuKSA9PiB7XG4gICAgZWwuY2xhc3NOYW1lID0gdHJpbSgoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5yZXBsYWNlKCcgJyArIGNuICsgJyAnLCAnICcpKVxuICB9XG5cbiAgY29uc3QgaXNBcnJheSA9IG9iaiA9PiAvQXJyYXkvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpXG5cbiAgY29uc3QgaXNEYXRlID0gb2JqID0+IC9EYXRlLy50ZXN0KE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSAmJiAhaXNOYU4ob2JqLmdldFRpbWUoKSlcblxuICBjb25zdCBpc1dlZWtlbmQgPSBkYXRlID0+IHtcbiAgICBjb25zdCBkYXkgPSBkYXRlLmdldERheSgpXG4gICAgcmV0dXJuIGRheSA9PT0gMCB8fCBkYXkgPT09IDZcbiAgfVxuXG4gIGNvbnN0IGlzTGVhcFllYXIgPSB5ZWFyID0+ICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCB5ZWFyICUgNDAwID09PSAwXG5cbiAgY29uc3QgZ2V0RGF5c0luTW9udGggPSAoeWVhciwgbW9udGgpID0+IFszMSwgaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF1cblxuICBjb25zdCBzZXRUb1N0YXJ0T2ZEYXkgPSBkYXRlID0+IHtcbiAgICBpZiAoaXNEYXRlKGRhdGUpKSBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gIH1cblxuICBjb25zdCBhcmVEYXRlc0VxdWFsID0gKGEsIGIpID0+IHtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKCFhIHx8ICFiKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgY29uc3QgdG9JU09EYXRlU3RyaW5nID0gZGF0ZSA9PiB7XG4gICAgY29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKVxuICAgIGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICBjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKVxuICAgIHJldHVybiB5ICsgJy8nICsgKG0ubGVuZ3RoID09PSAxID8gJzAnIDogJycpICsgbSArICcvJyArIChkLmxlbmd0aCA9PT0gMSA/ICcwJyA6ICcnKSArIGRcbiAgfVxuXG4gIGNvbnN0IGV4dGVuZCA9ICh0bywgZnJvbSwgb3ZlcndyaXRlKSA9PiB7XG4gICAgZm9yIChjb25zdCBwcm9wIGluIGZyb20pIHtcbiAgICAgIGNvbnN0IGhhc1Byb3AgPSB0b1twcm9wXSAhPT0gdW5kZWZpbmVkXG4gICAgICBpZiAoaGFzUHJvcCAmJiB0eXBlb2YgZnJvbVtwcm9wXSA9PT0gJ29iamVjdCcgJiYgZnJvbVtwcm9wXSAhPT0gbnVsbCAmJiBmcm9tW3Byb3BdLm5vZGVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzRGF0ZShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gbmV3IERhdGUoZnJvbVtwcm9wXS5nZXRUaW1lKCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF0uc2xpY2UoMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9bcHJvcF0gPSBleHRlbmQoe30sIGZyb21bcHJvcF0sIG92ZXJ3cml0ZSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvdmVyd3JpdGUgfHwgIWhhc1Byb3ApIHtcbiAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBjYWxlbmRhciA9PiB7XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xuICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCArPSAxMlxuICAgIH1cbiAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xuICAgICAgY2FsZW5kYXIueWVhciArPSBNYXRoLmZsb29yKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggLT0gMTJcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyXG4gIH1cblxuICBjb25zdCBjb250YWluc0VsZW1lbnQgPSAoY29udGFpbmVyLCBlbGVtZW50KSA9PiB7XG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChjb250YWluZXIgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgLy8gaW5pdGlhbGlzZSByaWdodCBhd2F5LCBpZiBmYWxzZSwgeW91IGhhdmUgdG8gY2FsbCBuZXcgUGxhaW5QaWNrZXIob3B0aW9ucykuaW5pdCgpO1xuICAgIGF1dG9Jbml0OiB0cnVlLFxuXG4gICAgLy8gYmluZCB0aGUgcGlja2VyIHRvIGEgZm9ybSBmaWVsZFxuICAgIGZpZWxkOiBudWxsLFxuXG4gICAgLy8gZGVmYXVsdCBgZmllbGRgIGlmIGBmaWVsZGAgaXMgc2V0XG4gICAgdHJpZ2dlcjogbnVsbCxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgc2hvdy9oaWRlIHRoZSBwaWNrZXIgb24gYGZpZWxkYCBmb2N1cyAoZGVmYXVsdCBgdHJ1ZWAgaWYgYGZpZWxkYCBpcyBzZXQpXG4gICAgYm91bmQ6IHVuZGVmaW5lZCxcblxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyLCByZWxhdGl2ZSB0byB0aGUgZmllbGQgKGRlZmF1bHQgdG8gYm90dG9tICYgbGVmdClcbiAgICAvLyAoJ2JvdHRvbScgJiAnbGVmdCcga2V5d29yZHMgYXJlIG5vdCB1c2VkLCAndG9wJyAmICdyaWdodCcgYXJlIG1vZGlmaWVyIG9uIHRoZSBib3R0b20vbGVmdCBwb3NpdGlvbilcbiAgICBwb3NpdGlvblRhcmdldDogbnVsbCxcbiAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgZml0IGluIHRoZSB2aWV3cG9ydCBldmVuIGlmIGl0IG1lYW5zIHJlcG9zaXRpb25pbmcgZnJvbSB0aGUgcG9zaXRpb24gb3B0aW9uXG4gICAgcmVwb3NpdGlvbjogdHJ1ZSxcblxuICAgIC8vIHRoZSBkZWZhdWx0IG91dHB1dCBmb3JtYXQgZm9yIGAudG9TdHJpbmcoKWAgYW5kIGBmaWVsZGAgdmFsdWVcbiAgICAvLyBhIGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIHN0cmluZyB9XG4gICAgLy8gY291bGQgYmUgZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcodGhpcy5fby5pMThuLmxhbmd1YWdlLCB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycsIHdlZWtkYXk6ICdzaG9ydCd9KVxuICAgIGZvcm1hdEZuOiBkYXRlID0+IHRvSVNPRGF0ZVN0cmluZyhkYXRlKSxcblxuICAgIHBhcnNlRm46IHZhbHVlID0+IG5ldyBEYXRlKERhdGUucGFyc2UodmFsdWUpKSxcblxuICAgIC8vIHRoZSBpbml0aWFsIGRhdGUgdG8gdmlldyB3aGVuIGZpcnN0IG9wZW5lZFxuICAgIGRlZmF1bHREYXRlOiBudWxsLFxuXG4gICAgLy8gbWFrZSB0aGUgYGRlZmF1bHREYXRlYCB0aGUgaW5pdGlhbCBzZWxlY3RlZCB2YWx1ZVxuICAgIHNldERlZmF1bHREYXRlOiBmYWxzZSxcblxuICAgIC8vIGZpcnN0IGRheSBvZiB3ZWVrICgwOiBTdW5kYXksIDE6IE1vbmRheSBldGMpXG4gICAgZmlyc3REYXk6IDAsXG5cbiAgICBkaXNhYmxlRGF5Rm46IG51bGwsXG5cbiAgICBsYWJlbEZuOiBmdW5jdGlvbihkYXkpIHtcbiAgICAgIGNvbnN0IGRhdGVTdHIgPSBkYXkuZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcodGhpcy5fby5pMThuLmxhbmd1YWdlLCB7XG4gICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgbW9udGg6ICdsb25nJyxcbiAgICAgICAgZGF5OiAnbnVtZXJpYydcbiAgICAgIH0pXG4gICAgICBjb25zdCBkYXlTdHIgPSB0aGlzLl9vLmkxOG4ud2Vla2RheXNbZGF5LmRhdGUuZ2V0RGF5KCldXG4gICAgICBsZXQgdGV4dCA9IGRheVN0ciArICcsICcgKyBkYXRlU3RyXG4gICAgICBpZiAoZGF5LmlzVG9kYXkpIHtcbiAgICAgICAgdGV4dCArPSAnICgnICsgdGhpcy5fby5pMThuLnRvZGF5ICsgJyknXG4gICAgICB9XG4gICAgICBpZiAoZGF5LmlzRGlzYWJsZWQpIHtcbiAgICAgICAgdGV4dCA9ICcoJyArIHRoaXMuX28uaTE4bi5kaXNhYmxlZCArICcpICcgKyB0ZXh0XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dFxuICAgIH0sXG5cbiAgICB0ZXh0Rm46IGRheSA9PiB7XG4gICAgICBjb25zdCB0ZXh0ID0gZGF5LmRheVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9LFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIGhvdyBtYW55IG1vbnRocyBhcmUgdmlzaWJsZVxuICAgIG51bWJlck9mTW9udGhzOiAxLFxuXG4gICAgLy8gd2hlbiBudW1iZXJPZk1vbnRocyBpcyB1c2VkLCB0aGlzIHdpbGwgaGVscCB5b3UgdG8gY2hvb3NlIHdoZXJlIHRoZSBtYWluIGNhbGVuZGFyIHdpbGwgYmUgKGRlZmF1bHQgYGxlZnRgLCBjYW4gYmUgc2V0IHRvIGByaWdodGApXG4gICAgLy8gb25seSB1c2VkIGZvciB0aGUgZmlyc3QgZGlzcGxheSBvciB3aGVuIGEgc2VsZWN0ZWQgZGF0ZSBpcyBub3QgdmlzaWJsZVxuICAgIG1haW5DYWxlbmRhcjogJ2xlZnQnLFxuXG4gICAgLy8gU3BlY2lmeSBhIERPTSBlbGVtZW50IHRvIHJlbmRlciB0aGUgY2FsZW5kYXIgaW5cbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcblxuICAgIC8vIGludGVybmF0aW9uYWxpemF0aW9uXG4gICAgaTE4bjoge1xuICAgICAgbGFuZ3VhZ2U6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKS5nZXRBdHRyaWJ1dGUoJ2xhbmcnKSB8fCB1bmRlZmluZWQsXG4gICAgICB0b2RheTogJ1RvZGF5JyxcbiAgICAgIGRpc2FibGVkOiAnRGlzYWJsZWQnLFxuICAgICAgaGVscDogJ1VzZSBhcnJvdyBrZXlzIHRvIGNob29zZSBhIGRhdGUuJyxcblxuICAgICAgcHJldmlvdXNNb250aDogJ1ByZXZpb3VzIE1vbnRoJyxcbiAgICAgIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICAgICAgbW9udGhzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSxcbiAgICAgIHdlZWtkYXlzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgICB3ZWVrZGF5c1Nob3J0OiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddXG4gICAgfSxcblxuICAgIC8vIFRoZW1lIENsYXNzbmFtZVxuICAgIHRoZW1lOiBudWxsLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgY29uc3QgYXJpYUxhYmVsID0gb3B0cy5sYWJlbCB8fCAnJ1xuICAgIGNvbnN0IHRhYmluZGV4ID0gb3B0cy50YWJpbmRleFxuICAgIGlmIChvcHRzLmlzRW1wdHkpIHtcbiAgICAgIGlmIChvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMpIHtcbiAgICAgICAgYXJyLnB1c2goJ2lzLW91dHNpZGUtY3VyZW50LW1vbnRoJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNUb2RheSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5JylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5pc0luUmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1pbnJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTdGFydFJhbmdlKSB7XG4gICAgICBhcnIucHVzaCgnaXMtc3RhcnRyYW5nZScpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzRW5kUmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1lbmRyYW5nZScpXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICAnPHRkIGRhdGEtZGF5PVwiJyArXG4gICAgICBvcHRzLmRheSArXG4gICAgICAnXCIgY2xhc3M9XCInICtcbiAgICAgIGFyci5qb2luKCcgJykgK1xuICAgICAgJ1wiPicgK1xuICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19idXR0b24gZGF0ZXBpY2tlcl9fZGF5XCIgdHlwZT1cImJ1dHRvblwiICcgK1xuICAgICAgJ2RhdGEtZGF0ZXBpY2tlci15ZWFyPVwiJyArXG4gICAgICBvcHRzLnllYXIgK1xuICAgICAgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgK1xuICAgICAgb3B0cy5tb250aCArXG4gICAgICAnXCIgZGF0YS1kYXRlcGlja2VyLWRheT1cIicgK1xuICAgICAgb3B0cy5kYXkgK1xuICAgICAgJ1wiIGFyaWEtc2VsZWN0ZWQ9XCInICtcbiAgICAgIGFyaWFTZWxlY3RlZCArXG4gICAgICAnXCIgYXJpYS1sYWJlbD1cIicgK1xuICAgICAgYXJpYUxhYmVsICtcbiAgICAgICdcIiB0YWJpbmRleD1cIicgK1xuICAgICAgdGFiaW5kZXggK1xuICAgICAgJ1wiPicgK1xuICAgICAgb3B0cy50ZXh0ICtcbiAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICc8L3RkPidcbiAgICApXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKChuZXcgRGF0ZSh5LCBtLCBkKSAtIG9uZWphbikgLyA4NjQwMDAwMCArIG9uZWphbi5nZXREYXkoKSArIDEpIC8gNylcbiAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImRhdGVwaWNrZXJfX3dlZWtcIj4nICsgd2Vla051bSArICc8L3RkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclJvdyA9IChkYXlzLCBpc1JUTCkgPT4gJzx0cj4nICsgKGlzUlRMID8gZGF5cy5yZXZlcnNlKCkgOiBkYXlzKS5qb2luKCcnKSArICc8L3RyPidcblxuICBjb25zdCByZW5kZXJCb2R5ID0gcm93cyA9PiAnPHRib2R5PicgKyByb3dzLmpvaW4oJycpICsgJzwvdGJvZHk+J1xuXG4gIGNvbnN0IHJlbmRlckhlYWQgPSBvcHRzID0+IHtcbiAgICBsZXQgaVxuICAgIGxldCBhcnIgPSBbXVxuICAgIGlmIChvcHRzLnNob3dXZWVrTnVtYmVyKSB7XG4gICAgICBhcnIucHVzaCgnPHRoPjwvdGg+JylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzx0aCBzY29wZT1cImNvbFwiPjxhYmJyIHRpdGxlPVwiJyArIHJlbmRlckRheU5hbWUob3B0cywgaSkgKyAnXCI+JyArIHJlbmRlckRheU5hbWUob3B0cywgaSwgdHJ1ZSkgKyAnPC9hYmJyPjwvdGg+JylcbiAgICB9XG4gICAgcmV0dXJuICc8dGhlYWQgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHRyPicgKyAob3B0cy5pc1JUTCA/IGFyci5yZXZlcnNlKCkgOiBhcnIpLmpvaW4oJycpICsgJzwvdHI+PC90aGVhZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJUaXRsZSA9IChpbnN0YW5jZSwgYywgeWVhciwgbW9udGgsIHJlZlllYXIsIHJhbmRJZCkgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGpcbiAgICBsZXQgYXJyXG4gICAgY29uc3Qgb3B0cyA9IGluc3RhbmNlLl9vXG4gICAgY29uc3QgaXNNaW5ZZWFyID0geWVhciA9PT0gb3B0cy5taW5ZZWFyXG4gICAgY29uc3QgaXNNYXhZZWFyID0geWVhciA9PT0gb3B0cy5tYXhZZWFyXG4gICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+J1xuICAgIGxldCBtb250aEh0bWxcbiAgICBsZXQgeWVhckh0bWxcbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goXG4gICAgICAgICc8b3B0aW9uIHZhbHVlPVwiJyArXG4gICAgICAgICAgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICtcbiAgICAgICAgICAnXCInICtcbiAgICAgICAgICAoaSA9PT0gbW9udGggPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgK1xuICAgICAgICAgICgoaXNNaW5ZZWFyICYmIGkgPCBvcHRzLm1pbk1vbnRoKSB8fCAoaXNNYXhZZWFyICYmIGkgPiBvcHRzLm1heE1vbnRoKSA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpICtcbiAgICAgICAgICAnPicgK1xuICAgICAgICAgIG9wdHMuaTE4bi5tb250aHNbaV0gK1xuICAgICAgICAgICc8L29wdGlvbj4nXG4gICAgICApXG4gICAgfVxuXG4gICAgbW9udGhIdG1sID1cbiAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICtcbiAgICAgIG9wdHMuaTE4bi5tb250aHNbbW9udGhdICtcbiAgICAgICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC1tb250aFwiIHRhYmluZGV4PVwiLTFcIj4nICtcbiAgICAgIGFyci5qb2luKCcnKSArXG4gICAgICAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICBpID0gb3B0cy55ZWFyUmFuZ2VbMF1cbiAgICAgIGogPSBvcHRzLnllYXJSYW5nZVsxXSArIDFcbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZVxuICAgICAgaiA9IDEgKyB5ZWFyICsgb3B0cy55ZWFyUmFuZ2VcbiAgICB9XG5cbiAgICBmb3IgKGFyciA9IFtdOyBpIDwgaiAmJiBpIDw9IG9wdHMubWF4WWVhcjsgaSsrKSB7XG4gICAgICBpZiAoaSA+PSBvcHRzLm1pblllYXIpIHtcbiAgICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIGkgKyAnPC9vcHRpb24+JylcbiAgICAgIH1cbiAgICB9XG4gICAgeWVhckh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgeWVhciArXG4gICAgICBvcHRzLnllYXJTdWZmaXggK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICBhcnIuam9pbignJykgK1xuICAgICAgJzwvc2VsZWN0PjwvZGl2PidcblxuICAgIGlmIChvcHRzLnNob3dNb250aEFmdGVyWWVhcikge1xuICAgICAgaHRtbCArPSB5ZWFySHRtbCArIG1vbnRoSHRtbFxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9IG1vbnRoSHRtbCArIHllYXJIdG1sXG4gICAgfVxuXG4gICAgaWYgKGlzTWluWWVhciAmJiAobW9udGggPT09IDAgfHwgb3B0cy5taW5Nb250aCA+PSBtb250aCkpIHtcbiAgICAgIHByZXYgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChpc01heFllYXIgJiYgKG1vbnRoID09PSAxMSB8fCBvcHRzLm1heE1vbnRoIDw9IG1vbnRoKSkge1xuICAgICAgbmV4dCA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGMgPT09IDApIHtcbiAgICAgIGh0bWwgKz1cbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19wcmV2JyArXG4gICAgICAgIChwcmV2ID8gJycgOiAnIGlzLWRpc2FibGVkJykgK1xuICAgICAgICAnXCIgJyArXG4gICAgICAgIChwcmV2ID8gJycgOiAnZGlzYWJsZWQgJykgK1xuICAgICAgICAndHlwZT1cImJ1dHRvblwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICByYW5kSWQgK1xuICAgICAgICAnXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgICBvcHRzLmkxOG4ucHJldmlvdXNNb250aCArXG4gICAgICAgICc8L2J1dHRvbj4nXG4gICAgfVxuICAgIGlmIChjID09PSBpbnN0YW5jZS5fby5udW1iZXJPZk1vbnRocyAtIDEpIHtcbiAgICAgIGh0bWwgKz1cbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19uZXh0JyArXG4gICAgICAgIChuZXh0ID8gJycgOiAnIGlzLWRpc2FibGVkJykgK1xuICAgICAgICAnXCIgJyArXG4gICAgICAgIChuZXh0ID8gJycgOiAnZGlzYWJsZWQgJykgK1xuICAgICAgICAndHlwZT1cImJ1dHRvblwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICByYW5kSWQgK1xuICAgICAgICAnXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgICBvcHRzLmkxOG4ubmV4dE1vbnRoICtcbiAgICAgICAgJzwvYnV0dG9uPidcbiAgICB9XG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSAob3B0cywgZGF0YSwgcmFuZElkKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICc8dGFibGUgY2VsbHBhZGRpbmc9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2xhc3M9XCJkYXRlcGlja2VyX190YWJsZVwiIHJvbGU9XCJwcmVzZW50YXRpb25cIj4nICtcbiAgICAgIHJlbmRlckhlYWQob3B0cykgK1xuICAgICAgcmVuZGVyQm9keShkYXRhKSArXG4gICAgICAnPC90YWJsZT4nXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFBsYWluUGlja2VyIGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdCBQbGFpblBpY2tlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuXG4gICAgc2VsZi5fb25DbGljayA9IGUgPT4ge1xuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uJykgJiYgIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWVtcHR5JykgJiYgIWhhc0NsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgICAvLyB0aGlzLl92ICYmIGNvbnNvbGUubG9nKCdIaWRpbmcgc29vbiBiZWNhdXNlIGRhdGUgaGFzIGJlZW4gc2VsZWN0ZWQgYW5kIHBpY2tlciBpcyBib3VuZC4nKVxuICAgICAgICAgICAgc2VsZi5oaWRlQWZ0ZXIoMjAwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnNldERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShcbiAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSxcbiAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLW1vbnRoJyksXG4gICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU0VMRUNUXG4gICAgc2VsZi5fb25DaGFuZ2UgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QtbW9udGgnKSkge1xuICAgICAgICBzZWxmLmdvdG9Nb250aCh0YXJnZXQudmFsdWUpXG4gICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC15ZWFyJykpIHtcbiAgICAgICAgc2VsZi5nb3RvWWVhcih0YXJnZXQudmFsdWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25LZXlDaGFuZ2UgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuXG4gICAgICBjb25zdCBjYXB0dXJlS2V5ID0gKCkgPT4ge1xuICAgICAgICBzZWxmLmhhc0tleSA9IHRydWVcbiAgICAgICAgc3RvcEV2ZW50KClcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RvcEV2ZW50ID0gKCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5pc1Zpc2libGUoKSkge1xuICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgIGNhc2UgOSAvKiBUQUIgKi86XG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNLZXkgJiYgc2VsZi5fby50cmlnZ2VyKSB7XG4gICAgICAgICAgICAgIHNlbGYuX28udHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgICAgIHNlbGYuaGFzS2V5ID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzMjogLyogU1BBQ0UgKi9cbiAgICAgICAgICBjYXNlIDEzIC8qIEVOVEVSICovOlxuICAgICAgICAgICAgaWYgKHNlbGYuaGFzS2V5ICYmICFvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgICBzdG9wRXZlbnQoKVxuICAgICAgICAgICAgICBpZiAoc2VsZi5fby50cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fby50cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5fby50cmlnZ2VyLnNlbGVjdCgpXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDI3IC8qIEVTQ0FQRSAqLzpcbiAgICAgICAgICAgIGlmICghb3B0cy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgc3RvcEV2ZW50KClcbiAgICAgICAgICAgICAgc2VsZi5jYW5jZWwoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM3IC8qIExFRlQgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgtMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzOCAvKiBVUCAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKC03KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM5IC8qIFJJR0hUICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoKzEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgNDAgLyogRE9XTiAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCs3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDMzIC8qIFBBR0VfVVAgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0TW9udGgoLTEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzQgLyogUEFHRV9ET1dOICovOlxuICAgICAgICAgICAgY2FwdHVyZUtleSgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdE1vbnRoKCsxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM1IC8qIEVORCAqLzpcbiAgICAgICAgICAgIGNhcHR1cmVLZXkoKVxuICAgICAgICAgICAgc2VsZi5hZGp1c3RZZWFyKCsxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM2IC8qIEhPTUUgKi86XG4gICAgICAgICAgICBjYXB0dXJlS2V5KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0WWVhcigtMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Q2hhbmdlID0gZSA9PiB7XG4gICAgICBpZiAoZS5maXJlZEJ5ID09PSBzZWxmKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRlID0gb3B0cy5wYXJzZUZuLmNhbGwoc2VsZiwgb3B0cy5maWVsZC52YWx1ZSlcblxuICAgICAgaWYgKGlzRGF0ZShkYXRlKSkge1xuICAgICAgICBzZWxmLnNldERhdGUoZGF0ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShudWxsKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uVG91Y2ggPSBlID0+IHtcbiAgICAgIGlmICghc2VsZi5pc1Zpc2libGUoKSB8fCBlLnRhcmdldCAhPT0gb3B0cy5maWVsZCkge1xuICAgICAgICBzZWxmLnRvdWNoZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gKCkgPT4ge1xuICAgICAgaWYgKHNlbGYudG91Y2hlZCAmJiBvcHRzLmZpZWxkICYmIG9wdHMuZmllbGQubm9kZU5hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgc2VsZi50b3VjaGVkID0gZmFsc2VcbiAgICAgICAgc2VsZi5mb2N1c0luc2lkZSA9IHRydWVcbiAgICAgIH1cbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENsaWNrID0gKCkgPT4ge1xuICAgICAgc2VsZi50b3VjaGVkID0gZmFsc2VcbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEJsdXIgPSAoKSA9PiB7XG4gICAgICBpZiAoc2VsZi5oYXNLZXkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxldCBwRWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBzZWxmLmVsKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKChwRWwgPSBwRWwucGFyZW50Tm9kZSkpXG5cbiAgICAgIGlmICghc2VsZi5fYykge1xuICAgICAgICAvLyB0aGlzLl92ICYmIGxvZygnSGlkaW5nIHNvb24gYmVjYXVzZSBpbnB1dCB3YXMgYmx1cmVkJywgZXZlbnQudGFyZ2V0LCBzZWxmLl9iKVxuICAgICAgICBzZWxmLmhpZGUodHJ1ZSlcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uRG9jdW1lbnRDbGljayA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGxldCBwRWwgPSB0YXJnZXRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGNvbnRhaW5zRWxlbWVudChzZWxmLmVsLCB0YXJnZXQpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFoYXNFdmVudExpc3RlbmVycyAmJiBoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QnKSkge1xuICAgICAgICBpZiAoIXRhcmdldC5vbmNoYW5nZSkge1xuICAgICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ29uY2hhbmdlJywgJ3JldHVybjsnKVxuICAgICAgICAgIGFkZEV2ZW50KHRhcmdldCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcbiAgICAgIGlmIChzZWxmLl92ICYmIHRhcmdldCAhPT0gb3B0cy50cmlnZ2VyICYmIHBFbCAhPT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgIHNlbGYuaGlkZSh0cnVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdiA9IGZhbHNlXG5cbiAgICAgIHNlbGYuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgc2VsZi5lbC5jbGFzc05hbWUgPSAnZGF0ZXBpY2tlcicgKyAob3B0cy5pc1JUTCA/ICcgaXMtcnRsJyA6ICcnKSArIChvcHRzLnRoZW1lID8gJyAnICsgb3B0cy50aGVtZSA6ICcnKVxuICAgICAgc2VsZi5lbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYXBwbGljYXRpb24nKVxuICAgICAgc2VsZi5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBzZWxmLmdldExhYmVsKCkpXG5cbiAgICAgIHNlbGYuc3BlYWtFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBzZWxmLnNwZWFrRWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3N0YXR1cycpXG4gICAgICBzZWxmLnNwZWFrRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAnYXNzZXJ0aXZlJylcbiAgICAgIHNlbGYuc3BlYWtFbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtYXRvbWljJywgJ3RydWUnKVxuICAgICAgc2VsZi5zcGVha0VsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAncG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAtOTk5OXB4OyBvcGFjaXR5OiAwOycpXG5cbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdtb3VzZWRvd24nLCBzZWxmLl9vbkNsaWNrLCB0cnVlKVxuICAgICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25DbGljaywgdHJ1ZSlcbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdjaGFuZ2UnLCBzZWxmLl9vbkNoYW5nZSlcbiAgICAgIGFkZEV2ZW50KHNlbGYuZWwsICdrZXlkb3duJywgc2VsZi5fb25LZXlDaGFuZ2UpXG5cbiAgICAgIGlmIChvcHRzLmZpZWxkKSB7XG4gICAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICAgIGlmICghb3B0cy5kZWZhdWx0RGF0ZSkge1xuICAgICAgICAgIG9wdHMuZGVmYXVsdERhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLmZpZWxkLnZhbHVlKVxuICAgICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGRlZkRhdGUgPSBvcHRzLmRlZmF1bHREYXRlXG5cbiAgICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgICAgaWYgKG9wdHMuc2V0RGVmYXVsdERhdGUpIHtcbiAgICAgICAgICBzZWxmLnNldERhdGUoZGVmRGF0ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmdvdG9EYXRlKGRlZkRhdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZkRhdGUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIGlmIChvcHRzLm1pbkRhdGUgJiYgb3B0cy5taW5EYXRlID4gZGVmRGF0ZSkge1xuICAgICAgICAgIGRlZkRhdGUgPSBvcHRzLm1pbkRhdGVcbiAgICAgICAgfSBlbHNlIGlmIChvcHRzLm1heERhdGUgJiYgb3B0cy5tYXhEYXRlIDwgZGVmRGF0ZSkge1xuICAgICAgICAgIGRlZkRhdGUgPSBvcHRzLm1heERhdGVcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmdvdG9EYXRlKGRlZkRhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICAgIHNlbGYuZWwuY2xhc3NOYW1lICs9ICcgaXMtYm91bmQnXG4gICAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2NsaWNrJywgc2VsZi5fb25JbnB1dENsaWNrKVxuICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ3RvdWNoc3RhcnQnLCBzZWxmLl9vblRvdWNoKVxuICAgICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnYmx1cicsIHNlbGYuX29uSW5wdXRCbHVyKVxuICAgICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdrZXlkb3duJywgc2VsZi5fb25LZXlDaGFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNob3coKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXRFdmVudCgnaW5pdCcpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYXV0b0luaXQpIHtcbiAgICAgIHRoaXMuaW5pdCgpXG4gICAgfVxuICB9XG5cbiAgUGxhaW5QaWNrZXIuRXZFbWl0dGVyID0gRXZFbWl0dGVyXG5cbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBzZXRUb1N0YXJ0T2ZEYXkobm93KVxuXG4gIC8qKlxuICAgKiBwdWJsaWMgUGxhaW5QaWNrZXIgQVBJXG4gICAqL1xuXG4gIFBsYWluUGlja2VyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBjb25maWd1cmUgZnVuY3Rpb25hbGl0eVxuICAgICAqL1xuICAgIGNvbmZpZzogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgaWYgKCF0aGlzLl9vKSB7XG4gICAgICAgIHRoaXMuX28gPSBleHRlbmQoe30sIGRlZmF1bHRzLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRzID0gZXh0ZW5kKHRoaXMuX28sIG9wdGlvbnMsIHRydWUpXG5cbiAgICAgIG9wdHMuaXNSVEwgPSAhIW9wdHMuaXNSVExcblxuICAgICAgb3B0cy5maWVsZCA9IG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSA/IG9wdHMuZmllbGQgOiBudWxsXG5cbiAgICAgIG9wdHMudGhlbWUgPSB0eXBlb2Ygb3B0cy50aGVtZSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSBvcHRzLnRyaWdnZXIgJiYgb3B0cy50cmlnZ2VyLm5vZGVOYW1lID8gb3B0cy50cmlnZ2VyIDogb3B0cy5maWVsZFxuXG4gICAgICBvcHRzLmRpc2FibGVXZWVrZW5kcyA9ICEhb3B0cy5kaXNhYmxlV2Vla2VuZHNcblxuICAgICAgb3B0cy5kaXNhYmxlRGF5Rm4gPSB0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4gPT09ICdmdW5jdGlvbicgPyBvcHRzLmRpc2FibGVEYXlGbiA6IG51bGxcblxuICAgICAgb3B0cy5sYWJlbEZuID0gdHlwZW9mIG9wdHMubGFiZWxGbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wdHMubGFiZWxGbiA6IG51bGxcblxuICAgICAgY29uc3Qgbm9tID0gcGFyc2VJbnQob3B0cy5udW1iZXJPZk1vbnRocywgMTApIHx8IDFcbiAgICAgIG9wdHMubnVtYmVyT2ZNb250aHMgPSBub20gPiA0ID8gNCA6IG5vbVxuXG4gICAgICBvcHRzLm1pbkRhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLm1pbkRhdGUpXG4gICAgICBvcHRzLm1heERhdGUgPSBvcHRzLnBhcnNlRm4uY2FsbChzZWxmLCBvcHRzLm1heERhdGUpXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1pbkRhdGUpKSB7XG4gICAgICAgIG9wdHMubWluRGF0ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1heERhdGUpKSB7XG4gICAgICAgIG9wdHMubWF4RGF0ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAob3B0cy5taW5EYXRlICYmIG9wdHMubWF4RGF0ZSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBldmVudFRlc3QgPSAvXm9uKFtBLVpdXFx3KykkL1xuICAgICAgT2JqZWN0LmtleXMob3B0cykuZm9yRWFjaChcbiAgICAgICAgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goZXZlbnRUZXN0KVxuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIHRoaXMub24odHlwZSwgb3B0c1trZXldKVxuICAgICAgICAgICAgZGVsZXRlIG9wdHNba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApXG5cbiAgICAgIHJldHVybiBvcHRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28uZm9ybWF0Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX28uZm9ybWF0Rm4uY2FsbCh0aGlzLCB0aGlzLl9kKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHdpdGggZmFsbGJhY2sgZm9yIHRoZSBjdXJyZW50IGRhdGVcbiAgICAgKi9cbiAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBuZXcgRGF0ZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldFNlbGVjdGVkRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaXNEYXRlKHRoaXMuX2QpID8gbmV3IERhdGUodGhpcy5fZC5nZXRUaW1lKCkpIDogbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBEYXRlIG9iamVjdCBvZiB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBnZXRWaXNpYmxlRGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbihkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aGlzLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB7ZmlyZWRCeTogdGhpc30pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoZGF0ZSlcblxuICAgICAgY29uc3QgbWluID0gdGhpcy5fby5taW5EYXRlXG4gICAgICBjb25zdCBtYXggPSB0aGlzLl9vLm1heERhdGVcblxuICAgICAgaWYgKGlzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcbiAgICAgICAgZGF0ZSA9IG1pblxuICAgICAgfSBlbHNlIGlmIChpc0RhdGUobWF4KSAmJiBkYXRlID4gbWF4KSB7XG4gICAgICAgIGRhdGUgPSBtYXhcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZURhdGVzRXF1YWwodGhpcy5fZCwgZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSlcbiAgICAgIHNldFRvU3RhcnRPZkRheSh0aGlzLl9kKVxuICAgICAgdGhpcy5nb3RvRGF0ZSh0aGlzLl9kKVxuXG4gICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICB0aGlzLl9vLmZpZWxkLnZhbHVlID0gdGhpcy50b1N0cmluZygpXG4gICAgICAgIGZpcmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywge2ZpcmVkQnk6IHRoaXN9KVxuICAgICAgfVxuICAgICAgaWYgKCFwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3NlbGVjdCcsIFt0aGlzLmdldERhdGUoKV0pXG4gICAgICB9XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlJywgW3RoaXMuX2RdKVxuICAgIH0sXG5cbiAgICBzZWxlY3REYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB0aGlzLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICh0aGlzLl9kKSB7XG4gICAgICAgIHRoaXMuc3BlYWsodGhpcy5nZXREYXlDb25maWcodGhpcy5fZCkubGFiZWwpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldExhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBsYWJlbCA9ICcnXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuXG4gICAgICBpZiAob3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLmlkKSB7XG4gICAgICAgIGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIG9wdHMuZmllbGQuaWQgKyAnXCJdJylcbiAgICAgICAgbGFiZWwgPSBsYWJlbCA/IGxhYmVsLnRleHRDb250ZW50IHx8IGxhYmVsLmlubmVyVGV4dCA6ICcnXG4gICAgICB9XG5cbiAgICAgIGlmICghbGFiZWwgJiYgb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgIGxhYmVsID0gb3B0cy50cmlnZ2VyLnRleHRDb250ZW50IHx8IG9wdHMudHJpZ2dlci5pbm5lclRleHRcbiAgICAgIH1cblxuICAgICAgbGFiZWwgKz0gJyAoJyArIG9wdHMuaTE4bi5oZWxwICsgJyknXG5cbiAgICAgIHJldHVybiBsYWJlbFxuICAgIH0sXG5cbiAgICBzcGVhazogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgdGhpcy5zcGVhay5pbm5lckhUTUwgPSAnJ1xuICAgICAgdGhpcy5zcGVha0VsLmlubmVySFRNTCA9IGh0bWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXG4gICAgICovXG4gICAgZ290b0RhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIGxldCBuZXdDYWxlbmRhciA9IHRydWVcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG5cbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldE1vbnRoKGxhc3RWaXNpYmxlRGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpXG4gICAgICAgIG5ld0NhbGVuZGFyID0gdmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uKGRheXMpIHtcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuZ2V0RGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cylcbiAgICAgIGNvbnN0IG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkpXG4gICAgICBuZXdEYXkuc2V0RGF0ZShuZXdEYXkuZ2V0RGF0ZSgpICsgZGlmZmVyZW5jZSlcbiAgICAgIHRoaXMuc2VsZWN0RGF0ZShuZXdEYXkpXG4gICAgfSxcblxuICAgIGFkanVzdENhbGVuZGFyczogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSBhZGp1c3RDYWxlbmRhcih0aGlzLmNhbGVuZGFyc1swXSlcbiAgICAgIGZvciAoYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIG1vbnRoICh6ZXJvLWluZGV4LCBlLmcuIDA6IEphbnVhcnkpXG4gICAgICovXG4gICAgZ290b01vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS1cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBmdWxsIHllYXIgKGUuZy4gXCIyMDEyXCIpXG4gICAgICovXG4gICAgZ290b1llYXI6IGZ1bmN0aW9uKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgICAgY29uc3QgZCA9IHRoaXMuX28ucGFyc2VGbi5jYWxsKHNlbGYsIHZhbHVlKVxuXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkZWZhdWx0cy5taW5EYXRlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGRlZmF1bHRzLm1pblllYXJcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IGRlZmF1bHRzLm1pbk1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBjb25zdCBkID0gdGhpcy5fby5wYXJzZUZuLmNhbGwoc2VsZiwgdmFsdWUpXG4gICAgICBpZiAoaXNEYXRlKGQpKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheShkKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGQuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZC5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5zdGFydFJhbmdlLCB2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3N0YXJ0cmFuZ2UnLCBbdGhpcy5fby5zdGFydFJhbmdlXSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZURhdGVzRXF1YWwodGhpcy5fby5lbmRSYW5nZSwgdmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICB0aGlzLmVtaXRFdmVudCgnZW5kcmFuZ2UnLCBbdGhpcy5fby5lbmRSYW5nZV0pXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fby5zdGFydFJhbmdlXG4gICAgfSxcblxuICAgIGdldEVuZFJhbmdlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX28uZW5kUmFuZ2VcbiAgICB9LFxuXG4gICAgX3JlcXVlc3Q6IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgaWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlcXVlc3RlZCkge1xuICAgICAgICAgIHRoaXMucmVxdWVzdGVkID0ge1xuICAgICAgICAgICAgcmVxdWVzdDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYucmVxdWVzdGVkLmRyYXcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kcmF3KClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc2VsZi5yZXF1ZXN0ZWQuYWRqdXN0UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5mb2N1c1BpY2tlcigpXG4gICAgICAgICAgICAgIHNlbGYucmVxdWVzdGVkID0gbnVsbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXF1ZXN0ZWRbYWN0aW9uXSA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbJ18nICsgYWN0aW9uXSgpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlcXVlc3QgcmVmcmVzaGluZyBIVE1MXG4gICAgICogKHVzZXMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlmIGF2YWlsYWJsZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlKVxuICAgICAqL1xuICAgIGRyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5fZHJhdyhmb3JjZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QoJ2RyYXcnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgX2RyYXc6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IG1pblllYXIgPSBvcHRzLm1pblllYXJcbiAgICAgIGNvbnN0IG1heFllYXIgPSBvcHRzLm1heFllYXJcbiAgICAgIGNvbnN0IG1pbk1vbnRoID0gb3B0cy5taW5Nb250aFxuICAgICAgY29uc3QgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoXG4gICAgICBsZXQgaHRtbCA9ICcnXG4gICAgICBsZXQgcmFuZElkXG5cbiAgICAgIGlmICh0aGlzLl95IDw9IG1pblllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1pblllYXJcbiAgICAgICAgaWYgKCFpc05hTihtaW5Nb250aCkgJiYgdGhpcy5fbSA8IG1pbk1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1pbk1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl95ID49IG1heFllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1heFllYXJcbiAgICAgICAgaWYgKCFpc05hTihtYXhNb250aCkgJiYgdGhpcy5fbSA+IG1heE1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1heE1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmFuZElkID0gJ2RhdGVwaWNrZXJfX3RpdGxlLScgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKC9bXmEtel0rL2csICcnKS5zdWJzdHIoMCwgMilcblxuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldExhYmVsKClcblxuICAgICAgaWYgKHRoaXMuX28uZmllbGQgJiYgdGhpcy5fby50cmlnZ2VyID09PSB0aGlzLl9vLmZpZWxkICYmIG9wdHMuYm91bmQpIHtcbiAgICAgICAgdGhpcy5fby5maWVsZC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsYWJlbClcbiAgICAgIH1cblxuICAgICAgbGV0IGNcbiAgICAgIGZvciAoYyA9IDA7IGMgPCBvcHRzLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgaHRtbCArPVxuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGVuZGFyXCI+JyArXG4gICAgICAgICAgcmVuZGVyVGl0bGUodGhpcywgYywgdGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHRoaXMuY2FsZW5kYXJzWzBdLnllYXIsIHJhbmRJZCkgK1xuICAgICAgICAgIHRoaXMucmVuZGVyKHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCByYW5kSWQpICtcbiAgICAgICAgICAnPC9kaXY+J1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgbGV0IGF1dG9mb2N1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcigndGQuaXMtc2VsZWN0ZWQgPiAuZGF0ZXBpY2tlcl9fYnV0dG9uJylcbiAgICAgIGlmICghYXV0b2ZvY3VzKSB7XG4gICAgICAgIGF1dG9mb2N1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcigndGQuaXMtdG9kYXkgPiAuZGF0ZXBpY2tlcl9fYnV0dG9uJylcbiAgICAgIH1cbiAgICAgIGlmICghYXV0b2ZvY3VzKSB7XG4gICAgICAgIGF1dG9mb2N1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcigndGQ6bm90KC5pcy1kaXNhYmxlZCkgPiAuZGF0ZXBpY2tlcl9fYnV0dG9uJylcbiAgICAgIH1cbiAgICAgIGlmICghYXV0b2ZvY3VzKSB7XG4gICAgICAgIGF1dG9mb2N1cyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLmRhdGVwaWNrZXJfX2J1dHRvbicpXG4gICAgICB9XG4gICAgICBhdXRvZm9jdXMuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJylcblxuICAgICAgdGhpcy5lbWl0RXZlbnQoJ2RyYXcnKVxuICAgIH0sXG5cbiAgICBmb2N1c1BpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cblxuICAgICAgaWYgKCF0aGlzLmhhc0tleSAmJiAhdGhpcy5mb2N1c0luc2lkZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgc2VsZi5lbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fYnV0dG9uW3RhYmluZGV4PVwiMFwiXScpLmZvY3VzKClcblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgaWYgKG9wdHMuZmllbGQudHlwZSAhPT0gJ2hpZGRlbicpIHtcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZWwucXVlcnlTZWxlY3RvcignLmRhdGVwaWNrZXJfX2J1dHRvblt0YWJpbmRleD1cIjBcIl0nKS5mb2N1cygpXG4gICAgICAgICAgfSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZvY3VzSW5zaWRlID0gZmFsc2VcbiAgICB9LFxuXG4gICAgYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVxdWVzdCgnYWRqdXN0UG9zaXRpb24nKVxuICAgIH0sXG5cbiAgICBfYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGxlZnRcbiAgICAgIGxldCB0b3BcbiAgICAgIGxldCBjbGllbnRSZWN0XG5cbiAgICAgIGlmICh0aGlzLl9vLmNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5fby5wb3NpdGlvblRhcmdldCB8fCB0aGlzLl9vLnRyaWdnZXJcbiAgICAgIGxldCBwRWwgPSBmaWVsZFxuICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG5cbiAgICAgIGlmICh0eXBlb2YgZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNsaWVudFJlY3QgPSBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBsZWZ0ID0gY2xpZW50UmVjdC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0XG4gICAgICAgIHRvcCA9IGNsaWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZWZ0ID0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgdG9wID0gcEVsLm9mZnNldFRvcCArIHBFbC5vZmZzZXRIZWlnaHRcbiAgICAgICAgd2hpbGUgKChwRWwgPSBwRWwub2Zmc2V0UGFyZW50KSkge1xuICAgICAgICAgIGxlZnQgKz0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgICB0b3AgKz0gcEVsLm9mZnNldFRvcFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBoYWxpZ24gPSAwXG4gICAgICBpZiAodGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCdyaWdodCcpID4gLTEpIHtcbiAgICAgICAgaGFsaWduID0gMVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ2NlbnRlcicpID4gLTEpIHtcbiAgICAgICAgaGFsaWduID0gMC41XG4gICAgICB9XG5cbiAgICAgIGxlZnQgLT0gKHdpZHRoIC0gZmllbGQub2Zmc2V0V2lkdGgpICogaGFsaWduXG5cbiAgICAgIGlmICh0aGlzLl9vLnJlcG9zaXRpb24pIHtcbiAgICAgICAgY29uc3Qgb3ZlcmZsb3cgPSB7XG4gICAgICAgICAgcmlnaHQ6IE1hdGgubWF4KDAsIGxlZnQgKyB3aWR0aCAtICh2aWV3cG9ydFdpZHRoIC0gMjApKSxcbiAgICAgICAgICBsZWZ0OiBNYXRoLm1heCgwLCAyMCAtIGxlZnQpLFxuICAgICAgICAgIHRvcDogTWF0aC5tYXgoMCwgLXRvcClcbiAgICAgICAgfVxuICAgICAgICBsZWZ0ICs9IG92ZXJmbG93LmxlZnQgLSBvdmVyZmxvdy5yaWdodFxuICAgICAgICB0b3AgKz0gb3ZlcmZsb3cudG9wXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnXG4gICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICB9LFxuXG4gICAgZ2V0RGF5Q29uZmlnOiBmdW5jdGlvbihkYXkpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gaXNEYXRlKHRoaXMuX2QpID8gYXJlRGF0ZXNFcXVhbChkYXksIHRoaXMuX2QpIDogZmFsc2VcbiAgICAgIGNvbnN0IGlzVG9kYXkgPSBhcmVEYXRlc0VxdWFsKGRheSwgbm93KVxuICAgICAgY29uc3QgZGF5TnVtYmVyID0gZGF5LmdldERhdGUoKVxuICAgICAgY29uc3QgbW9udGhOdW1iZXIgPSBkYXkuZ2V0TW9udGgoKVxuICAgICAgY29uc3QgeWVhck51bWJlciA9IGRheS5nZXRGdWxsWWVhcigpXG4gICAgICBjb25zdCBpc1N0YXJ0UmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgYXJlRGF0ZXNFcXVhbChvcHRzLnN0YXJ0UmFuZ2UsIGRheSlcbiAgICAgIGNvbnN0IGlzRW5kUmFuZ2UgPSBvcHRzLmVuZFJhbmdlICYmIGFyZURhdGVzRXF1YWwob3B0cy5lbmRSYW5nZSwgZGF5KVxuICAgICAgY29uc3QgaXNJblJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIG9wdHMuZW5kUmFuZ2UgJiYgb3B0cy5zdGFydFJhbmdlIDwgZGF5ICYmIGRheSA8IG9wdHMuZW5kUmFuZ2VcbiAgICAgIGNvbnN0IGlzRGlzYWJsZWQgPVxuICAgICAgICAob3B0cy5taW5EYXRlICYmIGRheSA8IG9wdHMubWluRGF0ZSkgfHxcbiAgICAgICAgKG9wdHMubWF4RGF0ZSAmJiBkYXkgPiBvcHRzLm1heERhdGUpIHx8XG4gICAgICAgIChvcHRzLmRpc2FibGVXZWVrZW5kcyAmJiBpc1dlZWtlbmQoZGF5KSkgfHxcbiAgICAgICAgKG9wdHMuZGlzYWJsZURheUZuICYmIG9wdHMuZGlzYWJsZURheUZuLmNhbGwodGhpcywgZGF5KSlcblxuICAgICAgY29uc3QgZGF5Q29uZmlnID0ge1xuICAgICAgICBkYXRlOiBkYXksXG4gICAgICAgIGRheTogZGF5TnVtYmVyLFxuICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXG4gICAgICAgIHllYXI6IHllYXJOdW1iZXIsXG4gICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWQsXG4gICAgICAgIGlzVG9kYXk6IGlzVG9kYXksXG4gICAgICAgIGlzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgIGlzU3RhcnRSYW5nZTogaXNTdGFydFJhbmdlLFxuICAgICAgICBpc0VuZFJhbmdlOiBpc0VuZFJhbmdlLFxuICAgICAgICBpc0luUmFuZ2U6IGlzSW5SYW5nZSxcbiAgICAgICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5zaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzXG4gICAgICB9XG5cbiAgICAgIGRheUNvbmZpZy50ZXh0ID0gb3B0cy50ZXh0Rm4gPyBvcHRzLnRleHRGbi5jYWxsKHRoaXMsIGRheUNvbmZpZykgOiBkYXlOdW1iZXJcbiAgICAgIGRheUNvbmZpZy5sYWJlbCA9IG9wdHMubGFiZWxGbiA/IG9wdHMubGFiZWxGbi5jYWxsKHRoaXMsIGRheUNvbmZpZykgOiBkYXkudG9EYXRlU3RyaW5nKClcblxuICAgICAgcmV0dXJuIGRheUNvbmZpZ1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW5kZXIgSFRNTCBmb3IgYSBwYXJ0aWN1bGFyIG1vbnRoXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgcmFuZElkKSB7XG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3QgZGF5cyA9IGdldERheXNJbk1vbnRoKHllYXIsIG1vbnRoKVxuICAgICAgbGV0IGJlZm9yZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICAgICAgbGV0IGRhdGEgPSBbXVxuICAgICAgbGV0IHJvdyA9IFtdXG5cbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICAgIHNldFRvU3RhcnRPZkRheShub3cpXG4gICAgICBpZiAob3B0cy5maXJzdERheSA+IDApIHtcbiAgICAgICAgYmVmb3JlIC09IG9wdHMuZmlyc3REYXlcbiAgICAgICAgaWYgKGJlZm9yZSA8IDApIHtcbiAgICAgICAgICBiZWZvcmUgKz0gN1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBjZWxscyA9IGRheXMgKyBiZWZvcmVcbiAgICAgIGxldCBhZnRlciA9IGNlbGxzXG5cbiAgICAgIC8vIHZhciBzZWxlY3RlZEluTW9udGhcblxuICAgICAgd2hpbGUgKGFmdGVyID4gNykge1xuICAgICAgICBhZnRlciAtPSA3XG4gICAgICB9XG4gICAgICBjZWxscyArPSA3IC0gYWZ0ZXJcbiAgICAgIC8vIGlmICh0aGlzLl9kICYmIG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKSA8PSB0aGlzLl9kICYmIG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMSkgPiB0aGlzLl9kKSB7XG4gICAgICAvLyAgIHNlbGVjdGVkSW5Nb250aCA9IHRoaXMuX2RcbiAgICAgIC8vIH0gZWxzZSBpZiAobmV3IERhdGUoeWVhciwgbW9udGgsIDEpIDw9IG5vdyAmJiBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDEpID4gbm93KSB7XG4gICAgICAvLyAgIHNlbGVjdGVkSW5Nb250aCA9IG5vd1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRJbk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpXG4gICAgICAvLyB9XG5cbiAgICAgIGxldCBpLCByXG4gICAgICBmb3IgKGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEgKyAoaSAtIGJlZm9yZSkpXG4gICAgICAgIGNvbnN0IGRheUNvbmZpZyA9IHRoaXMuZ2V0RGF5Q29uZmlnKGRheSlcblxuICAgICAgICBkYXlDb25maWcuaXNFbXB0eSA9IGkgPCBiZWZvcmUgfHwgaSA+PSBkYXlzICsgYmVmb3JlXG4gICAgICAgIGRheUNvbmZpZy50YWJpbmRleCA9ICctMSdcblxuICAgICAgICByb3cucHVzaChyZW5kZXJEYXkoZGF5Q29uZmlnKSlcblxuICAgICAgICBpZiAoKytyID09PSA3KSB7XG4gICAgICAgICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgICAgICAgIHJvdy51bnNoaWZ0KHJlbmRlcldlZWsoaSAtIGJlZm9yZSwgbW9udGgsIHllYXIpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhLnB1c2gocmVuZGVyUm93KHJvdywgb3B0cy5pc1JUTCkpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICByID0gMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyVGFibGUob3B0cywgZGF0YSwgcmFuZElkKVxuICAgIH0sXG5cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghaXNEYXRlKHRoaXMuX2QpKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoaXNEYXRlKHRoaXMuX28ubWluRGF0ZSkgJiYgdGhpcy5fZCA8IHRoaXMuX28ubWluRGF0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChpc0RhdGUodGhpcy5fby5tYXhEYXRlKSAmJiB0aGlzLl9kID4gdGhpcy5fby5tYXhEYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuXG4gICAgaXNWaXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl92XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhpZGVUaW1lb3V0KVxuXG4gICAgICBpZiAodGhpcy5fZCkge1xuICAgICAgICB0aGlzLmdvdG9EYXRlKHRoaXMuX2QpXG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5zcGVha0VsKVxuICAgICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgICAgaWYgKG9wdHMuY29udGFpbmVyKSB7XG4gICAgICAgICAgb3B0cy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lbClcbiAgICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIHRoaXMuX3YgPSB0cnVlXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgYWRkRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uRG9jdW1lbnRDbGljaylcbiAgICAgICAgICB0aGlzLmFkanVzdFBvc2l0aW9uKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICAgIGFkZENsYXNzKHRoaXMuX28uZmllbGQsICdpcy12aXNpYmxlLWRhdGVwaWNrZXInKVxuICAgICAgICAgIHRoaXMucmVjZW50VmFsdWUgPSB0aGlzLl9vLmZpZWxkLnZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ29wZW4nKVxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCAmJiB0aGlzLl9vLmZpZWxkICE9PSB0aGlzLl9vLnRyaWdnZXIpIHtcbiAgICAgICAgICB0aGlzLnNwZWFrKHRoaXMuZ2V0TGFiZWwoKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjYW5jZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLl9vLmZpZWxkXG5cbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IHRoaXMucmVjZW50VmFsdWVcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGZpZWxkLnNlbGVjdCgpXG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgdGhpcy5oaWRlKHRydWUpXG4gICAgfSxcblxuICAgIGhpZGVBZnRlcjogZnVuY3Rpb24oZGVsYXksIGNhbmNlbGxlZCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGlkZVRpbWVvdXQpXG4gICAgICBpZiAodGhpcy5fdiAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5oaWRlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuaGlkZShjYW5jZWxsZWQpXG4gICAgICAgIH0sIGRlbGF5KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbihjYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLl92XG4gICAgICBpZiAodiAhPT0gZmFsc2UpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGlkZVRpbWVvdXQpXG4gICAgICAgIHRoaXMuaGFzS2V5ID0gZmFsc2VcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICByZW1vdmVFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25Eb2N1bWVudENsaWNrKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5fby5maWVsZCwgJ2lzLXZpc2libGUtZGF0ZXBpY2tlcicpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBpZiAodGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdiA9IGZhbHNlXG4gICAgICAgIHRoaXMuZW1pdEV2ZW50KCdjbG9zZScpXG4gICAgICAgIGlmICh0aGlzLnNwZWFrRWwucGFyZW50Tm9kZSkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5zcGVha0VsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oaWRlKClcblxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2ssIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAndG91Y2hlbmQnLCB0aGlzLl9vbkNsaWNrLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2tleWRvd24nLCB0aGlzLl9vbktleUNoYW5nZSlcbiAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB0aGlzLl9vbklucHV0Q2hhbmdlKVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2NsaWNrJywgdGhpcy5fb25JbnB1dENsaWNrKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnZm9jdXMnLCB0aGlzLl9vbklucHV0Rm9jdXMpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnYmx1cicsIHRoaXMuX29uSW5wdXRCbHVyKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2tleWRvd24nLCB0aGlzLl9vbktleUNoYW5nZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXRFdmVudCgnZGVzdHJveScpXG4gICAgICB0aGlzLm9mZigpXG4gICAgfVxuICB9XG5cbiAgZm9yIChsZXQgbmFtZSBpbiBFdkVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgUGxhaW5QaWNrZXIucHJvdG90eXBlW25hbWVdID0gRXZFbWl0dGVyLnByb3RvdHlwZVtuYW1lXVxuICB9XG5cbiAgd2luZG93LlBsYWluUGlja2VyID0gUGxhaW5QaWNrZXJcbn0pKClcbiJdLCJuYW1lcyI6WyJFdkVtaXR0ZXIiLCJwcm90byIsInByb3RvdHlwZSIsIm9uIiwiZXZlbnROYW1lIiwibGlzdGVuZXIiLCJldmVudHMiLCJfZXZlbnRzIiwibGlzdGVuZXJzIiwiaW5kZXhPZiIsInB1c2giLCJvbmNlIiwib25jZUV2ZW50cyIsIl9vbmNlRXZlbnRzIiwib25jZUxpc3RlbmVycyIsIm9mZiIsImxlbmd0aCIsImluZGV4Iiwic3BsaWNlIiwiZW1pdEV2ZW50IiwiYXJncyIsImkiLCJpc09uY2UiLCJhcHBseSIsImhhc0V2ZW50TGlzdGVuZXJzIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImRvY3VtZW50IiwiYWRkRXZlbnQiLCJlbCIsImUiLCJjYWxsYmFjayIsImNhcHR1cmUiLCJyZW1vdmVFdmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJmaXJlRXZlbnQiLCJkYXRhIiwiZXYiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImV4dGVuZCIsImRpc3BhdGNoRXZlbnQiLCJjcmVhdGVFdmVudE9iamVjdCIsInRyaW0iLCJzdHIiLCJyZXBsYWNlIiwiaGFzQ2xhc3MiLCJjbiIsImNsYXNzTmFtZSIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0FycmF5IiwidGVzdCIsIk9iamVjdCIsInRvU3RyaW5nIiwiY2FsbCIsIm9iaiIsImlzRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsImlzV2Vla2VuZCIsImRheSIsImRhdGUiLCJnZXREYXkiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImFyZURhdGVzRXF1YWwiLCJhIiwiYiIsInRvSVNPRGF0ZVN0cmluZyIsInkiLCJnZXRGdWxsWWVhciIsIm0iLCJTdHJpbmciLCJnZXRNb250aCIsImQiLCJnZXREYXRlIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJzbGljZSIsImFkanVzdENhbGVuZGFyIiwiY2FsZW5kYXIiLCJNYXRoIiwiY2VpbCIsImFicyIsImZsb29yIiwiY29udGFpbnNFbGVtZW50IiwiY29udGFpbmVyIiwiZWxlbWVudCIsInBhcmVudE5vZGUiLCJkZWZhdWx0cyIsInBhcnNlIiwidmFsdWUiLCJkYXRlU3RyIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwiX28iLCJpMThuIiwibGFuZ3VhZ2UiLCJkYXlTdHIiLCJ3ZWVrZGF5cyIsInRleHQiLCJpc1RvZGF5IiwidG9kYXkiLCJpc0Rpc2FibGVkIiwiZGlzYWJsZWQiLCJxdWVyeVNlbGVjdG9yIiwiZ2V0QXR0cmlidXRlIiwicmVuZGVyRGF5TmFtZSIsIm9wdHMiLCJhYmJyIiwiZmlyc3REYXkiLCJ3ZWVrZGF5c1Nob3J0IiwicmVuZGVyRGF5IiwiYXJyIiwiYXJpYVNlbGVjdGVkIiwiYXJpYUxhYmVsIiwibGFiZWwiLCJ0YWJpbmRleCIsImlzRW1wdHkiLCJzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzIiwiaXNTZWxlY3RlZCIsImlzSW5SYW5nZSIsImlzU3RhcnRSYW5nZSIsImlzRW5kUmFuZ2UiLCJqb2luIiwicmVuZGVyV2VlayIsIm9uZWphbiIsIndlZWtOdW0iLCJyZW5kZXJSb3ciLCJkYXlzIiwiaXNSVEwiLCJyZXZlcnNlIiwicmVuZGVyQm9keSIsInJvd3MiLCJyZW5kZXJIZWFkIiwic2hvd1dlZWtOdW1iZXIiLCJyZW5kZXJUaXRsZSIsImluc3RhbmNlIiwiYyIsInJlZlllYXIiLCJyYW5kSWQiLCJqIiwiaXNNaW5ZZWFyIiwibWluWWVhciIsImlzTWF4WWVhciIsIm1heFllYXIiLCJodG1sIiwibW9udGhIdG1sIiwieWVhckh0bWwiLCJwcmV2IiwibmV4dCIsIm1pbk1vbnRoIiwibWF4TW9udGgiLCJtb250aHMiLCJ5ZWFyUmFuZ2UiLCJ5ZWFyU3VmZml4Iiwic2hvd01vbnRoQWZ0ZXJZZWFyIiwicHJldmlvdXNNb250aCIsIm51bWJlck9mTW9udGhzIiwibmV4dE1vbnRoIiwicmVuZGVyVGFibGUiLCJQbGFpblBpY2tlciIsIm9wdGlvbnMiLCJzZWxmIiwiY29uZmlnIiwiX29uQ2xpY2siLCJfdiIsImV2ZW50IiwidGFyZ2V0Iiwic3JjRWxlbWVudCIsInN0b3BQcm9wYWdhdGlvbiIsImJvdW5kIiwiaGlkZUFmdGVyIiwic2V0RGF0ZSIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbkNoYW5nZSIsImdvdG9Nb250aCIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiY2FwdHVyZUtleSIsImhhc0tleSIsInN0b3BFdmVudCIsImlzVmlzaWJsZSIsImtleUNvZGUiLCJ0cmlnZ2VyIiwiZm9jdXMiLCJzZWxlY3QiLCJoaWRlIiwiY2FuY2VsIiwiYWRqdXN0RGF0ZSIsImFkanVzdE1vbnRoIiwiYWRqdXN0WWVhciIsIl9vbklucHV0Q2hhbmdlIiwiZmlyZWRCeSIsInBhcnNlRm4iLCJmaWVsZCIsIl9vblRvdWNoIiwidG91Y2hlZCIsIl9vbklucHV0Rm9jdXMiLCJibHVyIiwiZm9jdXNJbnNpZGUiLCJzaG93IiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfb25Eb2N1bWVudENsaWNrIiwib25jaGFuZ2UiLCJzZXRBdHRyaWJ1dGUiLCJpbml0IiwiY3JlYXRlRWxlbWVudCIsInRoZW1lIiwiZ2V0TGFiZWwiLCJzcGVha0VsIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsIm1pbkRhdGUiLCJtYXhEYXRlIiwiYXV0b0luaXQiLCJub3ciLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJsYWJlbEZuIiwibm9tIiwicGFyc2VJbnQiLCJzZXRNaW5EYXRlIiwic2V0TWF4RGF0ZSIsImZhbGxiYWNrIiwiZXZlbnRUZXN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJtYXRjaCIsInR5cGUiLCJ0b0xvd2VyQ2FzZSIsImJpbmQiLCJfZCIsImZvcm1hdEZuIiwidG9EYXRlU3RyaW5nIiwiY2FsZW5kYXJzIiwicHJldmVudE9uU2VsZWN0IiwiZHJhdyIsIm1pbiIsIm1heCIsInNwZWFrIiwiZ2V0RGF5Q29uZmlnIiwiaWQiLCJ0ZXh0Q29udGVudCIsImlubmVyVGV4dCIsImhlbHAiLCJpbm5lckhUTUwiLCJuZXdDYWxlbmRhciIsImZpcnN0VmlzaWJsZURhdGUiLCJsYXN0VmlzaWJsZURhdGUiLCJ2aXNpYmxlRGF0ZSIsInNldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwiZGlmZmVyZW5jZSIsIm5ld0RheSIsInZhbHVlT2YiLCJzZWxlY3REYXRlIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiYWN0aW9uIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicmVxdWVzdGVkIiwiX2RyYXciLCJhZGp1c3RQb3NpdGlvbiIsIl9hZGp1c3RQb3NpdGlvbiIsImZvY3VzUGlja2VyIiwiZm9yY2UiLCJfcmVxdWVzdCIsIl95IiwiX20iLCJyYW5kb20iLCJzdWJzdHIiLCJyZW5kZXIiLCJhdXRvZm9jdXMiLCJzZXRUaW1lb3V0IiwibGVmdCIsInRvcCIsImNsaWVudFJlY3QiLCJzdHlsZSIsInBvc2l0aW9uIiwicG9zaXRpb25UYXJnZXQiLCJ3aWR0aCIsIm9mZnNldFdpZHRoIiwidmlld3BvcnRXaWR0aCIsImlubmVyV2lkdGgiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhZ2VYT2Zmc2V0IiwiYm90dG9tIiwicGFnZVlPZmZzZXQiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0UGFyZW50IiwiaGFsaWduIiwicmVwb3NpdGlvbiIsIm92ZXJmbG93IiwicmlnaHQiLCJkYXlOdW1iZXIiLCJtb250aE51bWJlciIsInllYXJOdW1iZXIiLCJkYXlDb25maWciLCJ0ZXh0Rm4iLCJiZWZvcmUiLCJyb3ciLCJjZWxscyIsImFmdGVyIiwiciIsInVuc2hpZnQiLCJoaWRlVGltZW91dCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwicmVjZW50VmFsdWUiLCJkZWxheSIsImNhbmNlbGxlZCIsInYiLCJyZW1vdmVDaGlsZCIsIm5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxBQUFDLENBQUMsWUFBVzs7O01BRUxBLFlBQWEsWUFBVzthQUNuQkEsU0FBVCxHQUFxQjs7UUFFZkMsUUFBUUQsVUFBVUUsU0FBeEI7O1VBRU1DLEVBQU4sR0FBVyxVQUFTQyxTQUFULEVBQW9CQyxRQUFwQixFQUE4QjtVQUNuQyxDQUFDRCxTQUFELElBQWMsQ0FBQ0MsUUFBbkIsRUFBNkI7OztVQUd2QkMsU0FBVSxLQUFLQyxPQUFMLEdBQWUsS0FBS0EsT0FBTCxJQUFnQixFQUEvQztVQUNNQyxZQUFhRixPQUFPRixTQUFQLElBQW9CRSxPQUFPRixTQUFQLEtBQXFCLEVBQTVEO1VBQ0lJLFVBQVVDLE9BQVYsQ0FBa0JKLFFBQWxCLE1BQWdDLENBQUMsQ0FBckMsRUFBd0M7a0JBQzVCSyxJQUFWLENBQWVMLFFBQWY7OzthQUdLLElBQVA7S0FWRjs7VUFhTU0sSUFBTixHQUFhLFVBQVNQLFNBQVQsRUFBb0JDLFFBQXBCLEVBQThCO1VBQ3JDLENBQUNELFNBQUQsSUFBYyxDQUFDQyxRQUFuQixFQUE2Qjs7O1dBR3hCRixFQUFMLENBQVFDLFNBQVIsRUFBbUJDLFFBQW5CO1VBQ01PLGFBQWMsS0FBS0MsV0FBTCxHQUFtQixLQUFLQSxXQUFMLElBQW9CLEVBQTNEO1VBQ01DLGdCQUFpQkYsV0FBV1IsU0FBWCxJQUF3QlEsV0FBV1IsU0FBWCxLQUF5QixFQUF4RTtvQkFDY0MsUUFBZCxJQUEwQixJQUExQjs7YUFFTyxJQUFQO0tBVEY7O1VBWU1VLEdBQU4sR0FBWSxVQUFTWCxTQUFULEVBQW9CQyxRQUFwQixFQUE4QjtVQUNwQyxPQUFPRCxTQUFQLEtBQXFC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
