'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  /**
   * feature detection and helper functions
   */
  var document = window.document;
  var addEvent = function addEvent(el, e, callback, capture) {
    return el.addEventListener(e, callback, !!capture);
  };

  var removeEvent = function removeEvent(el, e, callback, capture) {
    return el.removeEventListener(e, callback, !!capture);
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

  var compareDates = function compareDates(a, b) {
    return a.getTime() === b.getTime();
  };

  var extend = function extend(to, from, overwrite) {
    var prop = void 0;
    var hasProp = void 0;

    for (prop in from) {
      hasProp = to[prop] !== undefined;
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

  /**
   * defaults and localisation
   */
  var defaults = {

    // bind the picker to a form field
    field: null,

    // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
    bound: undefined,

    // position of the datepicker, relative to the field (default to bottom & left)
    // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
    position: 'bottom left',

    // automatically fit in the viewport even if it means repositioning from the position option
    reposition: true,

    // the default output format for `.toString()` and `field` value
    format: 'YYYY-MM-DD',

    // the toString function which gets passed a current date object and format
    // and returns a string
    toString: null,

    // used to create date object from current input string
    parse: null,

    // the initial date to view when first opened
    defaultDate: null,

    // make the `defaultDate` the initial selected value
    setDefaultDate: false,

    // first day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // the default flag for moment's strict date parsing
    formatStrict: false,

    // the minimum/earliest date that can be selected
    minDate: null,
    // the maximum/latest date that can be selected
    maxDate: null,

    // number of years either side, or array of upper/lower range
    yearRange: 10,

    // show week numbers at head of row
    showWeekNumber: false,

    // Week picker mode
    pickWholeWeek: false,

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

    // Allows user to select days that fall in the next or previous month
    enableSelectionDaysInNextAndPreviousMonths: false,

    // how many months are visible
    numberOfMonths: 1,

    // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
    // only used for the first display or when a selected date is not visible
    mainCalendar: 'left',

    // Specify a DOM element to render the calendar in
    container: undefined,

    // Blur field when date is selected
    blurFieldOnSelect: true,

    // internationalization
    i18n: {
      previousMonth: 'Prev Month',
      nextMonth: 'Next Month',
      months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },

    // Theme Classname
    theme: null,

    // events array
    events: [],

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
    if (opts.isEmpty) {
      if (opts.showDaysInNextAndPreviousMonths) {
        arr.push('is-outside-current-month');

        if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
          arr.push('is-selection-disabled');
        }
      } else {
        return '<td class="is-empty"></td>';
      }
    }
    if (opts.isDisabled) arr.push('is-disabled');

    if (opts.isToday) arr.push('is-today');

    if (opts.isSelected) {
      arr.push('is-selected');
      ariaSelected = 'true';
    }
    if (opts.hasEvent) arr.push('has-event');

    if (opts.isInRange) arr.push('is-inrange');

    if (opts.isStartRange) arr.push('is-startrange');

    if (opts.isEndRange) arr.push('is-endrange');

    return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' + '<button class="datepicker__button datepicker__day" type="button" ' + 'data-datepicker-year="' + opts.year + '" data-datepicker-month="' + opts.month + '" data-datepicker-day="' + opts.day + '">' + opts.day + '</button>' + '</td>';
  };

  var renderWeek = function renderWeek(d, m, y) {
    var onejan = new Date(y, 0, 1);
    var weekNum = Math.ceil(((new Date(y, m, d) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return '<td class="datepicker__week">' + weekNum + '</td>';
  };

  var renderRow = function renderRow(days, isRTL, pickWholeWeek, isRowSelected) {
    return '<tr class="datepicker__row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
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
    return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
  };

  var renderTitle = function renderTitle(instance, c, year, month, refYear, randId) {
    var i = void 0;
    var j = void 0;
    var arr = void 0;
    var opts = instance._o;
    var isMinYear = year === opts.minYear;
    var isMaxYear = year === opts.maxYear;
    var html = '<div id="' + randId + '" class="datepicker__title" role="heading" aria-live="assertive">';

    var prev = true;
    var next = true;

    for (arr = [], i = 0; i < 12; i++) {
      arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
    }

    var monthHtml = '<div class="datepicker__label">' + opts.i18n.months[month] + '<select class="datepicker__select datepicker__select-month" tabindex="-1">' + arr.join('') + '</select></div>';

    if (isArray(opts.yearRange)) {
      i = opts.yearRange[0];
      j = opts.yearRange[1] + 1;
    } else {
      i = year - opts.yearRange;
      j = 1 + year + opts.yearRange;
    }

    for (arr = []; i < j && i <= opts.maxYear; i++) {
      if (i >= opts.minYear) arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + i + '</option>');
    }
    var yearHtml = '<div class="datepicker__label">' + year + opts.yearSuffix + '<select class="datepicker__select datepicker__select-year" tabindex="-1">' + arr.join('') + '</select></div>';

    if (opts.showMonthAfterYear) {
      html += yearHtml + monthHtml;
    } else {
      html += monthHtml + yearHtml;
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) prev = false;

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) next = false;

    if (c === 0) html += '<button class="datepicker__prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
    if (c === instance._o.numberOfMonths - 1) html += '<button class="datepicker__next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';

    html += '</div>';

    return html;
  };

  var renderTable = function renderTable(opts, data, randId) {
    return '<table cellpadding="0" cellspacing="0" class="datepicker__table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';
  };

  /**
   * PlainPicker constructor
   */
  var PlainPicker = function PlainPicker(options) {
    var self = this;
    var opts = self.config(options);

    self._onMouseDown = function (e) {
      if (!self._v) return;

      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) return;

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          if (opts.bound) {
            setTimeout(function () {
              self.setDate(new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day')));
              self.hide();
              if (opts.blurFieldOnSelect && opts.field) {
                opts.field.blur();
              }
            }, 100);
          }
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

    // <select>
    self._onChange = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) return;

      if (hasClass(target, 'datepicker__select-month')) {
        self.gotoMonth(target.value);
      } else if (hasClass(target, 'datepicker__select-year')) {
        self.gotoYear(target.value);
      }
    };

    self._onKeyChange = function (e) {
      e = e || window.event;

      if (self.isVisible()) {
        switch (e.keyCode) {
          case 13:
          case 27:
            if (opts.field) {
              opts.field.blur();
            }
            break;
          case 37:
            e.preventDefault();
            self.adjustDate('subtract', 1);
            break;
          case 38:
            self.adjustDate('subtract', 7);
            break;
          case 39:
            self.adjustDate('add', 1);
            break;
          case 40:
            self.adjustDate('add', 7);
            break;
        }
      }
    };

    self._onInputChange = function (e) {
      var date = void 0;

      if (e.firedBy === self) return;

      if (opts.parse) {
        date = opts.parse(opts.field.value, opts.format);
      } else {
        date = new Date(Date.parse(opts.field.value));
      }

      if (isDate(date)) self.setDate(date);
      if (!self._v) self.show();
    };

    self._onInputFocus = function () {
      self.show();
    };

    self._onInputClick = function () {
      self.show();
    };

    self._onInputBlur = function () {
      var pEl = document.activeElement;
      do {
        if (hasClass(pEl, 'datepicker')) {
          return;
        }
      } while (pEl = pEl.parentNode);

      if (!self._c) {
        self._b = setTimeout(function () {
          self.hide();
        }, 50);
      }
      self._c = false;
    };

    self._onClick = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      var pEl = target;

      if (!target) return;
      do {
        if (hasClass(pEl, 'datepicker') || pEl === opts.trigger) {
          return;
        }
      } while (pEl = pEl.parentNode);
      if (self._v && target !== opts.trigger && pEl !== opts.trigger) self.hide();
    };

    self.el = document.createElement('div');
    self.el.className = 'datepicker' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

    addEvent(self.el, 'mousedown', self._onMouseDown, true);
    addEvent(self.el, 'touchend', self._onMouseDown, true);
    addEvent(self.el, 'change', self._onChange);
    addEvent(document, 'keydown', self._onKeyChange);

    if (opts.field) {
      if (opts.container) {
        opts.container.appendChild(self.el);
      } else if (opts.bound) {
        document.body.appendChild(self.el);
      } else {
        opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
      }
      addEvent(opts.field, 'change', self._onInputChange);

      if (!opts.defaultDate) {
        opts.defaultDate = new Date(Date.parse(opts.field.value));
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
      self.gotoDate(new Date());
    }

    if (opts.bound) {
      this.hide();
      self.el.className += ' is-bound';
      addEvent(opts.trigger, 'click', self._onInputClick);
      addEvent(opts.trigger, 'focus', self._onInputFocus);
      addEvent(opts.trigger, 'blur', self._onInputBlur);
    } else {
      this.show();
    }
  };

  /**
   * public PlainPicker API
   */
  PlainPicker.prototype = {

    /**
     * configure functionality
     */
    config: function config(options) {
      if (!this._o) this._o = extend({}, defaults, true);

      var opts = extend(this._o, options, true);

      opts.isRTL = !!opts.isRTL;

      opts.field = opts.field && opts.field.nodeName ? opts.field : null;

      opts.theme = typeof opts.theme === 'string' && opts.theme ? opts.theme : null;

      opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

      opts.trigger = opts.trigger && opts.trigger.nodeName ? opts.trigger : opts.field;

      opts.disableWeekends = !!opts.disableWeekends;

      opts.disableDayFn = typeof opts.disableDayFn === 'function' ? opts.disableDayFn : null;

      var nom = parseInt(opts.numberOfMonths, 10) || 1;
      opts.numberOfMonths = nom > 4 ? 4 : nom;

      if (!isDate(opts.minDate)) opts.minDate = false;

      if (!isDate(opts.maxDate)) opts.maxDate = false;

      if (opts.minDate && opts.maxDate && opts.maxDate < opts.minDate) opts.maxDate = opts.minDate = false;

      if (opts.minDate) this.setMinDate(opts.minDate);

      if (opts.maxDate) this.setMaxDate(opts.maxDate);

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

      return opts;
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function toString(format) {
      format = format || this._o.format;
      if (!isDate(this._d)) return '';

      if (this._o.toString) return this._o.toString(this._d, format);

      return this._d.toDateString();
    },

    /**
     * return a Date object of the current selection
     */
    getDate: function getDate() {
      return isDate(this._d) ? new Date(this._d.getTime()) : null;
    },

    /**
     * set the current selection
     */
    setDate: function setDate(date, preventOnSelect) {
      var self = this;

      if (!date) {
        self._d = null;

        if (this._o.field) {
          self._o.field.value = '';
          fireEvent(self._o.field, 'change', {
            firedBy: self
          });
        }

        return self.draw();
      }
      if (typeof date === 'string') date = new Date(Date.parse(date));

      if (!isDate(date)) return;

      var min = self._o.minDate;
      var max = self._o.maxDate;

      if (isDate(min) && date < min) {
        date = min;
      } else if (isDate(max) && date > max) {
        date = max;
      }

      self._d = new Date(date.getTime());
      setToStartOfDay(self._d);
      self.gotoDate(self._d);

      if (self._o.field) {
        self._o.field.value = self.toString();
        fireEvent(self._o.field, 'change', {
          firedBy: self
        });
      }
      if (!preventOnSelect && typeof self._o.onSelect === 'function') self._o.onSelect.call(self, self.getDate());
    },

    /**
     * change view to a specific date
     */
    gotoDate: function gotoDate(date) {
      var newCalendar = true;

      if (!isDate(date)) return;

      if (this.calendars) {
        var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1);
        var lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1);
        var visibleDate = date.getTime
        // get the end of the month
        ();lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
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

    adjustDate: function adjustDate(sign, days) {
      var day = this.getDate() || new Date();
      var difference = parseInt(days) * 24 * 60 * 60 * 1000;

      var newDay = void 0;

      if (sign === 'add') {
        newDay = new Date(day.valueOf() + difference);
      } else if (sign === 'subtract') {
        newDay = new Date(day.valueOf() - difference);
      }

      this.setDate(newDay);
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
      if (value instanceof Date) {
        setToStartOfDay(value);
        this._o.minDate = value;
        this._o.minYear = value.getFullYear();
        this._o.minMonth = value.getMonth();
      } else {
        this._o.minDate = defaults.minDate;
        this._o.minYear = defaults.minYear;
        this._o.minMonth = defaults.minMonth;
        this._o.startRange = defaults.startRange;
      }

      this.draw();
    },

    /**
     * change the maxDate
     */
    setMaxDate: function setMaxDate(value) {
      if (value instanceof Date) {
        setToStartOfDay(value);
        this._o.maxDate = value;
        this._o.maxYear = value.getFullYear();
        this._o.maxMonth = value.getMonth();
      } else {
        this._o.maxDate = defaults.maxDate;
        this._o.maxYear = defaults.maxYear;
        this._o.maxMonth = defaults.maxMonth;
        this._o.endRange = defaults.endRange;
      }

      this.draw();
    },

    setStartRange: function setStartRange(value) {
      this._o.startRange = value;
    },

    setEndRange: function setEndRange(value) {
      this._o.endRange = value;
    },

    /**
     * refresh the HTML
     */
    draw: function draw(force) {
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

      var c = void 0;
      for (c = 0; c < opts.numberOfMonths; c++) {
        html += '<div class="datepicker__lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
      }

      this.el.innerHTML = html;

      if (opts.bound) {
        if (opts.field.type !== 'hidden') {
          setTimeout(function () {
            opts.trigger.focus();
          }, 1);
        }
      }

      if (typeof this._o.onDraw === 'function') {
        this._o.onDraw(this);
      }

      if (opts.bound) {
        // let the screen reader user know to use arrow keys
        opts.field.setAttribute('aria-label', 'Use the arrow keys to pick a date');
      }
    },

    adjustPosition: function adjustPosition() {
      if (this._o.container) return;

      this.el.style.position = 'absolute';

      var field = this._o.trigger;
      var pEl = field;
      var width = this.el.offsetWidth;
      var height = this.el.offsetHeight;
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
      var left = void 0;
      var top = void 0;

      if (typeof field.getBoundingClientRect === 'function') {
        var clientRect = field.getBoundingClientRect();
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

      // default position is bottom & left
      if (this._o.reposition && left + width > viewportWidth || this._o.position.indexOf('right') > -1 && left - width + field.offsetWidth > 0) {
        left = left - width + field.offsetWidth;
      }
      if (this._o.reposition && top + height > viewportHeight + scrollTop || this._o.position.indexOf('top') > -1 && top - height - field.offsetHeight > 0) {
        top = top - height - field.offsetHeight;
      }

      this.el.style.left = left + 'px';
      this.el.style.top = top + 'px';
    },

    /**
     * render HTML for a particular month
     */
    render: function render(year, month, randId) {
      var opts = this._o;
      var now = new Date();
      var days = getDaysInMonth(year, month);
      var before = new Date(year, month, 1).getDay();
      var data = [];
      var row = [];

      setToStartOfDay(now);

      if (opts.firstDay > 0) {
        before -= opts.firstDay;
        if (before < 0) {
          before += 7;
        }
      }

      var previousMonth = month === 0 ? 11 : month - 1;
      var nextMonth = month === 11 ? 0 : month + 1;
      var yearOfPreviousMonth = month === 0 ? year - 1 : year;
      var yearOfNextMonth = month === 11 ? year + 1 : year;
      var daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
      var cells = days + before;
      var after = cells;

      while (after > 7) {
        after -= 7;
      }

      cells += 7 - after;
      var isWeekSelected = false;
      var i = void 0,
          r = void 0;

      for (i = 0, r = 0; i < cells; i++) {
        var day = new Date(year, month, 1 + (i - before));
        var isSelected = isDate(this._d) ? compareDates(day, this._d) : false;
        var isToday = compareDates(day, now);
        var hasEvent = opts.events.indexOf(day.toDateString()) !== -1;
        var isEmpty = i < before || i >= days + before;
        var dayNumber = 1 + (i - before);
        var monthNumber = month;
        var yearNumber = year;
        var isStartRange = opts.startRange && compareDates(opts.startRange, day);
        var isEndRange = opts.endRange && compareDates(opts.endRange, day);
        var isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;
        var isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

        if (isEmpty) {
          if (i < before) {
            dayNumber = daysInPreviousMonth + dayNumber;
            monthNumber = previousMonth;
            yearNumber = yearOfPreviousMonth;
          } else {
            dayNumber = dayNumber - days;
            monthNumber = nextMonth;
            yearNumber = yearOfNextMonth;
          }
        }

        var dayConfig = {
          day: dayNumber,
          month: monthNumber,
          year: yearNumber,
          hasEvent: hasEvent,
          isSelected: isSelected,
          isToday: isToday,
          isDisabled: isDisabled,
          isEmpty: isEmpty,
          isStartRange: isStartRange,
          isEndRange: isEndRange,
          isInRange: isInRange,
          showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
          enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
        };

        if (opts.pickWholeWeek && isSelected) {
          isWeekSelected = true;
        }

        row.push(renderDay(dayConfig));

        if (++r === 7) {
          if (opts.showWeekNumber) {
            row.unshift(renderWeek(i - before, month, year));
          }
          data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
          row = [];
          r = 0;
          isWeekSelected = false;
        }
      }
      return renderTable(opts, data, randId);
    },

    isVisible: function isVisible() {
      return this._v;
    },

    show: function show() {
      if (!this.isVisible()) {
        this._v = true;
        this.draw();
        removeClass(this.el, 'is-hidden');
        if (this._o.bound) {
          addEvent(document, 'click', this._onClick);
          this.adjustPosition();
        }
        if (typeof this._o.onOpen === 'function') {
          this._o.onOpen.call(this);
        }
      }
    },

    hide: function hide() {
      var v = this._v;
      if (v !== false) {
        if (this._o.bound) {
          removeEvent(document, 'click', this._onClick);
        }
        this.el.style.position = 'static'; // reset
        this.el.style.left = 'auto';
        this.el.style.top = 'auto';
        addClass(this.el, 'is-hidden');
        this._v = false;
        if (v !== undefined && typeof this._o.onClose === 'function') {
          this._o.onClose.call(this);
        }
      }
    },

    destroy: function destroy() {
      this.hide();
      removeEvent(this.el, 'mousedown', this._onMouseDown, true);
      removeEvent(this.el, 'touchend', this._onMouseDown, true);
      removeEvent(this.el, 'change', this._onChange);
      if (this._o.field) {
        removeEvent(this._o.field, 'change', this._onInputChange);
        if (this._o.bound) {
          removeEvent(this._o.trigger, 'click', this._onInputClick);
          removeEvent(this._o.trigger, 'focus', this._onInputFocus);
          removeEvent(this._o.trigger, 'blur', this._onInputBlur);
        }
      }
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    }
  };
  window.PlainPicker = PlainPicker;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnRcbiAgY29uc3QgYWRkRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiBlbC5hZGRFdmVudExpc3RlbmVyKGUsIGNhbGxiYWNrLCAhIWNhcHR1cmUpXG5cbiAgY29uc3QgcmVtb3ZlRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGUsIGNhbGxiYWNrLCAhIWNhcHR1cmUpXG5cbiAgY29uc3QgdHJpbSA9IHN0ciA9PiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cbiAgY29uc3QgaGFzQ2xhc3MgPSAoZWwsIGNuKSA9PiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcblxuICBjb25zdCBhZGRDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBpZiAoIWhhc0NsYXNzKGVsLCBjbikpIGVsLmNsYXNzTmFtZSA9IChlbC5jbGFzc05hbWUgPT09ICcnKSA/IGNuIDogZWwuY2xhc3NOYW1lICsgJyAnICsgY25cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUNsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGVsLmNsYXNzTmFtZSA9IHRyaW0oKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbiArICcgJywgJyAnKSlcbiAgfVxuXG4gIGNvbnN0IGlzQXJyYXkgPSBvYmogPT4gKC9BcnJheS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpXG5cbiAgY29uc3QgaXNEYXRlID0gb2JqID0+ICgvRGF0ZS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuXG4gIGNvbnN0IGlzV2Vla2VuZCA9IGRhdGUgPT4ge1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgY29uc3QgaXNMZWFwWWVhciA9IHllYXIgPT4gKHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDApIHx8ICh5ZWFyICUgNDAwID09PSAwKVxuXG4gIGNvbnN0IGdldERheXNJbk1vbnRoID0gKHllYXIsIG1vbnRoKSA9PiBbMzEsIGlzTGVhcFllYXIoeWVhcikgPyAyOSA6IDI4LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV1bbW9udGhdXG5cbiAgY29uc3Qgc2V0VG9TdGFydE9mRGF5ID0gZGF0ZSA9PiB7XG4gICAgaWYgKGlzRGF0ZShkYXRlKSkgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICB9XG5cbiAgY29uc3QgY29tcGFyZURhdGVzID0gKGEsIGIpID0+IGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuXG4gIGNvbnN0IGV4dGVuZCA9ICh0bywgZnJvbSwgb3ZlcndyaXRlKSA9PiB7XG4gICAgbGV0IHByb3BcbiAgICBsZXQgaGFzUHJvcFxuXG4gICAgZm9yIChwcm9wIGluIGZyb20pIHtcbiAgICAgIGhhc1Byb3AgPSB0b1twcm9wXSAhPT0gdW5kZWZpbmVkXG4gICAgICBpZiAoaGFzUHJvcCAmJiB0eXBlb2YgZnJvbVtwcm9wXSA9PT0gJ29iamVjdCcgJiYgZnJvbVtwcm9wXSAhPT0gbnVsbCAmJiBmcm9tW3Byb3BdLm5vZGVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzRGF0ZShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gbmV3IERhdGUoZnJvbVtwcm9wXS5nZXRUaW1lKCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF0uc2xpY2UoMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9bcHJvcF0gPSBleHRlbmQoe30sIGZyb21bcHJvcF0sIG92ZXJ3cml0ZSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvdmVyd3JpdGUgfHwgIWhhc1Byb3ApIHtcbiAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgY29uc3QgZmlyZUV2ZW50ID0gKGVsLCBldmVudE5hbWUsIGRhdGEpID0+IHtcbiAgICBsZXQgZXZcblxuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpXG4gICAgICBldi5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSlcbiAgICAgIGV2ID0gZXh0ZW5kKGV2LCBkYXRhKVxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChldilcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KClcbiAgICAgIGV2ID0gZXh0ZW5kKGV2LCBkYXRhKVxuICAgICAgZWwuZmlyZUV2ZW50KCdvbicgKyBldmVudE5hbWUsIGV2KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFkanVzdENhbGVuZGFyID0gY2FsZW5kYXIgPT4ge1xuICAgIGlmIChjYWxlbmRhci5tb250aCA8IDApIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgLT0gTWF0aC5jZWlsKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggKz0gMTJcbiAgICB9XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoID4gMTEpIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgKz0gTWF0aC5mbG9vcihNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoIC09IDEyXG4gICAgfVxuICAgIHJldHVybiBjYWxlbmRhclxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmF1bHRzIGFuZCBsb2NhbGlzYXRpb25cbiAgICovXG4gIGNvbnN0IGRlZmF1bHRzID0ge1xuXG4gICAgLy8gYmluZCB0aGUgcGlja2VyIHRvIGEgZm9ybSBmaWVsZFxuICAgIGZpZWxkOiBudWxsLFxuXG4gICAgLy8gYXV0b21hdGljYWxseSBzaG93L2hpZGUgdGhlIHBpY2tlciBvbiBgZmllbGRgIGZvY3VzIChkZWZhdWx0IGB0cnVlYCBpZiBgZmllbGRgIGlzIHNldClcbiAgICBib3VuZDogdW5kZWZpbmVkLFxuXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIGRhdGVwaWNrZXIsIHJlbGF0aXZlIHRvIHRoZSBmaWVsZCAoZGVmYXVsdCB0byBib3R0b20gJiBsZWZ0KVxuICAgIC8vICgnYm90dG9tJyAmICdsZWZ0JyBrZXl3b3JkcyBhcmUgbm90IHVzZWQsICd0b3AnICYgJ3JpZ2h0JyBhcmUgbW9kaWZpZXIgb24gdGhlIGJvdHRvbS9sZWZ0IHBvc2l0aW9uKVxuICAgIHBvc2l0aW9uOiAnYm90dG9tIGxlZnQnLFxuXG4gICAgLy8gYXV0b21hdGljYWxseSBmaXQgaW4gdGhlIHZpZXdwb3J0IGV2ZW4gaWYgaXQgbWVhbnMgcmVwb3NpdGlvbmluZyBmcm9tIHRoZSBwb3NpdGlvbiBvcHRpb25cbiAgICByZXBvc2l0aW9uOiB0cnVlLFxuXG4gICAgLy8gdGhlIGRlZmF1bHQgb3V0cHV0IGZvcm1hdCBmb3IgYC50b1N0cmluZygpYCBhbmQgYGZpZWxkYCB2YWx1ZVxuICAgIGZvcm1hdDogJ1lZWVktTU0tREQnLFxuXG4gICAgLy8gdGhlIHRvU3RyaW5nIGZ1bmN0aW9uIHdoaWNoIGdldHMgcGFzc2VkIGEgY3VycmVudCBkYXRlIG9iamVjdCBhbmQgZm9ybWF0XG4gICAgLy8gYW5kIHJldHVybnMgYSBzdHJpbmdcbiAgICB0b1N0cmluZzogbnVsbCxcblxuICAgIC8vIHVzZWQgdG8gY3JlYXRlIGRhdGUgb2JqZWN0IGZyb20gY3VycmVudCBpbnB1dCBzdHJpbmdcbiAgICBwYXJzZTogbnVsbCxcblxuICAgIC8vIHRoZSBpbml0aWFsIGRhdGUgdG8gdmlldyB3aGVuIGZpcnN0IG9wZW5lZFxuICAgIGRlZmF1bHREYXRlOiBudWxsLFxuXG4gICAgLy8gbWFrZSB0aGUgYGRlZmF1bHREYXRlYCB0aGUgaW5pdGlhbCBzZWxlY3RlZCB2YWx1ZVxuICAgIHNldERlZmF1bHREYXRlOiBmYWxzZSxcblxuICAgIC8vIGZpcnN0IGRheSBvZiB3ZWVrICgwOiBTdW5kYXksIDE6IE1vbmRheSBldGMpXG4gICAgZmlyc3REYXk6IDAsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBmbGFnIGZvciBtb21lbnQncyBzdHJpY3QgZGF0ZSBwYXJzaW5nXG4gICAgZm9ybWF0U3RyaWN0OiBmYWxzZSxcblxuICAgIC8vIHRoZSBtaW5pbXVtL2VhcmxpZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtaW5EYXRlOiBudWxsLFxuICAgIC8vIHRoZSBtYXhpbXVtL2xhdGVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgbWF4RGF0ZTogbnVsbCxcblxuICAgIC8vIG51bWJlciBvZiB5ZWFycyBlaXRoZXIgc2lkZSwgb3IgYXJyYXkgb2YgdXBwZXIvbG93ZXIgcmFuZ2VcbiAgICB5ZWFyUmFuZ2U6IDEwLFxuXG4gICAgLy8gc2hvdyB3ZWVrIG51bWJlcnMgYXQgaGVhZCBvZiByb3dcbiAgICBzaG93V2Vla051bWJlcjogZmFsc2UsXG5cbiAgICAvLyBXZWVrIHBpY2tlciBtb2RlXG4gICAgcGlja1dob2xlV2VlazogZmFsc2UsXG5cbiAgICAvLyB1c2VkIGludGVybmFsbHkgKGRvbid0IGNvbmZpZyBvdXRzaWRlKVxuICAgIG1pblllYXI6IDAsXG4gICAgbWF4WWVhcjogOTk5OSxcbiAgICBtaW5Nb250aDogdW5kZWZpbmVkLFxuICAgIG1heE1vbnRoOiB1bmRlZmluZWQsXG5cbiAgICBzdGFydFJhbmdlOiBudWxsLFxuICAgIGVuZFJhbmdlOiBudWxsLFxuXG4gICAgaXNSVEw6IGZhbHNlLFxuXG4gICAgLy8gQWRkaXRpb25hbCB0ZXh0IHRvIGFwcGVuZCB0byB0aGUgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICB5ZWFyU3VmZml4OiAnJyxcblxuICAgIC8vIFJlbmRlciB0aGUgbW9udGggYWZ0ZXIgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICBzaG93TW9udGhBZnRlclllYXI6IGZhbHNlLFxuXG4gICAgLy8gUmVuZGVyIGRheXMgb2YgdGhlIGNhbGVuZGFyIGdyaWQgdGhhdCBmYWxsIGluIHRoZSBuZXh0IG9yIHByZXZpb3VzIG1vbnRoXG4gICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBBbGxvd3MgdXNlciB0byBzZWxlY3QgZGF5cyB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IGZhbHNlLFxuXG4gICAgLy8gaG93IG1hbnkgbW9udGhzIGFyZSB2aXNpYmxlXG4gICAgbnVtYmVyT2ZNb250aHM6IDEsXG5cbiAgICAvLyB3aGVuIG51bWJlck9mTW9udGhzIGlzIHVzZWQsIHRoaXMgd2lsbCBoZWxwIHlvdSB0byBjaG9vc2Ugd2hlcmUgdGhlIG1haW4gY2FsZW5kYXIgd2lsbCBiZSAoZGVmYXVsdCBgbGVmdGAsIGNhbiBiZSBzZXQgdG8gYHJpZ2h0YClcbiAgICAvLyBvbmx5IHVzZWQgZm9yIHRoZSBmaXJzdCBkaXNwbGF5IG9yIHdoZW4gYSBzZWxlY3RlZCBkYXRlIGlzIG5vdCB2aXNpYmxlXG4gICAgbWFpbkNhbGVuZGFyOiAnbGVmdCcsXG5cbiAgICAvLyBTcGVjaWZ5IGEgRE9NIGVsZW1lbnQgdG8gcmVuZGVyIHRoZSBjYWxlbmRhciBpblxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuXG4gICAgLy8gQmx1ciBmaWVsZCB3aGVuIGRhdGUgaXMgc2VsZWN0ZWRcbiAgICBibHVyRmllbGRPblNlbGVjdDogdHJ1ZSxcblxuICAgIC8vIGludGVybmF0aW9uYWxpemF0aW9uXG4gICAgaTE4bjoge1xuICAgICAgcHJldmlvdXNNb250aDogJ1ByZXYgTW9udGgnLFxuICAgICAgbmV4dE1vbnRoOiAnTmV4dCBNb250aCcsXG4gICAgICBtb250aHM6IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnMTAnLCAnMTEnLCAnMTInXSxcbiAgICAgIHdlZWtkYXlzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgICB3ZWVrZGF5c1Nob3J0OiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddXG4gICAgfSxcblxuICAgIC8vIFRoZW1lIENsYXNzbmFtZVxuICAgIHRoZW1lOiBudWxsLFxuXG4gICAgLy8gZXZlbnRzIGFycmF5XG4gICAgZXZlbnRzOiBbXSxcblxuICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgb25TZWxlY3Q6IG51bGwsXG4gICAgb25PcGVuOiBudWxsLFxuICAgIG9uQ2xvc2U6IG51bGwsXG4gICAgb25EcmF3OiBudWxsXG4gIH1cblxuICAvKipcbiAgICogdGVtcGxhdGluZyBmdW5jdGlvbnMgdG8gYWJzdHJhY3QgSFRNTCByZW5kZXJpbmdcbiAgICovXG4gIGNvbnN0IHJlbmRlckRheU5hbWUgPSAob3B0cywgZGF5LCBhYmJyKSA9PiB7XG4gICAgZGF5ICs9IG9wdHMuZmlyc3REYXlcbiAgICB3aGlsZSAoZGF5ID49IDcpIHtcbiAgICAgIGRheSAtPSA3XG4gICAgfVxuICAgIHJldHVybiBhYmJyID8gb3B0cy5pMThuLndlZWtkYXlzU2hvcnRbZGF5XSA6IG9wdHMuaTE4bi53ZWVrZGF5c1tkYXldXG4gIH1cblxuICBjb25zdCByZW5kZXJEYXkgPSBvcHRzID0+IHtcbiAgICBsZXQgYXJyID0gW11cbiAgICBsZXQgYXJpYVNlbGVjdGVkID0gJ2ZhbHNlJ1xuICAgIGlmIChvcHRzLmlzRW1wdHkpIHtcbiAgICAgIGlmIChvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMpIHtcbiAgICAgICAgYXJyLnB1c2goJ2lzLW91dHNpZGUtY3VycmVudC1tb250aCcpXG5cbiAgICAgICAgaWYgKCFvcHRzLmVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICAgIGFyci5wdXNoKCdpcy1zZWxlY3Rpb24tZGlzYWJsZWQnKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImlzLWVtcHR5XCI+PC90ZD4nXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRzLmlzRGlzYWJsZWQpIGFyci5wdXNoKCdpcy1kaXNhYmxlZCcpXG5cbiAgICBpZiAob3B0cy5pc1RvZGF5KSBhcnIucHVzaCgnaXMtdG9kYXknKVxuXG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG5cbiAgICBpZiAob3B0cy5pc0luUmFuZ2UpIGFyci5wdXNoKCdpcy1pbnJhbmdlJylcblxuICAgIGlmIChvcHRzLmlzU3RhcnRSYW5nZSkgYXJyLnB1c2goJ2lzLXN0YXJ0cmFuZ2UnKVxuXG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcblxuICAgIHJldHVybiAnPHRkIGRhdGEtZGF5PVwiJyArIG9wdHMuZGF5ICsgJ1wiIGNsYXNzPVwiJyArIGFyci5qb2luKCcgJykgKyAnXCIgYXJpYS1zZWxlY3RlZD1cIicgKyBhcmlhU2VsZWN0ZWQgKyAnXCI+JyArXG4gICAgICAgICAgICAgICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fYnV0dG9uIGRhdGVwaWNrZXJfX2RheVwiIHR5cGU9XCJidXR0b25cIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICsgb3B0cy55ZWFyICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgKyBvcHRzLm1vbnRoICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgb3B0cy5kYXkgK1xuICAgICAgICAgICAgICAnPC9idXR0b24+JyArXG4gICAgICAgICAgICc8L3RkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlcldlZWsgPSAoZCwgbSwgeSkgPT4ge1xuICAgIGNvbnN0IG9uZWphbiA9IG5ldyBEYXRlKHksIDAsIDEpXG4gICAgY29uc3Qgd2Vla051bSA9IE1hdGguY2VpbCgoKChuZXcgRGF0ZSh5LCBtLCBkKSAtIG9uZWphbikgLyA4NjQwMDAwMCkgKyBvbmVqYW4uZ2V0RGF5KCkgKyAxKSAvIDcpXG4gICAgcmV0dXJuICc8dGQgY2xhc3M9XCJkYXRlcGlja2VyX193ZWVrXCI+JyArIHdlZWtOdW0gKyAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJSb3cgPSAoZGF5cywgaXNSVEwsIHBpY2tXaG9sZVdlZWssIGlzUm93U2VsZWN0ZWQpID0+ICc8dHIgY2xhc3M9XCJkYXRlcGlja2VyX19yb3cnICsgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgKyAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICsgJ1wiPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+J1xuXG4gIGNvbnN0IHJlbmRlckJvZHkgPSByb3dzID0+ICc8dGJvZHk+JyArIHJvd3Muam9pbignJykgKyAnPC90Ym9keT4nXG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IG9wdHMgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGFyciA9IFtdXG4gICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgIGFyci5wdXNoKCc8dGg+PC90aD4nKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICBhcnIucHVzaCgnPHRoIHNjb3BlPVwiY29sXCI+PGFiYnIgdGl0bGU9XCInICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpKSArICdcIj4nICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpLCB0cnVlKSArICc8L2FiYnI+PC90aD4nKVxuICAgIH1cbiAgICByZXR1cm4gJzx0aGVhZD48dHI+JyArIChvcHRzLmlzUlRMID8gYXJyLnJldmVyc2UoKSA6IGFycikuam9pbignJykgKyAnPC90cj48L3RoZWFkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRpdGxlID0gKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRJZCArICdcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgcm9sZT1cImhlYWRpbmdcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj4nXG5cbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICsgJ1wiJyArXG4gICAgICAgICAgKGkgPT09IG1vbnRoID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICtcbiAgICAgICAgICAoKGlzTWluWWVhciAmJiBpIDwgb3B0cy5taW5Nb250aCkgfHwgKGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aCkgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSArICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArICc8L29wdGlvbj4nKVxuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoSHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gKyAnPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXJfX3NlbGVjdCBkYXRlcGlja2VyX19zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIChpKSArICc8L29wdGlvbj4nKVxuICAgIH1cbiAgICBjb25zdCB5ZWFySHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgeWVhciArIG9wdHMueWVhclN1ZmZpeCArICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC15ZWFyXCIgdGFiaW5kZXg9XCItMVwiPicgKyBhcnIuam9pbignJykgKyAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKG9wdHMuc2hvd01vbnRoQWZ0ZXJZZWFyKSB7XG4gICAgICBodG1sICs9IHllYXJIdG1sICsgbW9udGhIdG1sXG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgKz0gbW9udGhIdG1sICsgeWVhckh0bWxcbiAgICB9XG5cbiAgICBpZiAoaXNNaW5ZZWFyICYmIChtb250aCA9PT0gMCB8fCBvcHRzLm1pbk1vbnRoID49IG1vbnRoKSkgcHJldiA9IGZhbHNlXG5cbiAgICBpZiAoaXNNYXhZZWFyICYmIChtb250aCA9PT0gMTEgfHwgb3B0cy5tYXhNb250aCA8PSBtb250aCkpIG5leHQgPSBmYWxzZVxuXG4gICAgaWYgKGMgPT09IDApIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19wcmV2JyArIChwcmV2ID8gJycgOiAnIGlzLWRpc2FibGVkJykgKyAnXCIgdHlwZT1cImJ1dHRvblwiPicgKyBvcHRzLmkxOG4ucHJldmlvdXNNb250aCArICc8L2J1dHRvbj4nXG4gICAgaWYgKGMgPT09IChpbnN0YW5jZS5fby5udW1iZXJPZk1vbnRocyAtIDEpKSBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fbmV4dCcgKyAobmV4dCA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLm5leHRNb250aCArICc8L2J1dHRvbj4nXG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSAob3B0cywgZGF0YSwgcmFuZElkKSA9PiAnPHRhYmxlIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGFibGVcIiByb2xlPVwiZ3JpZFwiIGFyaWEtbGFiZWxsZWRieT1cIicgKyByYW5kSWQgKyAnXCI+JyArIHJlbmRlckhlYWQob3B0cykgKyByZW5kZXJCb2R5KGRhdGEpICsgJzwvdGFibGU+J1xuXG4gIC8qKlxuICAgKiBQbGFpblBpY2tlciBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3QgUGxhaW5QaWNrZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgY29uc3Qgb3B0cyA9IHNlbGYuY29uZmlnKG9wdGlvbnMpXG5cbiAgICBzZWxmLl9vbk1vdXNlRG93biA9IGUgPT4ge1xuICAgICAgaWYgKCFzZWxmLl92KSByZXR1cm5cblxuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSByZXR1cm5cblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBzZWxmLnNldERhdGUobmV3IERhdGUodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLW1vbnRoJyksIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKSkpXG4gICAgICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgICAgICAgIGlmIChvcHRzLmJsdXJGaWVsZE9uU2VsZWN0ICYmIG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3ByZXYnKSkge1xuICAgICAgICAgIHNlbGYucHJldk1vbnRoKClcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19uZXh0JykpIHtcbiAgICAgICAgICBzZWxmLm5leHRNb250aCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0JykpIHtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlLnJldHVyblZhbHVlID0gZmFsc2VcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5fYyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA8c2VsZWN0PlxuICAgIHNlbGYuX29uQ2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHJldHVyblxuXG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoJykpIHtcbiAgICAgICAgc2VsZi5nb3RvTW9udGgodGFyZ2V0LnZhbHVlKVxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QteWVhcicpKSB7XG4gICAgICAgIHNlbGYuZ290b1llYXIodGFyZ2V0LnZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uS2V5Q2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcblxuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ3N1YnRyYWN0JywgMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDaGFuZ2UgPSBlID0+IHtcbiAgICAgIGxldCBkYXRlXG5cbiAgICAgIGlmIChlLmZpcmVkQnkgPT09IHNlbGYpIHJldHVyblxuXG4gICAgICBpZiAob3B0cy5wYXJzZSkge1xuICAgICAgICBkYXRlID0gb3B0cy5wYXJzZShvcHRzLmZpZWxkLnZhbHVlLCBvcHRzLmZvcm1hdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKG9wdHMuZmllbGQudmFsdWUpKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSBzZWxmLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICghc2VsZi5fdikgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Rm9jdXMgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDbGljayA9ICgpID0+IHtcbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEJsdXIgPSAoKSA9PiB7XG4gICAgICBsZXQgcEVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuXG4gICAgICBpZiAoIXNlbGYuX2MpIHtcbiAgICAgICAgc2VsZi5fYiA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgIH0sIDUwKVxuICAgICAgfVxuICAgICAgc2VsZi5fYyA9IGZhbHNlXG4gICAgfVxuXG4gICAgc2VsZi5fb25DbGljayA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGxldCBwRWwgPSB0YXJnZXRcblxuICAgICAgaWYgKCF0YXJnZXQpIHJldHVyblxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHNlbGYuaGlkZSgpXG4gICAgfVxuXG4gICAgc2VsZi5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc2VsZi5lbC5jbGFzc05hbWUgPSAnZGF0ZXBpY2tlcicgKyAob3B0cy5pc1JUTCA/ICcgaXMtcnRsJyA6ICcnKSArIChvcHRzLnRoZW1lID8gJyAnICsgb3B0cy50aGVtZSA6ICcnKVxuXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ21vdXNlZG93bicsIHNlbGYuX29uTW91c2VEb3duLCB0cnVlKVxuICAgIGFkZEV2ZW50KHNlbGYuZWwsICd0b3VjaGVuZCcsIHNlbGYuX29uTW91c2VEb3duLCB0cnVlKVxuICAgIGFkZEV2ZW50KHNlbGYuZWwsICdjaGFuZ2UnLCBzZWxmLl9vbkNoYW5nZSlcbiAgICBhZGRFdmVudChkb2N1bWVudCwgJ2tleWRvd24nLCBzZWxmLl9vbktleUNoYW5nZSlcblxuICAgIGlmIChvcHRzLmZpZWxkKSB7XG4gICAgICBpZiAob3B0cy5jb250YWluZXIpIHtcbiAgICAgICAgb3B0cy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNlbGYuZWwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRzLmZpZWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNlbGYuZWwsIG9wdHMuZmllbGQubmV4dFNpYmxpbmcpXG4gICAgICB9XG4gICAgICBhZGRFdmVudChvcHRzLmZpZWxkLCAnY2hhbmdlJywgc2VsZi5fb25JbnB1dENoYW5nZSlcblxuICAgICAgaWYgKCFvcHRzLmRlZmF1bHREYXRlKSB7XG4gICAgICAgIG9wdHMuZGVmYXVsdERhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKG9wdHMuZmllbGQudmFsdWUpKVxuICAgICAgICBvcHRzLnNldERlZmF1bHREYXRlID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRlZkRhdGUgPSBvcHRzLmRlZmF1bHREYXRlXG5cbiAgICBpZiAoaXNEYXRlKGRlZkRhdGUpKSB7XG4gICAgICBpZiAob3B0cy5zZXREZWZhdWx0RGF0ZSkge1xuICAgICAgICBzZWxmLnNldERhdGUoZGVmRGF0ZSwgdHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuZ290b0RhdGUoZGVmRGF0ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgICAgc2VsZi5lbC5jbGFzc05hbWUgKz0gJyBpcy1ib3VuZCdcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2NsaWNrJywgc2VsZi5fb25JbnB1dENsaWNrKVxuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnZm9jdXMnLCBzZWxmLl9vbklucHV0Rm9jdXMpXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdibHVyJywgc2VsZi5fb25JbnB1dEJsdXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvdygpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHB1YmxpYyBQbGFpblBpY2tlciBBUElcbiAgICovXG4gIFBsYWluUGlja2VyLnByb3RvdHlwZSA9IHtcblxuICAgIC8qKlxuICAgICAqIGNvbmZpZ3VyZSBmdW5jdGlvbmFsaXR5XG4gICAgICovXG4gICAgY29uZmlnOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKCF0aGlzLl9vKSB0aGlzLl9vID0gZXh0ZW5kKHt9LCBkZWZhdWx0cywgdHJ1ZSlcblxuICAgICAgY29uc3Qgb3B0cyA9IGV4dGVuZCh0aGlzLl9vLCBvcHRpb25zLCB0cnVlKVxuXG4gICAgICBvcHRzLmlzUlRMID0gISFvcHRzLmlzUlRMXG5cbiAgICAgIG9wdHMuZmllbGQgPSAob3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLm5vZGVOYW1lKSA/IG9wdHMuZmllbGQgOiBudWxsXG5cbiAgICAgIG9wdHMudGhlbWUgPSAodHlwZW9mIG9wdHMudGhlbWUpID09PSAnc3RyaW5nJyAmJiBvcHRzLnRoZW1lID8gb3B0cy50aGVtZSA6IG51bGxcblxuICAgICAgb3B0cy5ib3VuZCA9ICEhKG9wdHMuYm91bmQgIT09IHVuZGVmaW5lZCA/IG9wdHMuZmllbGQgJiYgb3B0cy5ib3VuZCA6IG9wdHMuZmllbGQpXG5cbiAgICAgIG9wdHMudHJpZ2dlciA9IChvcHRzLnRyaWdnZXIgJiYgb3B0cy50cmlnZ2VyLm5vZGVOYW1lKSA/IG9wdHMudHJpZ2dlciA6IG9wdHMuZmllbGRcblxuICAgICAgb3B0cy5kaXNhYmxlV2Vla2VuZHMgPSAhIW9wdHMuZGlzYWJsZVdlZWtlbmRzXG5cbiAgICAgIG9wdHMuZGlzYWJsZURheUZuID0gKHR5cGVvZiBvcHRzLmRpc2FibGVEYXlGbikgPT09ICdmdW5jdGlvbicgPyBvcHRzLmRpc2FibGVEYXlGbiA6IG51bGxcblxuICAgICAgY29uc3Qgbm9tID0gcGFyc2VJbnQob3B0cy5udW1iZXJPZk1vbnRocywgMTApIHx8IDFcbiAgICAgIG9wdHMubnVtYmVyT2ZNb250aHMgPSBub20gPiA0ID8gNCA6IG5vbVxuXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1pbkRhdGUpKSBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1heERhdGUpKSBvcHRzLm1heERhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAoKG9wdHMubWluRGF0ZSAmJiBvcHRzLm1heERhdGUpICYmIG9wdHMubWF4RGF0ZSA8IG9wdHMubWluRGF0ZSkgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcblxuICAgICAgaWYgKG9wdHMubWluRGF0ZSkgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcblxuICAgICAgaWYgKG9wdHMubWF4RGF0ZSkgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0c1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBmb3JtYXR0ZWQgc3RyaW5nIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbiAodXNpbmcgTW9tZW50LmpzIGlmIGF2YWlsYWJsZSlcbiAgICAgKi9cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMuX28uZm9ybWF0XG4gICAgICBpZiAoIWlzRGF0ZSh0aGlzLl9kKSkgcmV0dXJuICcnXG5cbiAgICAgIGlmICh0aGlzLl9vLnRvU3RyaW5nKSByZXR1cm4gdGhpcy5fby50b1N0cmluZyh0aGlzLl9kLCBmb3JtYXQpXG5cbiAgICAgIHJldHVybiB0aGlzLl9kLnRvRGF0ZVN0cmluZygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbiAoZGF0ZSwgcHJldmVudE9uU2VsZWN0KSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgc2VsZi5fZCA9IG51bGxcblxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSAnJ1xuICAgICAgICAgIGZpcmVFdmVudChzZWxmLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgICAgZmlyZWRCeTogc2VsZlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZi5kcmF3KClcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZGF0ZSA9PT0gJ3N0cmluZycpIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKGRhdGUpKVxuXG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IG1pbiA9IHNlbGYuX28ubWluRGF0ZVxuICAgICAgY29uc3QgbWF4ID0gc2VsZi5fby5tYXhEYXRlXG5cbiAgICAgIGlmIChpc0RhdGUobWluKSAmJiBkYXRlIDwgbWluKSB7XG4gICAgICAgIGRhdGUgPSBtaW5cbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKG1heCkgJiYgZGF0ZSA+IG1heCkge1xuICAgICAgICBkYXRlID0gbWF4XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX2QgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSlcbiAgICAgIHNldFRvU3RhcnRPZkRheShzZWxmLl9kKVxuICAgICAgc2VsZi5nb3RvRGF0ZShzZWxmLl9kKVxuXG4gICAgICBpZiAoc2VsZi5fby5maWVsZCkge1xuICAgICAgICBzZWxmLl9vLmZpZWxkLnZhbHVlID0gc2VsZi50b1N0cmluZygpXG4gICAgICAgIGZpcmVFdmVudChzZWxmLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgIGZpcmVkQnk6IHNlbGZcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmICghcHJldmVudE9uU2VsZWN0ICYmIHR5cGVvZiBzZWxmLl9vLm9uU2VsZWN0ID09PSAnZnVuY3Rpb24nKSBzZWxmLl9vLm9uU2VsZWN0LmNhbGwoc2VsZiwgc2VsZi5nZXREYXRlKCkpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZGF0ZVxuICAgICAqL1xuICAgIGdvdG9EYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgbGV0IG5ld0NhbGVuZGFyID0gdHJ1ZVxuXG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG4gICAgICAgIC8vIGdldCB0aGUgZW5kIG9mIHRoZSBtb250aFxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0TW9udGgobGFzdFZpc2libGVEYXRlLmdldE1vbnRoKCkgKyAxKVxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0RGF0ZShsYXN0VmlzaWJsZURhdGUuZ2V0RGF0ZSgpIC0gMSlcbiAgICAgICAgbmV3Q2FsZW5kYXIgPSAodmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdDYWxlbmRhcikge1xuICAgICAgICB0aGlzLmNhbGVuZGFycyA9IFt7XG4gICAgICAgICAgbW9udGg6IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgfV1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uIChzaWduLCBkYXlzKSB7XG4gICAgICBjb25zdCBkYXkgPSB0aGlzLmdldERhdGUoKSB8fCBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cykgKiAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAgIGxldCBuZXdEYXlcblxuICAgICAgaWYgKHNpZ24gPT09ICdhZGQnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgKyBkaWZmZXJlbmNlKVxuICAgICAgfSBlbHNlIGlmIChzaWduID09PSAnc3VidHJhY3QnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgLSBkaWZmZXJlbmNlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldERhdGUobmV3RGF5KVxuICAgIH0sXG5cbiAgICBhZGp1c3RDYWxlbmRhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBjXG5cbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdID0gYWRqdXN0Q2FsZW5kYXIodGhpcy5jYWxlbmRhcnNbMF0pXG4gICAgICBmb3IgKGMgPSAxOyBjIDwgdGhpcy5fby5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzW2NdID0gYWRqdXN0Q2FsZW5kYXIoe1xuICAgICAgICAgIG1vbnRoOiB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArIGMsXG4gICAgICAgICAgeWVhcjogdGhpcy5jYWxlbmRhcnNbMF0ueWVhclxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgZ290b1RvZGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgbW9udGggKHplcm8taW5kZXgsIGUuZy4gMDogSmFudWFyeSlcbiAgICAgKi9cbiAgICBnb3RvTW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCsrXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIHByZXZNb250aDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgtLVxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGZ1bGwgeWVhciAoZS5nLiBcIjIwMTJcIilcbiAgICAgKi9cbiAgICBnb3RvWWVhcjogZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IGRlZmF1bHRzLm1pbkRhdGVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gZGVmYXVsdHMubWluWWVhclxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZGVmYXVsdHMubWluTW9udGhcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gZGVmYXVsdHMuc3RhcnRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdGhlIG1heERhdGVcbiAgICAgKi9cbiAgICBzZXRNYXhEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgc2V0VG9TdGFydE9mRGF5KHZhbHVlKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSB2YWx1ZVxuICAgICAgICB0aGlzLl9vLm1heFllYXIgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuX28ubWF4TW9udGggPSB2YWx1ZS5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSBkZWZhdWx0cy5lbmRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBzZXRTdGFydFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uc3RhcnRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIHNldEVuZFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24gKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3QgbWluWWVhciA9IG9wdHMubWluWWVhclxuICAgICAgY29uc3QgbWF4WWVhciA9IG9wdHMubWF4WWVhclxuICAgICAgY29uc3QgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICBjb25zdCBtYXhNb250aCA9IG9wdHMubWF4TW9udGhcbiAgICAgIGxldCBodG1sID0gJydcbiAgICAgIGxldCByYW5kSWRcblxuICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWluWWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3kgPj0gbWF4WWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWF4WWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlcl9fdGl0bGUtJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgJycpLnN1YnN0cigwLCAyKVxuXG4gICAgICBsZXQgY1xuICAgICAgZm9yIChjID0gMDsgYyA8IG9wdHMubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGVuZGFyXCI+JyArIHJlbmRlclRpdGxlKHRoaXMsIGMsIHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCB0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCByYW5kSWQpICsgdGhpcy5yZW5kZXIodGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHJhbmRJZCkgKyAnPC9kaXY+J1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgaWYgKG9wdHMuZmllbGQudHlwZSAhPT0gJ2hpZGRlbicpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIG9wdHMudHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgfSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25EcmF3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX28ub25EcmF3KHRoaXMpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIC8vIGxldCB0aGUgc2NyZWVuIHJlYWRlciB1c2VyIGtub3cgdG8gdXNlIGFycm93IGtleXNcbiAgICAgICAgb3B0cy5maWVsZC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnVXNlIHRoZSBhcnJvdyBrZXlzIHRvIHBpY2sgYSBkYXRlJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9vLmNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5fby50cmlnZ2VyXG4gICAgICBsZXQgcEVsID0gZmllbGRcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5lbC5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5lbC5vZmZzZXRIZWlnaHRcbiAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICBsZXQgbGVmdFxuICAgICAgbGV0IHRvcFxuXG4gICAgICBpZiAodHlwZW9mIGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBjbGllbnRSZWN0ID0gZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgbGVmdCA9IGNsaWVudFJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldFxuICAgICAgICB0b3AgPSBjbGllbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVmdCA9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgIHRvcCA9IHBFbC5vZmZzZXRUb3AgKyBwRWwub2Zmc2V0SGVpZ2h0XG4gICAgICAgIHdoaWxlICgocEVsID0gcEVsLm9mZnNldFBhcmVudCkpIHtcbiAgICAgICAgICBsZWZ0ICs9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgICAgdG9wICs9IHBFbC5vZmZzZXRUb3BcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbSAmIGxlZnRcbiAgICAgIGlmICgodGhpcy5fby5yZXBvc2l0aW9uICYmIGxlZnQgKyB3aWR0aCA+IHZpZXdwb3J0V2lkdGgpIHx8IChcbiAgICAgICAgICB0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSAmJlxuICAgICAgICAgIGxlZnQgLSB3aWR0aCArIGZpZWxkLm9mZnNldFdpZHRoID4gMFxuICAgICAgICApKSB7XG4gICAgICAgIGxlZnQgPSBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aFxuICAgICAgfVxuICAgICAgaWYgKCh0aGlzLl9vLnJlcG9zaXRpb24gJiYgdG9wICsgaGVpZ2h0ID4gdmlld3BvcnRIZWlnaHQgKyBzY3JvbGxUb3ApIHx8IChcbiAgICAgICAgICB0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEgJiZcbiAgICAgICAgICB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHQgPiAwXG4gICAgICAgICkpIHtcbiAgICAgICAgdG9wID0gdG9wIC0gaGVpZ2h0IC0gZmllbGQub2Zmc2V0SGVpZ2h0XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnXG4gICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVuZGVyIEhUTUwgZm9yIGEgcGFydGljdWxhciBtb250aFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkYXlzID0gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpXG4gICAgICBsZXQgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gICAgICBsZXQgZGF0YSA9IFtdXG4gICAgICBsZXQgcm93ID0gW11cblxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcblxuICAgICAgaWYgKG9wdHMuZmlyc3REYXkgPiAwKSB7XG4gICAgICAgIGJlZm9yZSAtPSBvcHRzLmZpcnN0RGF5XG4gICAgICAgIGlmIChiZWZvcmUgPCAwKSB7XG4gICAgICAgICAgYmVmb3JlICs9IDdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyAxMSA6IG1vbnRoIC0gMVxuICAgICAgY29uc3QgbmV4dE1vbnRoID0gbW9udGggPT09IDExID8gMCA6IG1vbnRoICsgMVxuICAgICAgY29uc3QgeWVhck9mUHJldmlvdXNNb250aCA9IG1vbnRoID09PSAwID8geWVhciAtIDEgOiB5ZWFyXG4gICAgICBjb25zdCB5ZWFyT2ZOZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXJcbiAgICAgIGNvbnN0IGRheXNJblByZXZpb3VzTW9udGggPSBnZXREYXlzSW5Nb250aCh5ZWFyT2ZQcmV2aW91c01vbnRoLCBwcmV2aW91c01vbnRoKVxuICAgICAgbGV0IGNlbGxzID0gZGF5cyArIGJlZm9yZVxuICAgICAgbGV0IGFmdGVyID0gY2VsbHNcblxuICAgICAgd2hpbGUgKGFmdGVyID4gNykge1xuICAgICAgICBhZnRlciAtPSA3XG4gICAgICB9XG5cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgbGV0IGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgIGxldCBpLCByXG5cbiAgICAgIGZvciAoaSA9IDAsIHIgPSAwOyBpIDwgY2VsbHM7IGkrKykge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSlcbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGlzRGF0ZSh0aGlzLl9kKSA/IGNvbXBhcmVEYXRlcyhkYXksIHRoaXMuX2QpIDogZmFsc2VcbiAgICAgICAgY29uc3QgaXNUb2RheSA9IGNvbXBhcmVEYXRlcyhkYXksIG5vdylcbiAgICAgICAgY29uc3QgaGFzRXZlbnQgPSBvcHRzLmV2ZW50cy5pbmRleE9mKGRheS50b0RhdGVTdHJpbmcoKSkgIT09IC0xXG4gICAgICAgIGNvbnN0IGlzRW1wdHkgPSBpIDwgYmVmb3JlIHx8IGkgPj0gKGRheXMgKyBiZWZvcmUpXG4gICAgICAgIGxldCBkYXlOdW1iZXIgPSAxICsgKGkgLSBiZWZvcmUpXG4gICAgICAgIGxldCBtb250aE51bWJlciA9IG1vbnRoXG4gICAgICAgIGxldCB5ZWFyTnVtYmVyID0geWVhclxuICAgICAgICBjb25zdCBpc1N0YXJ0UmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgY29tcGFyZURhdGVzKG9wdHMuc3RhcnRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0VuZFJhbmdlID0gb3B0cy5lbmRSYW5nZSAmJiBjb21wYXJlRGF0ZXMob3B0cy5lbmRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgICBjb25zdCBpc0Rpc2FibGVkID0gKG9wdHMubWluRGF0ZSAmJiBkYXkgPCBvcHRzLm1pbkRhdGUpIHx8XG4gICAgICAgICAgKG9wdHMubWF4RGF0ZSAmJiBkYXkgPiBvcHRzLm1heERhdGUpIHx8XG4gICAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIGlzV2Vla2VuZChkYXkpKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVEYXlGbiAmJiBvcHRzLmRpc2FibGVEYXlGbihkYXkpKVxuXG4gICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgaWYgKGkgPCBiZWZvcmUpIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheXNJblByZXZpb3VzTW9udGggKyBkYXlOdW1iZXJcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gcHJldmlvdXNNb250aFxuICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZlByZXZpb3VzTW9udGhcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5TnVtYmVyIC0gZGF5c1xuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBuZXh0TW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZOZXh0TW9udGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXlDb25maWcgPSB7XG4gICAgICAgICAgZGF5OiBkYXlOdW1iZXIsXG4gICAgICAgICAgbW9udGg6IG1vbnRoTnVtYmVyLFxuICAgICAgICAgIHllYXI6IHllYXJOdW1iZXIsXG4gICAgICAgICAgaGFzRXZlbnQ6IGhhc0V2ZW50LFxuICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWQsXG4gICAgICAgICAgaXNUb2RheTogaXNUb2RheSxcbiAgICAgICAgICBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLFxuICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXG4gICAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXG4gICAgICAgICAgaXNFbmRSYW5nZTogaXNFbmRSYW5nZSxcbiAgICAgICAgICBpc0luUmFuZ2U6IGlzSW5SYW5nZSxcbiAgICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMsXG4gICAgICAgICAgZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLmVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdHMucGlja1dob2xlV2VlayAmJiBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICByb3cucHVzaChyZW5kZXJEYXkoZGF5Q29uZmlnKSlcblxuICAgICAgICBpZiAoKytyID09PSA3KSB7XG4gICAgICAgICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgICAgICAgIHJvdy51bnNoaWZ0KHJlbmRlcldlZWsoaSAtIGJlZm9yZSwgbW9udGgsIHllYXIpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhLnB1c2gocmVuZGVyUm93KHJvdywgb3B0cy5pc1JUTCwgb3B0cy5waWNrV2hvbGVXZWVrLCBpc1dlZWtTZWxlY3RlZCkpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICByID0gMFxuICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZClcbiAgICB9LFxuXG4gICAgaXNWaXNpYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdlxuICAgIH0sXG5cbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgdGhpcy5fdiA9IHRydWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgYWRkRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgICAgdGhpcy5hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uT3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25PcGVuLmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB2ID0gdGhpcy5fdlxuICAgICAgaWYgKHYgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnIC8vIHJlc2V0XG4gICAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9ICdhdXRvJ1xuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9ICdhdXRvJ1xuICAgICAgICBhZGRDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IGZhbHNlXG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHRoaXMuX28ub25DbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25DbG9zZS5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnZm9jdXMnLCB0aGlzLl9vbklucHV0Rm9jdXMpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnYmx1cicsIHRoaXMuX29uSW5wdXRCbHVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbImRvY3VtZW50Iiwid2luZG93IiwiYWRkRXZlbnQiLCJlbCIsImUiLCJjYWxsYmFjayIsImNhcHR1cmUiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidHJpbSIsInN0ciIsInJlcGxhY2UiLCJoYXNDbGFzcyIsImNuIiwiY2xhc3NOYW1lIiwiaW5kZXhPZiIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0FycmF5IiwidGVzdCIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsIm9iaiIsImlzRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsImlzV2Vla2VuZCIsImRheSIsImRhdGUiLCJnZXREYXkiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImNvbXBhcmVEYXRlcyIsImEiLCJiIiwiZXh0ZW5kIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJzbGljZSIsImZpcmVFdmVudCIsImV2ZW50TmFtZSIsImRhdGEiLCJldiIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsImNyZWF0ZUV2ZW50T2JqZWN0IiwiYWRqdXN0Q2FsZW5kYXIiLCJjYWxlbmRhciIsIk1hdGgiLCJjZWlsIiwiYWJzIiwiZmxvb3IiLCJkZWZhdWx0cyIsInJlbmRlckRheU5hbWUiLCJvcHRzIiwiYWJiciIsImZpcnN0RGF5IiwiaTE4biIsIndlZWtkYXlzU2hvcnQiLCJ3ZWVrZGF5cyIsInJlbmRlckRheSIsImFyciIsImFyaWFTZWxlY3RlZCIsImlzRW1wdHkiLCJzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzIiwicHVzaCIsImVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsImlzRGlzYWJsZWQiLCJpc1RvZGF5IiwiaXNTZWxlY3RlZCIsImhhc0V2ZW50IiwiaXNJblJhbmdlIiwiaXNTdGFydFJhbmdlIiwiaXNFbmRSYW5nZSIsImpvaW4iLCJyZW5kZXJXZWVrIiwiZCIsIm0iLCJ5Iiwib25lamFuIiwid2Vla051bSIsInJlbmRlclJvdyIsImRheXMiLCJpc1JUTCIsInBpY2tXaG9sZVdlZWsiLCJpc1Jvd1NlbGVjdGVkIiwicmV2ZXJzZSIsInJlbmRlckJvZHkiLCJyb3dzIiwicmVuZGVySGVhZCIsImkiLCJzaG93V2Vla051bWJlciIsInJlbmRlclRpdGxlIiwiaW5zdGFuY2UiLCJjIiwicmVmWWVhciIsInJhbmRJZCIsImoiLCJfbyIsImlzTWluWWVhciIsIm1pblllYXIiLCJpc01heFllYXIiLCJtYXhZZWFyIiwiaHRtbCIsInByZXYiLCJuZXh0IiwibWluTW9udGgiLCJtYXhNb250aCIsIm1vbnRocyIsIm1vbnRoSHRtbCIsInllYXJSYW5nZSIsInllYXJIdG1sIiwieWVhclN1ZmZpeCIsInNob3dNb250aEFmdGVyWWVhciIsInByZXZpb3VzTW9udGgiLCJudW1iZXJPZk1vbnRocyIsIm5leHRNb250aCIsInJlbmRlclRhYmxlIiwiUGxhaW5QaWNrZXIiLCJvcHRpb25zIiwic2VsZiIsImNvbmZpZyIsIl9vbk1vdXNlRG93biIsIl92IiwiZXZlbnQiLCJ0YXJnZXQiLCJzcmNFbGVtZW50IiwicGFyZW50Tm9kZSIsImJvdW5kIiwic2V0RGF0ZSIsImdldEF0dHJpYnV0ZSIsImhpZGUiLCJibHVyRmllbGRPblNlbGVjdCIsImZpZWxkIiwiYmx1ciIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbkNoYW5nZSIsImdvdG9Nb250aCIsInZhbHVlIiwiZ290b1llYXIiLCJfb25LZXlDaGFuZ2UiLCJpc1Zpc2libGUiLCJrZXlDb2RlIiwiYWRqdXN0RGF0ZSIsIl9vbklucHV0Q2hhbmdlIiwiZmlyZWRCeSIsInBhcnNlIiwiZm9ybWF0Iiwic2hvdyIsIl9vbklucHV0Rm9jdXMiLCJfb25JbnB1dENsaWNrIiwiX29uSW5wdXRCbHVyIiwicEVsIiwiYWN0aXZlRWxlbWVudCIsIl9iIiwic2V0VGltZW91dCIsIl9vbkNsaWNrIiwidHJpZ2dlciIsImNyZWF0ZUVsZW1lbnQiLCJ0aGVtZSIsImNvbnRhaW5lciIsImFwcGVuZENoaWxkIiwiYm9keSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsImRpc2FibGVXZWVrZW5kcyIsImRpc2FibGVEYXlGbiIsIm5vbSIsInBhcnNlSW50IiwibWluRGF0ZSIsIm1heERhdGUiLCJzZXRNaW5EYXRlIiwic2V0TWF4RGF0ZSIsImZhbGxiYWNrIiwiZ2V0RnVsbFllYXIiLCJfZCIsInRvRGF0ZVN0cmluZyIsInByZXZlbnRPblNlbGVjdCIsImRyYXciLCJtaW4iLCJtYXgiLCJvblNlbGVjdCIsImdldERhdGUiLCJuZXdDYWxlbmRhciIsImNhbGVuZGFycyIsImZpcnN0VmlzaWJsZURhdGUiLCJsYXN0VmlzaWJsZURhdGUiLCJsZW5ndGgiLCJ2aXNpYmxlRGF0ZSIsInNldE1vbnRoIiwiZ2V0TW9udGgiLCJtYWluQ2FsZW5kYXIiLCJhZGp1c3RDYWxlbmRhcnMiLCJzaWduIiwiZGlmZmVyZW5jZSIsIm5ld0RheSIsInZhbHVlT2YiLCJzdGFydFJhbmdlIiwiZW5kUmFuZ2UiLCJmb3JjZSIsIl95IiwiX20iLCJyYW5kb20iLCJzdWJzdHIiLCJyZW5kZXIiLCJpbm5lckhUTUwiLCJ0eXBlIiwiZm9jdXMiLCJvbkRyYXciLCJzZXRBdHRyaWJ1dGUiLCJzdHlsZSIsInBvc2l0aW9uIiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsInZpZXdwb3J0V2lkdGgiLCJpbm5lcldpZHRoIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJ2aWV3cG9ydEhlaWdodCIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwic2Nyb2xsVG9wIiwicGFnZVlPZmZzZXQiLCJsZWZ0IiwidG9wIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2xpZW50UmVjdCIsInBhZ2VYT2Zmc2V0IiwiYm90dG9tIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsIm9mZnNldFBhcmVudCIsInJlcG9zaXRpb24iLCJub3ciLCJiZWZvcmUiLCJyb3ciLCJ5ZWFyT2ZQcmV2aW91c01vbnRoIiwieWVhck9mTmV4dE1vbnRoIiwiZGF5c0luUHJldmlvdXNNb250aCIsImNlbGxzIiwiYWZ0ZXIiLCJpc1dlZWtTZWxlY3RlZCIsInIiLCJldmVudHMiLCJkYXlOdW1iZXIiLCJtb250aE51bWJlciIsInllYXJOdW1iZXIiLCJkYXlDb25maWciLCJ1bnNoaWZ0IiwiYWRqdXN0UG9zaXRpb24iLCJvbk9wZW4iLCJ2Iiwib25DbG9zZSIsInJlbW92ZUNoaWxkIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsQ0FBQyxZQUFZOzs7O01BSUxBLFdBQVdDLE9BQU9ELFFBQXhCO01BQ01FLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxFQUFELEVBQUtDLENBQUwsRUFBUUMsUUFBUixFQUFrQkMsT0FBbEI7V0FBOEJILEdBQUdJLGdCQUFILENBQW9CSCxDQUFwQixFQUF1QkMsUUFBdkIsRUFBaUMsQ0FBQyxDQUFDQyxPQUFuQyxDQUE5QjtHQUFqQjs7TUFFTUUsY0FBYyxTQUFkQSxXQUFjLENBQUNMLEVBQUQsRUFBS0MsQ0FBTCxFQUFRQyxRQUFSLEVBQWtCQyxPQUFsQjtXQUE4QkgsR0FBR00sbUJBQUgsQ0FBdUJM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
