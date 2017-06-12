'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  /**
   * feature detection and helper functions
   */
  var document = window.document;
  var addEvent = function addEvent(el, e, callback, capture) {
    el.addEventListener(e, callback, !!capture);
  };

  var removeEvent = function removeEvent(el, e, callback, capture) {
    el.removeEventListener(e, callback, !!capture);
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

    rangeSelect: false,

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
    if (opts.hasEvent) {
      arr.push('has-event');
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
      if (i >= opts.minYear) {
        arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + i + '</option>');
      }
    }
    var yearHtml = '<div class="datepicker__label">' + year + opts.yearSuffix + '<select class="datepicker__select datepicker__select-year" tabindex="-1">' + arr.join('') + '</select></div>';

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
      html += '<button class="datepicker__prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
    }
    if (c === instance._o.numberOfMonths - 1) {
      html += '<button class="datepicker__next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
    }

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
    self.dateRangeArr = [];
    self.dateRangeSelectedArr = [];

    self._onMouseDown = function (e) {
      if (!self._v) {
        return;
      }
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return;
      }

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          if (opts.bound) {
            setTimeout(function () {
              // selectable date range on single calendar
              if (opts.rangeSelect) {
                var selectedDate = new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day'));
                self.dateRangeArr.push(selectedDate);
                if (self.dateRangeArr.length > 2) self.dateRangeArr.shift();
                console.log(self.dateRangeArr);
                self.dateRangeArr.forEach(function (e) {
                  self.setDate(e);
                });
              } else {
                self.setDate(new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day')));
                self.hide();
                if (opts.blurFieldOnSelect && opts.field) {
                  opts.field.blur();
                }
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

      if (self.isVisible()) {
        switch (e.keyCode) {
          case 13:
          case 27:
            if (opts.field) {
              if (opts.rangeSelect) {
                console.log('rangeSelectable');
              } else {
                opts.field.blur();
              }
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

      if (e.firedBy === self) {
        return;
      }
      if (opts.parse) {
        date = opts.parse(opts.field.value, opts.format);
      } else {
        date = new Date(Date.parse(opts.field.value));
      }
      if (isDate(date)) {
        self.setDate(date);
      }
      if (!self._v) {
        self.show();
      }
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

      if (!target) {
        return;
      }
      do {
        if (hasClass(pEl, 'datepicker') || pEl === opts.trigger) {
          return;
        }
      } while (pEl = pEl.parentNode);
      if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
        self.hide();
      }
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

      var nom = parseInt(opts.numberOfMonths, 10) || 1;
      opts.numberOfMonths = nom > 4 ? 4 : nom;

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

      return opts;
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function toString(format) {
      format = format || this._o.format;
      if (!isDate(this._d)) {
        return '';
      }
      if (this._o.toString) {
        return this._o.toString(this._d, format);
      }

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
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!isDate(date)) {
        return;
      }

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
      if (!preventOnSelect && typeof self._o.onSelect === 'function') {
        self._o.onSelect.call(self, self.getDate());
      }

      if (self._o.rangeSelect) {
        var newArr = self.dateRangeArr.map(function (el) {
          return self.toString(el);
        });
        console.log(newArr);
        self._o.field.value = newArr.join(' - ');
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnRcbiAgY29uc3QgYWRkRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgdHJpbSA9IHN0ciA9PiB7XG4gICAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgfVxuXG4gIGNvbnN0IGhhc0NsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIHJldHVybiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcbiAgfVxuXG4gIGNvbnN0IGFkZENsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGlmICghaGFzQ2xhc3MoZWwsIGNuKSkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gKGVsLmNsYXNzTmFtZSA9PT0gJycpID8gY24gOiBlbC5jbGFzc05hbWUgKyAnICcgKyBjblxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUNsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGVsLmNsYXNzTmFtZSA9IHRyaW0oKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbiArICcgJywgJyAnKSlcbiAgfVxuXG4gIGNvbnN0IGlzQXJyYXkgPSBvYmogPT4ge1xuICAgIHJldHVybiAoL0FycmF5LykudGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcbiAgfVxuXG4gIGNvbnN0IGlzRGF0ZSA9IG9iaiA9PiB7XG4gICAgcmV0dXJuICgvRGF0ZS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuICB9XG5cbiAgY29uc3QgaXNXZWVrZW5kID0gZGF0ZSA9PiB7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXkoKVxuICAgIHJldHVybiBkYXkgPT09IDAgfHwgZGF5ID09PSA2XG4gIH1cblxuICBjb25zdCBpc0xlYXBZZWFyID0geWVhciA9PiB7XG4gICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCAoeWVhciAlIDQwMCA9PT0gMClcbiAgfVxuXG4gIGNvbnN0IGdldERheXNJbk1vbnRoID0gKHllYXIsIG1vbnRoKSA9PiB7XG4gICAgcmV0dXJuIFszMSwgaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF1cbiAgfVxuXG4gIGNvbnN0IHNldFRvU3RhcnRPZkRheSA9IGRhdGUgPT4ge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGNvbXBhcmVEYXRlcyA9IChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgY29uc3QgZXh0ZW5kID0gKHRvLCBmcm9tLCBvdmVyd3JpdGUpID0+IHtcbiAgICBsZXQgcHJvcFxuICAgIGxldCBoYXNQcm9wXG5cbiAgICBmb3IgKHByb3AgaW4gZnJvbSkge1xuICAgICAgaGFzUHJvcCA9IHRvW3Byb3BdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmIChoYXNQcm9wICYmIHR5cGVvZiBmcm9tW3Byb3BdID09PSAnb2JqZWN0JyAmJiBmcm9tW3Byb3BdICE9PSBudWxsICYmIGZyb21bcHJvcF0ubm9kZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXNEYXRlKGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBuZXcgRGF0ZShmcm9tW3Byb3BdLmdldFRpbWUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXS5zbGljZSgwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b1twcm9wXSA9IGV4dGVuZCh7fSwgZnJvbVtwcm9wXSwgb3ZlcndyaXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG92ZXJ3cml0ZSB8fCAhaGFzUHJvcCkge1xuICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvXG4gIH1cblxuICBjb25zdCBmaXJlRXZlbnQgPSAoZWwsIGV2ZW50TmFtZSwgZGF0YSkgPT4ge1xuICAgIGxldCBldlxuXG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJylcbiAgICAgIGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5maXJlRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgZXYpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBjYWxlbmRhciA9PiB7XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xuICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCArPSAxMlxuICAgIH1cbiAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xuICAgICAgY2FsZW5kYXIueWVhciArPSBNYXRoLmZsb29yKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggLT0gMTJcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG5cbiAgICAvLyBiaW5kIHRoZSBwaWNrZXIgdG8gYSBmb3JtIGZpZWxkXG4gICAgZmllbGQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cbiAgICAvLyB0aGUgdG9TdHJpbmcgZnVuY3Rpb24gd2hpY2ggZ2V0cyBwYXNzZWQgYSBjdXJyZW50IGRhdGUgb2JqZWN0IGFuZCBmb3JtYXRcbiAgICAvLyBhbmQgcmV0dXJucyBhIHN0cmluZ1xuICAgIHRvU3RyaW5nOiBudWxsLFxuXG4gICAgLy8gdXNlZCB0byBjcmVhdGUgZGF0ZSBvYmplY3QgZnJvbSBjdXJyZW50IGlucHV0IHN0cmluZ1xuICAgIHBhcnNlOiBudWxsLFxuXG4gICAgLy8gdGhlIGluaXRpYWwgZGF0ZSB0byB2aWV3IHdoZW4gZmlyc3Qgb3BlbmVkXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXG5cbiAgICAvLyBtYWtlIHRoZSBgZGVmYXVsdERhdGVgIHRoZSBpbml0aWFsIHNlbGVjdGVkIHZhbHVlXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxuXG4gICAgLy8gZmlyc3QgZGF5IG9mIHdlZWsgKDA6IFN1bmRheSwgMTogTW9uZGF5IGV0YylcbiAgICBmaXJzdERheTogMCxcblxuICAgIC8vIHRoZSBkZWZhdWx0IGZsYWcgZm9yIG1vbWVudCdzIHN0cmljdCBkYXRlIHBhcnNpbmdcbiAgICBmb3JtYXRTdHJpY3Q6IGZhbHNlLFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIFdlZWsgcGlja2VyIG1vZGVcbiAgICBwaWNrV2hvbGVXZWVrOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIEFsbG93cyB1c2VyIHRvIHNlbGVjdCBkYXlzIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBCbHVyIGZpZWxkIHdoZW4gZGF0ZSBpcyBzZWxlY3RlZFxuICAgIGJsdXJGaWVsZE9uU2VsZWN0OiB0cnVlLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldiBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBldmVudHMgYXJyYXlcbiAgICBldmVudHM6IFtdLFxuXG4gICAgcmFuZ2VTZWxlY3Q6IGZhbHNlLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNUb2RheSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5JylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkge1xuICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1N0YXJ0UmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zdGFydHJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcbiAgICB9XG4gICAgcmV0dXJuICc8dGQgZGF0YS1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCIgY2xhc3M9XCInICsgYXJyLmpvaW4oJyAnKSArICdcIiBhcmlhLXNlbGVjdGVkPVwiJyArIGFyaWFTZWxlY3RlZCArICdcIj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19idXR0b24gZGF0ZXBpY2tlcl9fZGF5XCIgdHlwZT1cImJ1dHRvblwiICcgK1xuICAgICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICsgb3B0cy55ZWFyICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgKyBvcHRzLm1vbnRoICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCI+JyArXG4gICAgICAgIG9wdHMuZGF5ICtcbiAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDApICsgb25lamFuLmdldERheSgpICsgMSkgLyA3KVxuICAgIHJldHVybiAnPHRkIGNsYXNzPVwiZGF0ZXBpY2tlcl9fd2Vla1wiPicgKyB3ZWVrTnVtICsgJzwvdGQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyUm93ID0gKGRheXMsIGlzUlRMLCBwaWNrV2hvbGVXZWVrLCBpc1Jvd1NlbGVjdGVkKSA9PiB7XG4gICAgcmV0dXJuICc8dHIgY2xhc3M9XCJkYXRlcGlja2VyX19yb3cnICsgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgKyAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICsgJ1wiPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IHJvd3MgPT4ge1xuICAgIHJldHVybiAnPHRib2R5PicgKyByb3dzLmpvaW4oJycpICsgJzwvdGJvZHk+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IG9wdHMgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGFyciA9IFtdXG4gICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgIGFyci5wdXNoKCc8dGg+PC90aD4nKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICBhcnIucHVzaCgnPHRoIHNjb3BlPVwiY29sXCI+PGFiYnIgdGl0bGU9XCInICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpKSArICdcIj4nICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpLCB0cnVlKSArICc8L2FiYnI+PC90aD4nKVxuICAgIH1cbiAgICByZXR1cm4gJzx0aGVhZD48dHI+JyArIChvcHRzLmlzUlRMID8gYXJyLnJldmVyc2UoKSA6IGFycikuam9pbignJykgKyAnPC90cj48L3RoZWFkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRpdGxlID0gKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRJZCArICdcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgcm9sZT1cImhlYWRpbmdcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj4nXG5cbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICsgJ1wiJyArXG4gICAgICAgICAgKGkgPT09IG1vbnRoID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICtcbiAgICAgICAgICAoKGlzTWluWWVhciAmJiBpIDwgb3B0cy5taW5Nb250aCkgfHwgKGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aCkgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSArICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArICc8L29wdGlvbj4nKVxuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoSHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gKyAnPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXJfX3NlbGVjdCBkYXRlcGlja2VyX19zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikge1xuICAgICAgICBhcnIucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiJyArIChpID09PSB5ZWFyID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICsgJz4nICsgKGkpICsgJzwvb3B0aW9uPicpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHllYXJIdG1sID0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgKyB5ZWFyICsgb3B0cy55ZWFyU3VmZml4ICsgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAob3B0cy5zaG93TW9udGhBZnRlclllYXIpIHtcbiAgICAgIGh0bWwgKz0geWVhckh0bWwgKyBtb250aEh0bWxcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSBtb250aEh0bWwgKyB5ZWFySHRtbFxuICAgIH1cblxuICAgIGlmIChpc01pblllYXIgJiYgKG1vbnRoID09PSAwIHx8IG9wdHMubWluTW9udGggPj0gbW9udGgpKSB7XG4gICAgICBwcmV2ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoaXNNYXhZZWFyICYmIChtb250aCA9PT0gMTEgfHwgb3B0cy5tYXhNb250aCA8PSBtb250aCkpIHtcbiAgICAgIG5leHQgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChjID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcHJldicgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLnByZXZpb3VzTW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cbiAgICBpZiAoYyA9PT0gKGluc3RhbmNlLl9vLm51bWJlck9mTW9udGhzIC0gMSkpIHtcbiAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19uZXh0JyArIChuZXh0ID8gJycgOiAnIGlzLWRpc2FibGVkJykgKyAnXCIgdHlwZT1cImJ1dHRvblwiPicgKyBvcHRzLmkxOG4ubmV4dE1vbnRoICsgJzwvYnV0dG9uPidcbiAgICB9XG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSAob3B0cywgZGF0YSwgcmFuZElkKSA9PiB7XG4gICAgcmV0dXJuICc8dGFibGUgY2VsbHBhZGRpbmc9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2xhc3M9XCJkYXRlcGlja2VyX190YWJsZVwiIHJvbGU9XCJncmlkXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArIHJhbmRJZCArICdcIj4nICsgcmVuZGVySGVhZChvcHRzKSArIHJlbmRlckJvZHkoZGF0YSkgKyAnPC90YWJsZT4nXG4gIH1cblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuICAgIHNlbGYuZGF0ZVJhbmdlQXJyID0gW11cbiAgICBzZWxmLmRhdGVSYW5nZVNlbGVjdGVkQXJyID0gW11cblxuICAgIHNlbGYuX29uTW91c2VEb3duID0gZSA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uJykgJiYgIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWVtcHR5JykgJiYgIWhhc0NsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgLy8gc2VsZWN0YWJsZSBkYXRlIHJhbmdlIG9uIHNpbmdsZSBjYWxlbmRhclxuICAgICAgICAgICAgICBpZiAob3B0cy5yYW5nZVNlbGVjdCkge1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZSh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXIteWVhcicpLCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItbW9udGgnKSwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpKVxuICAgICAgICAgICAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLnB1c2goc2VsZWN0ZWREYXRlKVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmRhdGVSYW5nZUFyci5sZW5ndGggPiAyKSBzZWxmLmRhdGVSYW5nZUFyci5zaGlmdCgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZi5kYXRlUmFuZ2VBcnIpXG4gICAgICAgICAgICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZXREYXRlKGUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldERhdGUobmV3IERhdGUodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLW1vbnRoJyksIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKSkpXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ibHVyRmllbGRPblNlbGVjdCAmJiBvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gPHNlbGVjdD5cbiAgICBzZWxmLl9vbkNoYW5nZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC1tb250aCcpKSB7XG4gICAgICAgIHNlbGYuZ290b01vbnRoKHRhcmdldC52YWx1ZSlcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXInKSkge1xuICAgICAgICBzZWxmLmdvdG9ZZWFyKHRhcmdldC52YWx1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9vbktleUNoYW5nZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2VTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmFuZ2VTZWxlY3RhYmxlJylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdzdWJ0cmFjdCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENoYW5nZSA9IGUgPT4ge1xuICAgICAgbGV0IGRhdGVcblxuICAgICAgaWYgKGUuZmlyZWRCeSA9PT0gc2VsZikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLnBhcnNlKSB7XG4gICAgICAgIGRhdGUgPSBvcHRzLnBhcnNlKG9wdHMuZmllbGQudmFsdWUsIG9wdHMuZm9ybWF0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICB9XG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgfVxuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHNlbGYuc2hvdygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gKCkgPT4ge1xuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRCbHVyID0gKCkgPT4ge1xuICAgICAgbGV0IHBFbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHNlbGYuX2IgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uQ2xpY2sgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBsZXQgcEVsID0gdGFyZ2V0XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzZWxmLmVsLmNsYXNzTmFtZSA9ICdkYXRlcGlja2VyJyArIChvcHRzLmlzUlRMID8gJyBpcy1ydGwnIDogJycpICsgKG9wdHMudGhlbWUgPyAnICcgKyBvcHRzLnRoZW1lIDogJycpXG5cbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2Vkb3duJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmRGF0ZSA9IG9wdHMuZGVmYXVsdERhdGVcblxuICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkZWZEYXRlLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnY2xpY2snLCBzZWxmLl9vbklucHV0Q2xpY2spXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cbiAgUGxhaW5QaWNrZXIucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICogY29uZmlndXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKi9cbiAgICBjb25maWc6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAoIXRoaXMuX28pIHtcbiAgICAgICAgdGhpcy5fbyA9IGV4dGVuZCh7fSwgZGVmYXVsdHMsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdHMgPSBleHRlbmQodGhpcy5fbywgb3B0aW9ucywgdHJ1ZSlcblxuICAgICAgb3B0cy5pc1JUTCA9ICEhb3B0cy5pc1JUTFxuXG4gICAgICBvcHRzLmZpZWxkID0gKG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSkgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gKHR5cGVvZiBvcHRzLnRoZW1lKSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSAob3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSkgPyBvcHRzLnRyaWdnZXIgOiBvcHRzLmZpZWxkXG5cbiAgICAgIG9wdHMuZGlzYWJsZVdlZWtlbmRzID0gISFvcHRzLmRpc2FibGVXZWVrZW5kc1xuXG4gICAgICBvcHRzLmRpc2FibGVEYXlGbiA9ICh0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4pID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkge1xuICAgICAgICBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkge1xuICAgICAgICBvcHRzLm1heERhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKChvcHRzLm1pbkRhdGUgJiYgb3B0cy5tYXhEYXRlKSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0c1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBmb3JtYXR0ZWQgc3RyaW5nIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbiAodXNpbmcgTW9tZW50LmpzIGlmIGF2YWlsYWJsZSlcbiAgICAgKi9cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMuX28uZm9ybWF0XG4gICAgICBpZiAoIWlzRGF0ZSh0aGlzLl9kKSkge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9vLnRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vLnRvU3RyaW5nKHRoaXMuX2QsIGZvcm1hdClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzRGF0ZSh0aGlzLl9kKSA/IG5ldyBEYXRlKHRoaXMuX2QuZ2V0VGltZSgpKSA6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uIChkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG5cbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICBzZWxmLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHNlbGYuX28uZmllbGQsICdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBtaW4gPSBzZWxmLl9vLm1pbkRhdGVcbiAgICAgIGNvbnN0IG1heCA9IHNlbGYuX28ubWF4RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xuICAgICAgICBkYXRlID0gbWluXG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcbiAgICAgICAgZGF0ZSA9IG1heFxuICAgICAgfVxuXG4gICAgICBzZWxmLl9kID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoc2VsZi5fZClcbiAgICAgIHNlbGYuZ290b0RhdGUoc2VsZi5fZClcblxuICAgICAgaWYgKHNlbGYuX28uZmllbGQpIHtcbiAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9IHNlbGYudG9TdHJpbmcoKVxuICAgICAgICBmaXJlRXZlbnQoc2VsZi5fby5maWVsZCwgJ2NoYW5nZScsIHtcbiAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoIXByZXZlbnRPblNlbGVjdCAmJiB0eXBlb2Ygc2VsZi5fby5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzZWxmLl9vLm9uU2VsZWN0LmNhbGwoc2VsZiwgc2VsZi5nZXREYXRlKCkpXG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl9vLnJhbmdlU2VsZWN0KSB7XG4gICAgICAgIGxldCBuZXdBcnIgPSBzZWxmLmRhdGVSYW5nZUFyci5tYXAoZWwgPT4gc2VsZi50b1N0cmluZyhlbCkpXG4gICAgICAgIGNvbnNvbGUubG9nKG5ld0FycilcbiAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9IG5ld0Fyci5qb2luKCcgLSAnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGRhdGVcbiAgICAgKi9cbiAgICBnb3RvRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIGxldCBuZXdDYWxlbmRhciA9IHRydWVcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG4gICAgICAgIC8vIGdldCB0aGUgZW5kIG9mIHRoZSBtb250aFxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0TW9udGgobGFzdFZpc2libGVEYXRlLmdldE1vbnRoKCkgKyAxKVxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0RGF0ZShsYXN0VmlzaWJsZURhdGUuZ2V0RGF0ZSgpIC0gMSlcbiAgICAgICAgbmV3Q2FsZW5kYXIgPSAodmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdDYWxlbmRhcikge1xuICAgICAgICB0aGlzLmNhbGVuZGFycyA9IFt7XG4gICAgICAgICAgbW9udGg6IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgfV1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uIChzaWduLCBkYXlzKSB7XG4gICAgICBjb25zdCBkYXkgPSB0aGlzLmdldERhdGUoKSB8fCBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cykgKiAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAgIGxldCBuZXdEYXlcblxuICAgICAgaWYgKHNpZ24gPT09ICdhZGQnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgKyBkaWZmZXJlbmNlKVxuICAgICAgfSBlbHNlIGlmIChzaWduID09PSAnc3VidHJhY3QnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgLSBkaWZmZXJlbmNlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldERhdGUobmV3RGF5KVxuICAgIH0sXG5cbiAgICBhZGp1c3RDYWxlbmRhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBjXG5cbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdID0gYWRqdXN0Q2FsZW5kYXIodGhpcy5jYWxlbmRhcnNbMF0pXG4gICAgICBmb3IgKGMgPSAxOyBjIDwgdGhpcy5fby5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzW2NdID0gYWRqdXN0Q2FsZW5kYXIoe1xuICAgICAgICAgIG1vbnRoOiB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArIGMsXG4gICAgICAgICAgeWVhcjogdGhpcy5jYWxlbmRhcnNbMF0ueWVhclxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgZ290b1RvZGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgbW9udGggKHplcm8taW5kZXgsIGUuZy4gMDogSmFudWFyeSlcbiAgICAgKi9cbiAgICBnb3RvTW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCsrXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIHByZXZNb250aDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgtLVxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGZ1bGwgeWVhciAoZS5nLiBcIjIwMTJcIilcbiAgICAgKi9cbiAgICBnb3RvWWVhcjogZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IGRlZmF1bHRzLm1pbkRhdGVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gZGVmYXVsdHMubWluWWVhclxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZGVmYXVsdHMubWluTW9udGhcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gZGVmYXVsdHMuc3RhcnRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdGhlIG1heERhdGVcbiAgICAgKi9cbiAgICBzZXRNYXhEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgc2V0VG9TdGFydE9mRGF5KHZhbHVlKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSB2YWx1ZVxuICAgICAgICB0aGlzLl9vLm1heFllYXIgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuX28ubWF4TW9udGggPSB2YWx1ZS5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSBkZWZhdWx0cy5lbmRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBzZXRTdGFydFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uc3RhcnRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIHNldEVuZFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24gKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3QgbWluWWVhciA9IG9wdHMubWluWWVhclxuICAgICAgY29uc3QgbWF4WWVhciA9IG9wdHMubWF4WWVhclxuICAgICAgY29uc3QgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICBjb25zdCBtYXhNb250aCA9IG9wdHMubWF4TW9udGhcbiAgICAgIGxldCBodG1sID0gJydcbiAgICAgIGxldCByYW5kSWRcblxuICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWluWWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3kgPj0gbWF4WWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWF4WWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlcl9fdGl0bGUtJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgJycpLnN1YnN0cigwLCAyKVxuXG4gICAgICBsZXQgY1xuICAgICAgZm9yIChjID0gMDsgYyA8IG9wdHMubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGVuZGFyXCI+JyArIHJlbmRlclRpdGxlKHRoaXMsIGMsIHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCB0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCByYW5kSWQpICsgdGhpcy5yZW5kZXIodGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHJhbmRJZCkgKyAnPC9kaXY+J1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgaWYgKG9wdHMuZmllbGQudHlwZSAhPT0gJ2hpZGRlbicpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIG9wdHMudHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgfSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25EcmF3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX28ub25EcmF3KHRoaXMpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIC8vIGxldCB0aGUgc2NyZWVuIHJlYWRlciB1c2VyIGtub3cgdG8gdXNlIGFycm93IGtleXNcbiAgICAgICAgb3B0cy5maWVsZC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnVXNlIHRoZSBhcnJvdyBrZXlzIHRvIHBpY2sgYSBkYXRlJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9vLmNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5fby50cmlnZ2VyXG4gICAgICBsZXQgcEVsID0gZmllbGRcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5lbC5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5lbC5vZmZzZXRIZWlnaHRcbiAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICBsZXQgbGVmdFxuICAgICAgbGV0IHRvcFxuXG4gICAgICBpZiAodHlwZW9mIGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBjbGllbnRSZWN0ID0gZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgbGVmdCA9IGNsaWVudFJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldFxuICAgICAgICB0b3AgPSBjbGllbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVmdCA9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgIHRvcCA9IHBFbC5vZmZzZXRUb3AgKyBwRWwub2Zmc2V0SGVpZ2h0XG4gICAgICAgIHdoaWxlICgocEVsID0gcEVsLm9mZnNldFBhcmVudCkpIHtcbiAgICAgICAgICBsZWZ0ICs9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgICAgdG9wICs9IHBFbC5vZmZzZXRUb3BcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbSAmIGxlZnRcbiAgICAgIGlmICgodGhpcy5fby5yZXBvc2l0aW9uICYmIGxlZnQgKyB3aWR0aCA+IHZpZXdwb3J0V2lkdGgpIHx8IChcbiAgICAgICAgICB0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSAmJlxuICAgICAgICAgIGxlZnQgLSB3aWR0aCArIGZpZWxkLm9mZnNldFdpZHRoID4gMFxuICAgICAgICApKSB7XG4gICAgICAgIGxlZnQgPSBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aFxuICAgICAgfVxuICAgICAgaWYgKCh0aGlzLl9vLnJlcG9zaXRpb24gJiYgdG9wICsgaGVpZ2h0ID4gdmlld3BvcnRIZWlnaHQgKyBzY3JvbGxUb3ApIHx8IChcbiAgICAgICAgICB0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEgJiZcbiAgICAgICAgICB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHQgPiAwXG4gICAgICAgICkpIHtcbiAgICAgICAgdG9wID0gdG9wIC0gaGVpZ2h0IC0gZmllbGQub2Zmc2V0SGVpZ2h0XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnXG4gICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVuZGVyIEhUTUwgZm9yIGEgcGFydGljdWxhciBtb250aFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkYXlzID0gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpXG4gICAgICBsZXQgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gICAgICBsZXQgZGF0YSA9IFtdXG4gICAgICBsZXQgcm93ID0gW11cblxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcblxuICAgICAgaWYgKG9wdHMuZmlyc3REYXkgPiAwKSB7XG4gICAgICAgIGJlZm9yZSAtPSBvcHRzLmZpcnN0RGF5XG4gICAgICAgIGlmIChiZWZvcmUgPCAwKSB7XG4gICAgICAgICAgYmVmb3JlICs9IDdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyAxMSA6IG1vbnRoIC0gMVxuICAgICAgY29uc3QgbmV4dE1vbnRoID0gbW9udGggPT09IDExID8gMCA6IG1vbnRoICsgMVxuICAgICAgY29uc3QgeWVhck9mUHJldmlvdXNNb250aCA9IG1vbnRoID09PSAwID8geWVhciAtIDEgOiB5ZWFyXG4gICAgICBjb25zdCB5ZWFyT2ZOZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXJcbiAgICAgIGNvbnN0IGRheXNJblByZXZpb3VzTW9udGggPSBnZXREYXlzSW5Nb250aCh5ZWFyT2ZQcmV2aW91c01vbnRoLCBwcmV2aW91c01vbnRoKVxuICAgICAgbGV0IGNlbGxzID0gZGF5cyArIGJlZm9yZVxuICAgICAgbGV0IGFmdGVyID0gY2VsbHNcblxuICAgICAgd2hpbGUgKGFmdGVyID4gNykge1xuICAgICAgICBhZnRlciAtPSA3XG4gICAgICB9XG5cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgbGV0IGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgIGxldCBpLCByXG5cbiAgICAgIGZvciAoaSA9IDAsIHIgPSAwOyBpIDwgY2VsbHM7IGkrKykge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSlcbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGlzRGF0ZSh0aGlzLl9kKSA/IGNvbXBhcmVEYXRlcyhkYXksIHRoaXMuX2QpIDogZmFsc2VcbiAgICAgICAgY29uc3QgaXNUb2RheSA9IGNvbXBhcmVEYXRlcyhkYXksIG5vdylcbiAgICAgICAgY29uc3QgaGFzRXZlbnQgPSBvcHRzLmV2ZW50cy5pbmRleE9mKGRheS50b0RhdGVTdHJpbmcoKSkgIT09IC0xXG4gICAgICAgIGNvbnN0IGlzRW1wdHkgPSBpIDwgYmVmb3JlIHx8IGkgPj0gKGRheXMgKyBiZWZvcmUpXG4gICAgICAgIGxldCBkYXlOdW1iZXIgPSAxICsgKGkgLSBiZWZvcmUpXG4gICAgICAgIGxldCBtb250aE51bWJlciA9IG1vbnRoXG4gICAgICAgIGxldCB5ZWFyTnVtYmVyID0geWVhclxuICAgICAgICBjb25zdCBpc1N0YXJ0UmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgY29tcGFyZURhdGVzKG9wdHMuc3RhcnRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0VuZFJhbmdlID0gb3B0cy5lbmRSYW5nZSAmJiBjb21wYXJlRGF0ZXMob3B0cy5lbmRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgICBjb25zdCBpc0Rpc2FibGVkID0gKG9wdHMubWluRGF0ZSAmJiBkYXkgPCBvcHRzLm1pbkRhdGUpIHx8XG4gICAgICAgICAgKG9wdHMubWF4RGF0ZSAmJiBkYXkgPiBvcHRzLm1heERhdGUpIHx8XG4gICAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIGlzV2Vla2VuZChkYXkpKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVEYXlGbiAmJiBvcHRzLmRpc2FibGVEYXlGbihkYXkpKVxuXG4gICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgaWYgKGkgPCBiZWZvcmUpIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheXNJblByZXZpb3VzTW9udGggKyBkYXlOdW1iZXJcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gcHJldmlvdXNNb250aFxuICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZlByZXZpb3VzTW9udGhcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5TnVtYmVyIC0gZGF5c1xuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBuZXh0TW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZOZXh0TW9udGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXlDb25maWcgPSB7XG4gICAgICAgICAgZGF5OiBkYXlOdW1iZXIsXG4gICAgICAgICAgbW9udGg6IG1vbnRoTnVtYmVyLFxuICAgICAgICAgIHllYXI6IHllYXJOdW1iZXIsXG4gICAgICAgICAgaGFzRXZlbnQ6IGhhc0V2ZW50LFxuICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWQsXG4gICAgICAgICAgaXNUb2RheTogaXNUb2RheSxcbiAgICAgICAgICBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLFxuICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXG4gICAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXG4gICAgICAgICAgaXNFbmRSYW5nZTogaXNFbmRSYW5nZSxcbiAgICAgICAgICBpc0luUmFuZ2U6IGlzSW5SYW5nZSxcbiAgICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMsXG4gICAgICAgICAgZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLmVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdHMucGlja1dob2xlV2VlayAmJiBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICByb3cucHVzaChyZW5kZXJEYXkoZGF5Q29uZmlnKSlcblxuICAgICAgICBpZiAoKytyID09PSA3KSB7XG4gICAgICAgICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgICAgICAgIHJvdy51bnNoaWZ0KHJlbmRlcldlZWsoaSAtIGJlZm9yZSwgbW9udGgsIHllYXIpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhLnB1c2gocmVuZGVyUm93KHJvdywgb3B0cy5pc1JUTCwgb3B0cy5waWNrV2hvbGVXZWVrLCBpc1dlZWtTZWxlY3RlZCkpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICByID0gMFxuICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZClcbiAgICB9LFxuXG4gICAgaXNWaXNpYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdlxuICAgIH0sXG5cbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgdGhpcy5fdiA9IHRydWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgYWRkRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgICAgdGhpcy5hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uT3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25PcGVuLmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB2ID0gdGhpcy5fdlxuICAgICAgaWYgKHYgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnIC8vIHJlc2V0XG4gICAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9ICdhdXRvJ1xuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9ICdhdXRvJ1xuICAgICAgICBhZGRDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IGZhbHNlXG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHRoaXMuX28ub25DbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25DbG9zZS5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnZm9jdXMnLCB0aGlzLl9vbklucHV0Rm9jdXMpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnYmx1cicsIHRoaXMuX29uSW5wdXRCbHVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbImRvY3VtZW50Iiwid2luZG93IiwiYWRkRXZlbnQiLCJlbCIsImUiLCJjYWxsYmFjayIsImNhcHR1cmUiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidHJpbSIsInN0ciIsInJlcGxhY2UiLCJoYXNDbGFzcyIsImNuIiwiY2xhc3NOYW1lIiwiaW5kZXhPZiIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0FycmF5IiwidGVzdCIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsIm9iaiIsImlzRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsImlzV2Vla2VuZCIsImRheSIsImRhdGUiLCJnZXREYXkiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImNvbXBhcmVEYXRlcyIsImEiLCJiIiwiZXh0ZW5kIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJzbGljZSIsImZpcmVFdmVudCIsImV2ZW50TmFtZSIsImRhdGEiLCJldiIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsImNyZWF0ZUV2ZW50T2JqZWN0IiwiYWRqdXN0Q2FsZW5kYXIiLCJjYWxlbmRhciIsIk1hdGgiLCJjZWlsIiwiYWJzIiwiZmxvb3IiLCJkZWZhdWx0cyIsInJlbmRlckRheU5hbWUiLCJvcHRzIiwiYWJiciIsImZpcnN0RGF5IiwiaTE4biIsIndlZWtkYXlzU2hvcnQiLCJ3ZWVrZGF5cyIsInJlbmRlckRheSIsImFyciIsImFyaWFTZWxlY3RlZCIsImlzRW1wdHkiLCJzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzIiwicHVzaCIsImVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsImlzRGlzYWJsZWQiLCJpc1RvZGF5IiwiaXNTZWxlY3RlZCIsImhhc0V2ZW50IiwiaXNJblJhbmdlIiwiaXNTdGFydFJhbmdlIiwiaXNFbmRSYW5nZSIsImpvaW4iLCJyZW5kZXJXZWVrIiwiZCIsIm0iLCJ5Iiwib25lamFuIiwid2Vla051bSIsInJlbmRlclJvdyIsImRheXMiLCJpc1JUTCIsInBpY2tXaG9sZVdlZWsiLCJpc1Jvd1NlbGVjdGVkIiwicmV2ZXJzZSIsInJlbmRlckJvZHkiLCJyb3dzIiwicmVuZGVySGVhZCIsImkiLCJzaG93V2Vla051bWJlciIsInJlbmRlclRpdGxlIiwiaW5zdGFuY2UiLCJjIiwicmVmWWVhciIsInJhbmRJZCIsImoiLCJfbyIsImlzTWluWWVhciIsIm1pblllYXIiLCJpc01heFllYXIiLCJtYXhZZWFyIiwiaHRtbCIsInByZXYiLCJuZXh0IiwibWluTW9udGgiLCJtYXhNb250aCIsIm1vbnRocyIsIm1vbnRoSHRtbCIsInllYXJSYW5nZSIsInllYXJIdG1sIiwieWVhclN1ZmZpeCIsInNob3dNb250aEFmdGVyWWVhciIsInByZXZpb3VzTW9udGgiLCJudW1iZXJPZk1vbnRocyIsIm5leHRNb250aCIsInJlbmRlclRhYmxlIiwiUGxhaW5QaWNrZXIiLCJvcHRpb25zIiwic2VsZiIsImNvbmZpZyIsImRhdGVSYW5nZUFyciIsImRhdGVSYW5nZVNlbGVjdGVkQXJyIiwiX29uTW91c2VEb3duIiwiX3YiLCJldmVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJwYXJlbnROb2RlIiwiYm91bmQiLCJyYW5nZVNlbGVjdCIsInNlbGVjdGVkRGF0ZSIsImdldEF0dHJpYnV0ZSIsImxlbmd0aCIsInNoaWZ0IiwibG9nIiwiZm9yRWFjaCIsInNldERhdGUiLCJoaWRlIiwiYmx1ckZpZWxkT25TZWxlY3QiLCJmaWVsZCIsImJsdXIiLCJwcmV2TW9udGgiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwiX2MiLCJfb25DaGFuZ2UiLCJnb3RvTW9udGgiLCJ2YWx1ZSIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiaXNWaXNpYmxlIiwia2V5Q29kZSIsImFkanVzdERhdGUiLCJfb25JbnB1dENoYW5nZSIsImZpcmVkQnkiLCJwYXJzZSIsImZvcm1hdCIsInNob3ciLCJfb25JbnB1dEZvY3VzIiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfYiIsInNldFRpbWVvdXQiLCJfb25DbGljayIsInRyaWdnZXIiLCJjcmVhdGVFbGVtZW50IiwidGhlbWUiLCJjb250YWluZXIiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJpbnNlcnRCZWZvcmUiLCJuZXh0U2libGluZyIsImRlZmF1bHREYXRlIiwic2V0RGVmYXVsdERhdGUiLCJkZWZEYXRlIiwiZ290b0RhdGUiLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJub20iLCJwYXJzZUludCIsIm1pbkRhdGUiLCJtYXhEYXRlIiwic2V0TWluRGF0ZSIsInNldE1heERhdGUiLCJmYWxsYmFjayIsImdldEZ1bGxZZWFyIiwiX2QiLCJ0b0RhdGVTdHJpbmciLCJwcmV2ZW50T25TZWxlY3QiLCJkcmF3IiwibWluIiwibWF4Iiwib25TZWxlY3QiLCJnZXREYXRlIiwibmV3QXJyIiwibWFwIiwibmV3Q2FsZW5kYXIiLCJjYWxlbmRhcnMiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsImdldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwic2lnbiIsImRpZmZlcmVuY2UiLCJuZXdEYXkiLCJ2YWx1ZU9mIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiZm9yY2UiLCJfeSIsIl9tIiwicmFuZG9tIiwic3Vic3RyIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwidHlwZSIsImZvY3VzIiwib25EcmF3Iiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJwb3NpdGlvbiIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwibGVmdCIsInRvcCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJwYWdlWE9mZnNldCIsImJvdHRvbSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRQYXJlbnQiLCJyZXBvc2l0aW9uIiwibm93IiwiYmVmb3JlIiwicm93IiwieWVhck9mUHJldmlvdXNNb250aCIsInllYXJPZk5leHRNb250aCIsImRheXNJblByZXZpb3VzTW9udGgiLCJjZWxscyIsImFmdGVyIiwiaXNXZWVrU2VsZWN0ZWQiLCJyIiwiZXZlbnRzIiwiZGF5TnVtYmVyIiwibW9udGhOdW1iZXIiLCJ5ZWFyTnVtYmVyIiwiZGF5Q29uZmlnIiwidW5zaGlmdCIsImFkanVzdFBvc2l0aW9uIiwib25PcGVuIiwidiIsIm9uQ2xvc2UiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLENBQUMsWUFBWTs7OztNQUlMQSxXQUFXQyxPQUFPRCxRQUF4QjtNQUNNRSxXQUFXLFNBQVhBLFFBQVcsQ0FBQ0MsRUFBRCxFQUFLQyxDQUFMLEVBQVFDLFFBQVIsRUFBa0JDLE9BQWxCLEVBQThCO09BQzFDQyxnQkFBSCxDQUFvQkgsQ0FBcEIsRUFBdUJDLFFBQXZCLEVBQWlDLENBQUMsQ0FBQ0MsT0FBbkM7R0FERjs7TUFJTUUsY0FBYyxT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
