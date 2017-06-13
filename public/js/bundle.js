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
    var defOptsMinDate = opts.minDate;
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
              if (opts.rangeSelect) {
                // selectable date range on single calendar
                var selectedDate = new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day'));
                addClass(target, 'datepicker__button--selected');
                self.setMinDate(selectedDate);

                self.dateRangeArr.push(selectedDate

                // 選択可能は二つまで。とりあえず
                );if (self.dateRangeArr.length > 2) {
                  self.dateRangeArr.shift();
                }

                self.dateRangeArr.forEach(function (e) {
                  self.setDate(e);
                });
                if (self.dateRangeArr.length > 1) {
                  self.hide();
                  self.setMinDate(defOptsMinDate);
                }
                if (opts.blurFieldOnSelect && opts.field) {
                  opts.field.blur();
                }
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
        self._o.field.value = self.dateRangeArr.join(' TO ');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnRcbiAgY29uc3QgYWRkRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgdHJpbSA9IHN0ciA9PiB7XG4gICAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgfVxuXG4gIGNvbnN0IGhhc0NsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIHJldHVybiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcbiAgfVxuXG4gIGNvbnN0IGFkZENsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGlmICghaGFzQ2xhc3MoZWwsIGNuKSkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gKGVsLmNsYXNzTmFtZSA9PT0gJycpID8gY24gOiBlbC5jbGFzc05hbWUgKyAnICcgKyBjblxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUNsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGVsLmNsYXNzTmFtZSA9IHRyaW0oKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbiArICcgJywgJyAnKSlcbiAgfVxuXG4gIGNvbnN0IGlzQXJyYXkgPSBvYmogPT4ge1xuICAgIHJldHVybiAoL0FycmF5LykudGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcbiAgfVxuXG4gIGNvbnN0IGlzRGF0ZSA9IG9iaiA9PiB7XG4gICAgcmV0dXJuICgvRGF0ZS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuICB9XG5cbiAgY29uc3QgaXNXZWVrZW5kID0gZGF0ZSA9PiB7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXkoKVxuICAgIHJldHVybiBkYXkgPT09IDAgfHwgZGF5ID09PSA2XG4gIH1cblxuICBjb25zdCBpc0xlYXBZZWFyID0geWVhciA9PiB7XG4gICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCAoeWVhciAlIDQwMCA9PT0gMClcbiAgfVxuXG4gIGNvbnN0IGdldERheXNJbk1vbnRoID0gKHllYXIsIG1vbnRoKSA9PiB7XG4gICAgcmV0dXJuIFszMSwgaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF1cbiAgfVxuXG4gIGNvbnN0IHNldFRvU3RhcnRPZkRheSA9IGRhdGUgPT4ge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGNvbXBhcmVEYXRlcyA9IChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgY29uc3QgZXh0ZW5kID0gKHRvLCBmcm9tLCBvdmVyd3JpdGUpID0+IHtcbiAgICBsZXQgcHJvcFxuICAgIGxldCBoYXNQcm9wXG5cbiAgICBmb3IgKHByb3AgaW4gZnJvbSkge1xuICAgICAgaGFzUHJvcCA9IHRvW3Byb3BdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmIChoYXNQcm9wICYmIHR5cGVvZiBmcm9tW3Byb3BdID09PSAnb2JqZWN0JyAmJiBmcm9tW3Byb3BdICE9PSBudWxsICYmIGZyb21bcHJvcF0ubm9kZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXNEYXRlKGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBuZXcgRGF0ZShmcm9tW3Byb3BdLmdldFRpbWUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXS5zbGljZSgwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b1twcm9wXSA9IGV4dGVuZCh7fSwgZnJvbVtwcm9wXSwgb3ZlcndyaXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG92ZXJ3cml0ZSB8fCAhaGFzUHJvcCkge1xuICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvXG4gIH1cblxuICBjb25zdCBmaXJlRXZlbnQgPSAoZWwsIGV2ZW50TmFtZSwgZGF0YSkgPT4ge1xuICAgIGxldCBldlxuXG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJylcbiAgICAgIGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5maXJlRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgZXYpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBjYWxlbmRhciA9PiB7XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xuICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCArPSAxMlxuICAgIH1cbiAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xuICAgICAgY2FsZW5kYXIueWVhciArPSBNYXRoLmZsb29yKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggLT0gMTJcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG5cbiAgICAvLyBiaW5kIHRoZSBwaWNrZXIgdG8gYSBmb3JtIGZpZWxkXG4gICAgZmllbGQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cbiAgICAvLyB0aGUgdG9TdHJpbmcgZnVuY3Rpb24gd2hpY2ggZ2V0cyBwYXNzZWQgYSBjdXJyZW50IGRhdGUgb2JqZWN0IGFuZCBmb3JtYXRcbiAgICAvLyBhbmQgcmV0dXJucyBhIHN0cmluZ1xuICAgIHRvU3RyaW5nOiBudWxsLFxuXG4gICAgLy8gdXNlZCB0byBjcmVhdGUgZGF0ZSBvYmplY3QgZnJvbSBjdXJyZW50IGlucHV0IHN0cmluZ1xuICAgIHBhcnNlOiBudWxsLFxuXG4gICAgLy8gdGhlIGluaXRpYWwgZGF0ZSB0byB2aWV3IHdoZW4gZmlyc3Qgb3BlbmVkXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXG5cbiAgICAvLyBtYWtlIHRoZSBgZGVmYXVsdERhdGVgIHRoZSBpbml0aWFsIHNlbGVjdGVkIHZhbHVlXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxuXG4gICAgLy8gZmlyc3QgZGF5IG9mIHdlZWsgKDA6IFN1bmRheSwgMTogTW9uZGF5IGV0YylcbiAgICBmaXJzdERheTogMCxcblxuICAgIC8vIHRoZSBkZWZhdWx0IGZsYWcgZm9yIG1vbWVudCdzIHN0cmljdCBkYXRlIHBhcnNpbmdcbiAgICBmb3JtYXRTdHJpY3Q6IGZhbHNlLFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIFdlZWsgcGlja2VyIG1vZGVcbiAgICBwaWNrV2hvbGVXZWVrOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIEFsbG93cyB1c2VyIHRvIHNlbGVjdCBkYXlzIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBCbHVyIGZpZWxkIHdoZW4gZGF0ZSBpcyBzZWxlY3RlZFxuICAgIGJsdXJGaWVsZE9uU2VsZWN0OiB0cnVlLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldiBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBldmVudHMgYXJyYXlcbiAgICBldmVudHM6IFtdLFxuXG4gICAgcmFuZ2VTZWxlY3Q6IGZhbHNlLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNUb2RheSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5JylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkge1xuICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1N0YXJ0UmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zdGFydHJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcbiAgICB9XG4gICAgcmV0dXJuICc8dGQgZGF0YS1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCIgY2xhc3M9XCInICsgYXJyLmpvaW4oJyAnKSArICdcIiBhcmlhLXNlbGVjdGVkPVwiJyArIGFyaWFTZWxlY3RlZCArICdcIj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19idXR0b24gZGF0ZXBpY2tlcl9fZGF5XCIgdHlwZT1cImJ1dHRvblwiICcgK1xuICAgICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICsgb3B0cy55ZWFyICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgKyBvcHRzLm1vbnRoICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCI+JyArXG4gICAgICAgIG9wdHMuZGF5ICtcbiAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDApICsgb25lamFuLmdldERheSgpICsgMSkgLyA3KVxuICAgIHJldHVybiAnPHRkIGNsYXNzPVwiZGF0ZXBpY2tlcl9fd2Vla1wiPicgKyB3ZWVrTnVtICsgJzwvdGQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyUm93ID0gKGRheXMsIGlzUlRMLCBwaWNrV2hvbGVXZWVrLCBpc1Jvd1NlbGVjdGVkKSA9PiB7XG4gICAgcmV0dXJuICc8dHIgY2xhc3M9XCJkYXRlcGlja2VyX19yb3cnICsgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgKyAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICsgJ1wiPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IHJvd3MgPT4ge1xuICAgIHJldHVybiAnPHRib2R5PicgKyByb3dzLmpvaW4oJycpICsgJzwvdGJvZHk+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IG9wdHMgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGFyciA9IFtdXG4gICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgIGFyci5wdXNoKCc8dGg+PC90aD4nKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICBhcnIucHVzaCgnPHRoIHNjb3BlPVwiY29sXCI+PGFiYnIgdGl0bGU9XCInICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpKSArICdcIj4nICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpLCB0cnVlKSArICc8L2FiYnI+PC90aD4nKVxuICAgIH1cbiAgICByZXR1cm4gJzx0aGVhZD48dHI+JyArIChvcHRzLmlzUlRMID8gYXJyLnJldmVyc2UoKSA6IGFycikuam9pbignJykgKyAnPC90cj48L3RoZWFkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRpdGxlID0gKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRJZCArICdcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgcm9sZT1cImhlYWRpbmdcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj4nXG5cbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICsgJ1wiJyArXG4gICAgICAgICAgKGkgPT09IG1vbnRoID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICtcbiAgICAgICAgICAoKGlzTWluWWVhciAmJiBpIDwgb3B0cy5taW5Nb250aCkgfHwgKGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aCkgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSArICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArICc8L29wdGlvbj4nKVxuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoSHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gKyAnPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXJfX3NlbGVjdCBkYXRlcGlja2VyX19zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikge1xuICAgICAgICBhcnIucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiJyArIChpID09PSB5ZWFyID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICsgJz4nICsgKGkpICsgJzwvb3B0aW9uPicpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHllYXJIdG1sID0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgKyB5ZWFyICsgb3B0cy55ZWFyU3VmZml4ICsgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAob3B0cy5zaG93TW9udGhBZnRlclllYXIpIHtcbiAgICAgIGh0bWwgKz0geWVhckh0bWwgKyBtb250aEh0bWxcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSBtb250aEh0bWwgKyB5ZWFySHRtbFxuICAgIH1cblxuICAgIGlmIChpc01pblllYXIgJiYgKG1vbnRoID09PSAwIHx8IG9wdHMubWluTW9udGggPj0gbW9udGgpKSB7XG4gICAgICBwcmV2ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoaXNNYXhZZWFyICYmIChtb250aCA9PT0gMTEgfHwgb3B0cy5tYXhNb250aCA8PSBtb250aCkpIHtcbiAgICAgIG5leHQgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChjID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcHJldicgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLnByZXZpb3VzTW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cbiAgICBpZiAoYyA9PT0gKGluc3RhbmNlLl9vLm51bWJlck9mTW9udGhzIC0gMSkpIHtcbiAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19uZXh0JyArIChuZXh0ID8gJycgOiAnIGlzLWRpc2FibGVkJykgKyAnXCIgdHlwZT1cImJ1dHRvblwiPicgKyBvcHRzLmkxOG4ubmV4dE1vbnRoICsgJzwvYnV0dG9uPidcbiAgICB9XG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSAob3B0cywgZGF0YSwgcmFuZElkKSA9PiB7XG4gICAgcmV0dXJuICc8dGFibGUgY2VsbHBhZGRpbmc9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2xhc3M9XCJkYXRlcGlja2VyX190YWJsZVwiIHJvbGU9XCJncmlkXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArIHJhbmRJZCArICdcIj4nICsgcmVuZGVySGVhZChvcHRzKSArIHJlbmRlckJvZHkoZGF0YSkgKyAnPC90YWJsZT4nXG4gIH1cblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuICAgIGNvbnN0IGRlZk9wdHNNaW5EYXRlID0gb3B0cy5taW5EYXRlXG4gICAgc2VsZi5kYXRlUmFuZ2VBcnIgPSBbXVxuICAgIHNlbGYuZGF0ZVJhbmdlU2VsZWN0ZWRBcnIgPSBbXVxuXG4gICAgc2VsZi5fb25Nb3VzZURvd24gPSBlID0+IHtcbiAgICAgIGlmICghc2VsZi5fdikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAob3B0cy5yYW5nZVNlbGVjdCkgeyAvLyBzZWxlY3RhYmxlIGRhdGUgcmFuZ2Ugb24gc2luZ2xlIGNhbGVuZGFyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci15ZWFyJyksIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItZGF5JykpXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uLS1zZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRNaW5EYXRlKHNlbGVjdGVkRGF0ZSlcblxuICAgICAgICAgICAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLnB1c2goc2VsZWN0ZWREYXRlKVxuXG4gICAgICAgICAgICAgICAgLy8g6YG45oqe5Y+v6IO944Gv5LqM44Gk44G+44Gn44CC44Go44KK44GC44GI44GaXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZGF0ZVJhbmdlQXJyLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLmRhdGVSYW5nZUFyci5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNldERhdGUoZSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmRhdGVSYW5nZUFyci5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgc2VsZi5zZXRNaW5EYXRlKGRlZk9wdHNNaW5EYXRlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ibHVyRmllbGRPblNlbGVjdCAmJiBvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldERhdGUobmV3IERhdGUodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLW1vbnRoJyksIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKSkpXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ibHVyRmllbGRPblNlbGVjdCAmJiBvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gPHNlbGVjdD5cbiAgICBzZWxmLl9vbkNoYW5nZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC1tb250aCcpKSB7XG4gICAgICAgIHNlbGYuZ290b01vbnRoKHRhcmdldC52YWx1ZSlcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXInKSkge1xuICAgICAgICBzZWxmLmdvdG9ZZWFyKHRhcmdldC52YWx1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9vbktleUNoYW5nZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2VTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmFuZ2VTZWxlY3RhYmxlJylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdzdWJ0cmFjdCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENoYW5nZSA9IGUgPT4ge1xuICAgICAgbGV0IGRhdGVcblxuICAgICAgaWYgKGUuZmlyZWRCeSA9PT0gc2VsZikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLnBhcnNlKSB7XG4gICAgICAgIGRhdGUgPSBvcHRzLnBhcnNlKG9wdHMuZmllbGQudmFsdWUsIG9wdHMuZm9ybWF0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICB9XG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgfVxuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHNlbGYuc2hvdygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gKCkgPT4ge1xuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRCbHVyID0gKCkgPT4ge1xuICAgICAgbGV0IHBFbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHNlbGYuX2IgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uQ2xpY2sgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBsZXQgcEVsID0gdGFyZ2V0XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzZWxmLmVsLmNsYXNzTmFtZSA9ICdkYXRlcGlja2VyJyArIChvcHRzLmlzUlRMID8gJyBpcy1ydGwnIDogJycpICsgKG9wdHMudGhlbWUgPyAnICcgKyBvcHRzLnRoZW1lIDogJycpXG5cbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2Vkb3duJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmRGF0ZSA9IG9wdHMuZGVmYXVsdERhdGVcblxuICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkZWZEYXRlLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnY2xpY2snLCBzZWxmLl9vbklucHV0Q2xpY2spXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cbiAgUGxhaW5QaWNrZXIucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICogY29uZmlndXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKi9cbiAgICBjb25maWc6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAoIXRoaXMuX28pIHtcbiAgICAgICAgdGhpcy5fbyA9IGV4dGVuZCh7fSwgZGVmYXVsdHMsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdHMgPSBleHRlbmQodGhpcy5fbywgb3B0aW9ucywgdHJ1ZSlcblxuICAgICAgb3B0cy5pc1JUTCA9ICEhb3B0cy5pc1JUTFxuXG4gICAgICBvcHRzLmZpZWxkID0gKG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSkgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gKHR5cGVvZiBvcHRzLnRoZW1lKSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSAob3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSkgPyBvcHRzLnRyaWdnZXIgOiBvcHRzLmZpZWxkXG5cbiAgICAgIG9wdHMuZGlzYWJsZVdlZWtlbmRzID0gISFvcHRzLmRpc2FibGVXZWVrZW5kc1xuXG4gICAgICBvcHRzLmRpc2FibGVEYXlGbiA9ICh0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4pID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkge1xuICAgICAgICBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkge1xuICAgICAgICBvcHRzLm1heERhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKChvcHRzLm1pbkRhdGUgJiYgb3B0cy5tYXhEYXRlKSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0c1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBmb3JtYXR0ZWQgc3RyaW5nIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbiAodXNpbmcgTW9tZW50LmpzIGlmIGF2YWlsYWJsZSlcbiAgICAgKi9cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMuX28uZm9ybWF0XG4gICAgICBpZiAoIWlzRGF0ZSh0aGlzLl9kKSkge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9vLnRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vLnRvU3RyaW5nKHRoaXMuX2QsIGZvcm1hdClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzRGF0ZSh0aGlzLl9kKSA/IG5ldyBEYXRlKHRoaXMuX2QuZ2V0VGltZSgpKSA6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uIChkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG5cbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICBzZWxmLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHNlbGYuX28uZmllbGQsICdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBtaW4gPSBzZWxmLl9vLm1pbkRhdGVcbiAgICAgIGNvbnN0IG1heCA9IHNlbGYuX28ubWF4RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xuICAgICAgICBkYXRlID0gbWluXG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcbiAgICAgICAgZGF0ZSA9IG1heFxuICAgICAgfVxuXG4gICAgICBzZWxmLl9kID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoc2VsZi5fZClcbiAgICAgIHNlbGYuZ290b0RhdGUoc2VsZi5fZClcblxuICAgICAgaWYgKHNlbGYuX28uZmllbGQpIHtcbiAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9IHNlbGYudG9TdHJpbmcoKVxuICAgICAgICBmaXJlRXZlbnQoc2VsZi5fby5maWVsZCwgJ2NoYW5nZScsIHtcbiAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoIXByZXZlbnRPblNlbGVjdCAmJiB0eXBlb2Ygc2VsZi5fby5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzZWxmLl9vLm9uU2VsZWN0LmNhbGwoc2VsZiwgc2VsZi5nZXREYXRlKCkpXG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl9vLnJhbmdlU2VsZWN0KSB7XG4gICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSBzZWxmLmRhdGVSYW5nZUFyci5qb2luKCcgVE8gJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXG4gICAgICovXG4gICAgZ290b0RhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICBsZXQgbmV3Q2FsZW5kYXIgPSB0cnVlXG5cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jYWxlbmRhcnMpIHtcbiAgICAgICAgY29uc3QgZmlyc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzWzBdLnllYXIsIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCBsYXN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS5tb250aCwgMSlcbiAgICAgICAgY29uc3QgdmlzaWJsZURhdGUgPSBkYXRlLmdldFRpbWUoKVxuICAgICAgICAvLyBnZXQgdGhlIGVuZCBvZiB0aGUgbW9udGhcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldE1vbnRoKGxhc3RWaXNpYmxlRGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpXG4gICAgICAgIG5ld0NhbGVuZGFyID0gKHZpc2libGVEYXRlIDwgZmlyc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgfHwgbGFzdFZpc2libGVEYXRlLmdldFRpbWUoKSA8IHZpc2libGVEYXRlKVxuICAgICAgfVxuXG4gICAgICBpZiAobmV3Q2FsZW5kYXIpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnMgPSBbe1xuICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIH1dXG4gICAgICAgIGlmICh0aGlzLl9vLm1haW5DYWxlbmRhciA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICs9IDEgLSB0aGlzLl9vLm51bWJlck9mTW9udGhzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICBhZGp1c3REYXRlOiBmdW5jdGlvbiAoc2lnbiwgZGF5cykge1xuICAgICAgY29uc3QgZGF5ID0gdGhpcy5nZXREYXRlKCkgfHwgbmV3IERhdGUoKVxuICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IHBhcnNlSW50KGRheXMpICogMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgICBsZXQgbmV3RGF5XG5cbiAgICAgIGlmIChzaWduID09PSAnYWRkJykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpICsgZGlmZmVyZW5jZSlcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PT0gJ3N1YnRyYWN0Jykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpIC0gZGlmZmVyZW5jZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXREYXRlKG5ld0RheSlcbiAgICB9LFxuXG4gICAgYWRqdXN0Q2FsZW5kYXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgY1xuXG4gICAgICB0aGlzLmNhbGVuZGFyc1swXSA9IGFkanVzdENhbGVuZGFyKHRoaXMuY2FsZW5kYXJzWzBdKVxuICAgICAgZm9yIChjID0gMTsgYyA8IHRoaXMuX28ubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1tjXSA9IGFkanVzdENhbGVuZGFyKHtcbiAgICAgICAgICBtb250aDogdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKyBjLFxuICAgICAgICAgIHllYXI6IHRoaXMuY2FsZW5kYXJzWzBdLnllYXJcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIGdvdG9Ub2RheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIG1vbnRoICh6ZXJvLWluZGV4LCBlLmcuIDA6IEphbnVhcnkpXG4gICAgICovXG4gICAgZ290b01vbnRoOiBmdW5jdGlvbiAobW9udGgpIHtcbiAgICAgIGlmICghaXNOYU4obW9udGgpKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoID0gcGFyc2VJbnQobW9udGgsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIG5leHRNb250aDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgrK1xuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICBwcmV2TW9udGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS1cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBmdWxsIHllYXIgKGUuZy4gXCIyMDEyXCIpXG4gICAgICovXG4gICAgZ290b1llYXI6IGZ1bmN0aW9uICh5ZWFyKSB7XG4gICAgICBpZiAoIWlzTmFOKHllYXIpKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLnllYXIgPSBwYXJzZUludCh5ZWFyLCAxMClcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdGhlIG1pbkRhdGVcbiAgICAgKi9cbiAgICBzZXRNaW5EYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgc2V0VG9TdGFydE9mRGF5KHZhbHVlKVxuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSB2YWx1ZVxuICAgICAgICB0aGlzLl9vLm1pblllYXIgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuX28ubWluTW9udGggPSB2YWx1ZS5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkZWZhdWx0cy5taW5EYXRlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGRlZmF1bHRzLm1pblllYXJcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IGRlZmF1bHRzLm1pbk1vbnRoXG4gICAgICAgIHRoaXMuX28uc3RhcnRSYW5nZSA9IGRlZmF1bHRzLnN0YXJ0UmFuZ2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHRoZSBtYXhEYXRlXG4gICAgICovXG4gICAgc2V0TWF4RGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheSh2YWx1ZSlcbiAgICAgICAgdGhpcy5fby5tYXhEYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5fby5tYXhZZWFyID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gdmFsdWUuZ2V0TW9udGgoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fby5tYXhEYXRlID0gZGVmYXVsdHMubWF4RGF0ZVxuICAgICAgICB0aGlzLl9vLm1heFllYXIgPSBkZWZhdWx0cy5tYXhZZWFyXG4gICAgICAgIHRoaXMuX28ubWF4TW9udGggPSBkZWZhdWx0cy5tYXhNb250aFxuICAgICAgICB0aGlzLl9vLmVuZFJhbmdlID0gZGVmYXVsdHMuZW5kUmFuZ2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgc2V0U3RhcnRSYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLl9vLnN0YXJ0UmFuZ2UgPSB2YWx1ZVxuICAgIH0sXG5cbiAgICBzZXRFbmRSYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLl9vLmVuZFJhbmdlID0gdmFsdWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVmcmVzaCB0aGUgSFRNTFxuICAgICAqL1xuICAgIGRyYXc6IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgICAgaWYgKCF0aGlzLl92ICYmICFmb3JjZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IG1pblllYXIgPSBvcHRzLm1pblllYXJcbiAgICAgIGNvbnN0IG1heFllYXIgPSBvcHRzLm1heFllYXJcbiAgICAgIGNvbnN0IG1pbk1vbnRoID0gb3B0cy5taW5Nb250aFxuICAgICAgY29uc3QgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoXG4gICAgICBsZXQgaHRtbCA9ICcnXG4gICAgICBsZXQgcmFuZElkXG5cbiAgICAgIGlmICh0aGlzLl95IDw9IG1pblllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1pblllYXJcbiAgICAgICAgaWYgKCFpc05hTihtaW5Nb250aCkgJiYgdGhpcy5fbSA8IG1pbk1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1pbk1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl95ID49IG1heFllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1heFllYXJcbiAgICAgICAgaWYgKCFpc05hTihtYXhNb250aCkgJiYgdGhpcy5fbSA+IG1heE1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1heE1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmFuZElkID0gJ2RhdGVwaWNrZXJfX3RpdGxlLScgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKC9bXmEtel0rL2csICcnKS5zdWJzdHIoMCwgMilcblxuICAgICAgbGV0IGNcbiAgICAgIGZvciAoYyA9IDA7IGMgPCBvcHRzLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xlbmRhclwiPicgKyByZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArIHRoaXMucmVuZGVyKHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCByYW5kSWQpICsgJzwvZGl2PidcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGlmIChvcHRzLmZpZWxkLnR5cGUgIT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBvcHRzLnRyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIH0sIDEpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uRHJhdyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vLm9uRHJhdyh0aGlzKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICAvLyBsZXQgdGhlIHNjcmVlbiByZWFkZXIgdXNlciBrbm93IHRvIHVzZSBhcnJvdyBrZXlzXG4gICAgICAgIG9wdHMuZmllbGQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ1VzZSB0aGUgYXJyb3cga2V5cyB0byBwaWNrIGEgZGF0ZScpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGFkanVzdFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5fby5jb250YWluZXIpIHJldHVyblxuXG4gICAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuX28udHJpZ2dlclxuICAgICAgbGV0IHBFbCA9IGZpZWxkXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZWwub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0XG4gICAgICBjb25zdCB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gICAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICBjb25zdCBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgbGV0IGxlZnRcbiAgICAgIGxldCB0b3BcblxuICAgICAgaWYgKHR5cGVvZiBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3QgY2xpZW50UmVjdCA9IGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGxlZnQgPSBjbGllbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXRcbiAgICAgICAgdG9wID0gY2xpZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZnQgPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICB0b3AgPSBwRWwub2Zmc2V0VG9wICsgcEVsLm9mZnNldEhlaWdodFxuICAgICAgICB3aGlsZSAoKHBFbCA9IHBFbC5vZmZzZXRQYXJlbnQpKSB7XG4gICAgICAgICAgbGVmdCArPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICAgIHRvcCArPSBwRWwub2Zmc2V0VG9wXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyBib3R0b20gJiBsZWZ0XG4gICAgICBpZiAoKHRoaXMuX28ucmVwb3NpdGlvbiAmJiBsZWZ0ICsgd2lkdGggPiB2aWV3cG9ydFdpZHRoKSB8fCAoXG4gICAgICAgICAgdGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCdyaWdodCcpID4gLTEgJiZcbiAgICAgICAgICBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aCA+IDBcbiAgICAgICAgKSkge1xuICAgICAgICBsZWZ0ID0gbGVmdCAtIHdpZHRoICsgZmllbGQub2Zmc2V0V2lkdGhcbiAgICAgIH1cbiAgICAgIGlmICgodGhpcy5fby5yZXBvc2l0aW9uICYmIHRvcCArIGhlaWdodCA+IHZpZXdwb3J0SGVpZ2h0ICsgc2Nyb2xsVG9wKSB8fCAoXG4gICAgICAgICAgdGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCd0b3AnKSA+IC0xICYmXG4gICAgICAgICAgdG9wIC0gaGVpZ2h0IC0gZmllbGQub2Zmc2V0SGVpZ2h0ID4gMFxuICAgICAgICApKSB7XG4gICAgICAgIHRvcCA9IHRvcCAtIGhlaWdodCAtIGZpZWxkLm9mZnNldEhlaWdodFxuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLnN0eWxlLmxlZnQgPSBsZWZ0ICsgJ3B4J1xuICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSB0b3AgKyAncHgnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbmRlciBIVE1MIGZvciBhIHBhcnRpY3VsYXIgbW9udGhcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgcmFuZElkKSB7XG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgY29uc3QgZGF5cyA9IGdldERheXNJbk1vbnRoKHllYXIsIG1vbnRoKVxuICAgICAgbGV0IGJlZm9yZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICAgICAgbGV0IGRhdGEgPSBbXVxuICAgICAgbGV0IHJvdyA9IFtdXG5cbiAgICAgIHNldFRvU3RhcnRPZkRheShub3cpXG5cbiAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheVxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xuICAgICAgICAgIGJlZm9yZSArPSA3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJldmlvdXNNb250aCA9IG1vbnRoID09PSAwID8gMTEgOiBtb250aCAtIDFcbiAgICAgIGNvbnN0IG5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IDAgOiBtb250aCArIDFcbiAgICAgIGNvbnN0IHllYXJPZlByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IHllYXIgLSAxIDogeWVhclxuICAgICAgY29uc3QgeWVhck9mTmV4dE1vbnRoID0gbW9udGggPT09IDExID8geWVhciArIDEgOiB5ZWFyXG4gICAgICBjb25zdCBkYXlzSW5QcmV2aW91c01vbnRoID0gZ2V0RGF5c0luTW9udGgoeWVhck9mUHJldmlvdXNNb250aCwgcHJldmlvdXNNb250aClcbiAgICAgIGxldCBjZWxscyA9IGRheXMgKyBiZWZvcmVcbiAgICAgIGxldCBhZnRlciA9IGNlbGxzXG5cbiAgICAgIHdoaWxlIChhZnRlciA+IDcpIHtcbiAgICAgICAgYWZ0ZXIgLT0gN1xuICAgICAgfVxuXG4gICAgICBjZWxscyArPSA3IC0gYWZ0ZXJcbiAgICAgIGxldCBpc1dlZWtTZWxlY3RlZCA9IGZhbHNlXG4gICAgICBsZXQgaSwgclxuXG4gICAgICBmb3IgKGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEgKyAoaSAtIGJlZm9yZSkpXG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc0RhdGUodGhpcy5fZCkgPyBjb21wYXJlRGF0ZXMoZGF5LCB0aGlzLl9kKSA6IGZhbHNlXG4gICAgICAgIGNvbnN0IGlzVG9kYXkgPSBjb21wYXJlRGF0ZXMoZGF5LCBub3cpXG4gICAgICAgIGNvbnN0IGhhc0V2ZW50ID0gb3B0cy5ldmVudHMuaW5kZXhPZihkYXkudG9EYXRlU3RyaW5nKCkpICE9PSAtMVxuICAgICAgICBjb25zdCBpc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IChkYXlzICsgYmVmb3JlKVxuICAgICAgICBsZXQgZGF5TnVtYmVyID0gMSArIChpIC0gYmVmb3JlKVxuICAgICAgICBsZXQgbW9udGhOdW1iZXIgPSBtb250aFxuICAgICAgICBsZXQgeWVhck51bWJlciA9IHllYXJcbiAgICAgICAgY29uc3QgaXNTdGFydFJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLnN0YXJ0UmFuZ2UsIGRheSlcbiAgICAgICAgY29uc3QgaXNFbmRSYW5nZSA9IG9wdHMuZW5kUmFuZ2UgJiYgY29tcGFyZURhdGVzKG9wdHMuZW5kUmFuZ2UsIGRheSlcbiAgICAgICAgY29uc3QgaXNJblJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIG9wdHMuZW5kUmFuZ2UgJiYgb3B0cy5zdGFydFJhbmdlIDwgZGF5ICYmIGRheSA8IG9wdHMuZW5kUmFuZ2VcbiAgICAgICAgY29uc3QgaXNEaXNhYmxlZCA9IChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxuICAgICAgICAgIChvcHRzLm1heERhdGUgJiYgZGF5ID4gb3B0cy5tYXhEYXRlKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVXZWVrZW5kcyAmJiBpc1dlZWtlbmQoZGF5KSkgfHxcbiAgICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4oZGF5KSlcblxuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGlmIChpIDwgYmVmb3JlKSB7XG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlzSW5QcmV2aW91c01vbnRoICsgZGF5TnVtYmVyXG4gICAgICAgICAgICBtb250aE51bWJlciA9IHByZXZpb3VzTW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZQcmV2aW91c01vbnRoXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheU51bWJlciAtIGRheXNcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gbmV4dE1vbnRoXG4gICAgICAgICAgICB5ZWFyTnVtYmVyID0geWVhck9mTmV4dE1vbnRoXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF5Q29uZmlnID0ge1xuICAgICAgICAgIGRheTogZGF5TnVtYmVyLFxuICAgICAgICAgIG1vbnRoOiBtb250aE51bWJlcixcbiAgICAgICAgICB5ZWFyOiB5ZWFyTnVtYmVyLFxuICAgICAgICAgIGhhc0V2ZW50OiBoYXNFdmVudCxcbiAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXksXG4gICAgICAgICAgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCxcbiAgICAgICAgICBpc0VtcHR5OiBpc0VtcHR5LFxuICAgICAgICAgIGlzU3RhcnRSYW5nZTogaXNTdGFydFJhbmdlLFxuICAgICAgICAgIGlzRW5kUmFuZ2U6IGlzRW5kUmFuZ2UsXG4gICAgICAgICAgaXNJblJhbmdlOiBpc0luUmFuZ2UsXG4gICAgICAgICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5zaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzLFxuICAgICAgICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5lbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHNcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRzLnBpY2tXaG9sZVdlZWsgJiYgaXNTZWxlY3RlZCkge1xuICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgcm93LnB1c2gocmVuZGVyRGF5KGRheUNvbmZpZykpXG5cbiAgICAgICAgaWYgKCsrciA9PT0gNykge1xuICAgICAgICAgIGlmIChvcHRzLnNob3dXZWVrTnVtYmVyKSB7XG4gICAgICAgICAgICByb3cudW5zaGlmdChyZW5kZXJXZWVrKGkgLSBiZWZvcmUsIG1vbnRoLCB5ZWFyKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgZGF0YS5wdXNoKHJlbmRlclJvdyhyb3csIG9wdHMuaXNSVEwsIG9wdHMucGlja1dob2xlV2VlaywgaXNXZWVrU2VsZWN0ZWQpKVxuICAgICAgICAgIHJvdyA9IFtdXG4gICAgICAgICAgciA9IDBcbiAgICAgICAgICBpc1dlZWtTZWxlY3RlZCA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJUYWJsZShvcHRzLCBkYXRhLCByYW5kSWQpXG4gICAgfSxcblxuICAgIGlzVmlzaWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHRoaXMuX3YgPSB0cnVlXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICAgIHJlbW92ZUNsYXNzKHRoaXMuZWwsICdpcy1oaWRkZW4nKVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIGFkZEV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fby5vbk9wZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9vLm9uT3Blbi5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdiA9IHRoaXMuX3ZcbiAgICAgIGlmICh2ICE9PSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnc3RhdGljJyAvLyByZXNldFxuICAgICAgICB0aGlzLmVsLnN0eWxlLmxlZnQgPSAnYXV0bydcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSAnYXV0bydcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIHRoaXMuX3YgPSBmYWxzZVxuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB0aGlzLl9vLm9uQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9vLm9uQ2xvc2UuY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAndG91Y2hlbmQnLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB0aGlzLl9vbklucHV0Q2hhbmdlKVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2NsaWNrJywgdGhpcy5fb25JbnB1dENsaWNrKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2ZvY3VzJywgdGhpcy5fb25JbnB1dEZvY3VzKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2JsdXInLCB0aGlzLl9vbklucHV0Qmx1cilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZWwucGFyZW50Tm9kZSkge1xuICAgICAgICB0aGlzLmVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgd2luZG93LlBsYWluUGlja2VyID0gUGxhaW5QaWNrZXJcbn0pKClcbiJdLCJuYW1lcyI6WyJkb2N1bWVudCIsIndpbmRvdyIsImFkZEV2ZW50IiwiZWwiLCJlIiwiY2FsbGJhY2siLCJjYXB0dXJlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInRyaW0iLCJzdHIiLCJyZXBsYWNlIiwiaGFzQ2xhc3MiLCJjbiIsImNsYXNzTmFtZSIsImluZGV4T2YiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaXNBcnJheSIsInRlc3QiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJvYmoiLCJpc0RhdGUiLCJpc05hTiIsImdldFRpbWUiLCJpc1dlZWtlbmQiLCJkYXkiLCJkYXRlIiwiZ2V0RGF5IiwiaXNMZWFwWWVhciIsInllYXIiLCJnZXREYXlzSW5Nb250aCIsIm1vbnRoIiwic2V0VG9TdGFydE9mRGF5Iiwic2V0SG91cnMiLCJjb21wYXJlRGF0ZXMiLCJhIiwiYiIsImV4dGVuZCIsInRvIiwiZnJvbSIsIm92ZXJ3cml0ZSIsInByb3AiLCJoYXNQcm9wIiwidW5kZWZpbmVkIiwibm9kZU5hbWUiLCJEYXRlIiwic2xpY2UiLCJmaXJlRXZlbnQiLCJldmVudE5hbWUiLCJkYXRhIiwiZXYiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJjcmVhdGVFdmVudE9iamVjdCIsImFkanVzdENhbGVuZGFyIiwiY2FsZW5kYXIiLCJNYXRoIiwiY2VpbCIsImFicyIsImZsb29yIiwiZGVmYXVsdHMiLCJyZW5kZXJEYXlOYW1lIiwib3B0cyIsImFiYnIiLCJmaXJzdERheSIsImkxOG4iLCJ3ZWVrZGF5c1Nob3J0Iiwid2Vla2RheXMiLCJyZW5kZXJEYXkiLCJhcnIiLCJhcmlhU2VsZWN0ZWQiLCJpc0VtcHR5Iiwic2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsInB1c2giLCJlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMiLCJpc0Rpc2FibGVkIiwiaXNUb2RheSIsImlzU2VsZWN0ZWQiLCJoYXNFdmVudCIsImlzSW5SYW5nZSIsImlzU3RhcnRSYW5nZSIsImlzRW5kUmFuZ2UiLCJqb2luIiwicmVuZGVyV2VlayIsImQiLCJtIiwieSIsIm9uZWphbiIsIndlZWtOdW0iLCJyZW5kZXJSb3ciLCJkYXlzIiwiaXNSVEwiLCJwaWNrV2hvbGVXZWVrIiwiaXNSb3dTZWxlY3RlZCIsInJldmVyc2UiLCJyZW5kZXJCb2R5Iiwicm93cyIsInJlbmRlckhlYWQiLCJpIiwic2hvd1dlZWtOdW1iZXIiLCJyZW5kZXJUaXRsZSIsImluc3RhbmNlIiwiYyIsInJlZlllYXIiLCJyYW5kSWQiLCJqIiwiX28iLCJpc01pblllYXIiLCJtaW5ZZWFyIiwiaXNNYXhZZWFyIiwibWF4WWVhciIsImh0bWwiLCJwcmV2IiwibmV4dCIsIm1pbk1vbnRoIiwibWF4TW9udGgiLCJtb250aHMiLCJtb250aEh0bWwiLCJ5ZWFyUmFuZ2UiLCJ5ZWFySHRtbCIsInllYXJTdWZmaXgiLCJzaG93TW9udGhBZnRlclllYXIiLCJwcmV2aW91c01vbnRoIiwibnVtYmVyT2ZNb250aHMiLCJuZXh0TW9udGgiLCJyZW5kZXJUYWJsZSIsIlBsYWluUGlja2VyIiwib3B0aW9ucyIsInNlbGYiLCJjb25maWciLCJkZWZPcHRzTWluRGF0ZSIsIm1pbkRhdGUiLCJkYXRlUmFuZ2VBcnIiLCJkYXRlUmFuZ2VTZWxlY3RlZEFyciIsIl9vbk1vdXNlRG93biIsIl92IiwiZXZlbnQiLCJ0YXJnZXQiLCJzcmNFbGVtZW50IiwicGFyZW50Tm9kZSIsImJvdW5kIiwicmFuZ2VTZWxlY3QiLCJzZWxlY3RlZERhdGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRNaW5EYXRlIiwibGVuZ3RoIiwic2hpZnQiLCJmb3JFYWNoIiwic2V0RGF0ZSIsImhpZGUiLCJibHVyRmllbGRPblNlbGVjdCIsImZpZWxkIiwiYmx1ciIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbkNoYW5nZSIsImdvdG9Nb250aCIsInZhbHVlIiwiZ290b1llYXIiLCJfb25LZXlDaGFuZ2UiLCJpc1Zpc2libGUiLCJrZXlDb2RlIiwibG9nIiwiYWRqdXN0RGF0ZSIsIl9vbklucHV0Q2hhbmdlIiwiZmlyZWRCeSIsInBhcnNlIiwiZm9ybWF0Iiwic2hvdyIsIl9vbklucHV0Rm9jdXMiLCJfb25JbnB1dENsaWNrIiwiX29uSW5wdXRCbHVyIiwicEVsIiwiYWN0aXZlRWxlbWVudCIsIl9iIiwic2V0VGltZW91dCIsIl9vbkNsaWNrIiwidHJpZ2dlciIsImNyZWF0ZUVsZW1lbnQiLCJ0aGVtZSIsImNvbnRhaW5lciIsImFwcGVuZENoaWxkIiwiYm9keSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsImRpc2FibGVXZWVrZW5kcyIsImRpc2FibGVEYXlGbiIsIm5vbSIsInBhcnNlSW50IiwibWF4RGF0ZSIsInNldE1heERhdGUiLCJmYWxsYmFjayIsImdldEZ1bGxZZWFyIiwiX2QiLCJ0b0RhdGVTdHJpbmciLCJwcmV2ZW50T25TZWxlY3QiLCJkcmF3IiwibWluIiwibWF4Iiwib25TZWxlY3QiLCJnZXREYXRlIiwibmV3Q2FsZW5kYXIiLCJjYWxlbmRhcnMiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsImdldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwic2lnbiIsImRpZmZlcmVuY2UiLCJuZXdEYXkiLCJ2YWx1ZU9mIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiZm9yY2UiLCJfeSIsIl9tIiwicmFuZG9tIiwic3Vic3RyIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwidHlwZSIsImZvY3VzIiwib25EcmF3Iiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJwb3NpdGlvbiIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwibGVmdCIsInRvcCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJwYWdlWE9mZnNldCIsImJvdHRvbSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRQYXJlbnQiLCJyZXBvc2l0aW9uIiwibm93IiwiYmVmb3JlIiwicm93IiwieWVhck9mUHJldmlvdXNNb250aCIsInllYXJPZk5leHRNb250aCIsImRheXNJblByZXZpb3VzTW9udGgiLCJjZWxscyIsImFmdGVyIiwiaXNXZWVrU2VsZWN0ZWQiLCJyIiwiZXZlbnRzIiwiZGF5TnVtYmVyIiwibW9udGhOdW1iZXIiLCJ5ZWFyTnVtYmVyIiwiZGF5Q29uZmlnIiwidW5zaGlmdCIsImFkanVzdFBvc2l0aW9uIiwib25PcGVuIiwidiIsIm9uQ2xvc2UiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLENBQUMsWUFBWTs7OztNQUlMQSxXQUFXQyxPQUFPRCxRQUF4QjtNQUNNRSxXQUFXLFNBQVhBLFFBQVcsQ0FBQ0MsRUFBRCxFQUFLQyxDQUFMLEVBQVFDLFFBQVIsRUFBa0JDLE9BQWxCLEVBQThCO09BQzFDQyxnQkFBSCxDQUFvQkgsQ0FBcEIsRUFBdUJDLFFBQXZCLEVBQWlDLENBQUMsQ0FBQ0MsT0FBbkM7R0FERjs7TUFJTUUsY0FBYyxTQUFkQSxXQUFjLENBQUNMLEVBQUQsRUFBS0MsQ0FBTCxFQUFRQyxRQUFSLEVBQWtCQyxPQUFsQixFQUE4QjtPQUM3Q0csbUJBQUgsQ0FBdUJMLENBQXZCLEVBQTBCQyxRQUExQixFQUFvQyxDQUFDLENBQUNDLE9BQXRDO0dBREY7O01BSU1JLE9BQU8sU0FBUEEsSUFBTyxNQUFPO1dBQ1hDLElBQUlELElBQUosR0FBV0MsSUFBSUQsSUFBSixFQUFYLEdBQXdCQyxJQUFJQyxPQUFKLENBQVksWUFBWixFQUEwQixFQUExQixDQUEvQjtHQURGOztNQUlNQyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ1YsRUFBRCxFQUFLVyxFQUFMLEVBQVk7V0FDcEIsQ0FBQyxNQUFNWCxHQUFHWSxTQUFULEdBQXFCLEdBQXRCLEVBQTJCQyxPQUEzQixDQUFtQyxNQUFNRixFQUFOLEdBQVcsR0FBOUMsTUFBdUQsQ0FBQyxDQUEvRDtHQURGOztNQUlNRyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ2QsRUFBRCxFQUFLVyxFQUFMLEVBQVk7UUFDdkIsQ0FBQ0QsU0FBU1YsRUFBVCxFQUFhVyxFQUFiLENBQUwsRUFBdUI7U0FDbEJDLFNBQUgsR0FBZ0JaLEdBQUdZLFNBQUgsS0FBaUIsRUFBbEIsR0FBd0JELEVBQXhCLEdBQTZCWCxHQUFHWSxTQUFILEdBQWUsR0FBZixHQUFxQkQsRUFBakU7O0dBRko7O01BTU1JLGNBQWMsU0FBZEEsV0FBYyxDQUFDZixFQUFELEVBQUtXLEVBQUwsRUFBWTtPQUMzQkMsU0FBSCxHQUFlTCxLQUFLLENBQUMsTUFBTVAsR0FBR1ksU0FBVCxHQUFxQixHQUF0QixFQUEyQkgsT0FBM0IsQ0FBbUMsTUFBTUUsRUFBTixHQUFXLEdBQTlDLEVBQW1ELEdBQW5ELENBQUwsQ0FBZjtHQURGOztNQUlNSyxVQUFVLFNBQVZBLE9BQVUsTUFBTzttQkFDZCxDQUFVQyxJQUFWLENBQWVDLE9BQU9DLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCQyxJQUExQixDQUErQkMsR0FBL0IsQ0FBZjs7R0FEVDs7TUFJTUMsU0FBUyxTQUFUQSxNQUFTLE1BQU87a0JBQ2IsQ0FBU04sSUFBVCxDQUFjQyxPQUFPQyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQkMsSUFBMUIsQ0FBK0JDLEdBQS9CLENBQWQsS0FBc0QsQ0FBQ0UsTUFBTUYsSUFBSUcsT0FBSixFQUFOOztHQURoRTs7TUFJTUMsWUFBWSxTQUFaQSxTQUFZLE9BQVE7UUFDbEJDLE1BQU1DLEtBQUtDLE1BQUwsRUFBWjtXQUNPRixRQUFRLENBQVIsSUFBYUEsUUFBUSxDQUE1QjtHQUZGOztNQUtNRyxhQUFhLFNBQWJBLFVBQWEsT0FBUTtXQUNqQkMsT0FBTyxDQUFQLEtBQWEsQ0FBYixJQUFrQkEsT0FBTyxHQUFQLEtBQWUsQ0FBbEMsSUFBeUNBLE9BQU8sR0FBUCxLQUFlLENBQS9EO0dBREY7O01BSU1DLGlCQUFpQixTQUFqQkEsY0FBaUIsQ0FBQ0QsSUFBRCxFQUFPRSxLQUFQLEVBQWlCO1dBQy9CLENBQUMsRUFBRCxFQUFLSCxXQUFXQyxJQUFYLElBQW1CLEVBQW5CLEdBQXdCLEVBQTdCLEVBQWlDLEVBQWpDLEVBQXFDLEVBQXJDLEVBQXlDLEVBQXpDLEVBQTZDLEVBQTdDLEVBQWlELEVBQWpELEVBQXFELEVBQXJELEVBQXlELEVBQXpELEVBQTZELEVBQTdELEVBQWlFLEVBQWpFLEVBQXFFLEVBQXJFLEVBQXlFRSxLQUF6RSxDQUFQO0dBREY7O01BSU1DLGtCQUFrQixTQUFsQkEsZUFBa0IsT0FBUTtRQUMxQlgsT0FBT0ssSUFBUCxDQUFKLEVBQWtCQSxLQUFLTyxRQUFMLENBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixDQUF2QjtHQURwQjs7TUFJTUMsZUFBZSxTQUFmQSxZQUFlLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFVO1dBQ3RCRCxFQUFFWixPQUFGLE9BQWdCYSxFQUFFYixPQUFGLEVBQXZCO0dBREY7O01BSU1jLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxFQUFELEVBQUtDLElBQUwsRUFBV0MsU0FBWCxFQUF5QjtRQUNsQ0MsYUFBSjtRQUNJQyxnQkFBSjs7U0FFS0QsSUFBTCxJQUFhRixJQUFiLEVBQW1CO2dCQUNQRCxHQUFHRyxJQUFILE1BQWFFLFNBQXZCO1VBQ0lELFdBQVcsUUFBT0gsS0FBS0UsSUFBTCxDQUFQLE1BQXNCLFFBQWpDLElBQTZDRixLQUFLRSxJQUFMLE1BQWUsSUFBNUQsSUFBb0VGLEtBQUtFLElBQUwsRUFBV0csUUFBWCxLQUF3QkQsU0FBaEcsRUFBMkc7WUFDckd0QixPQUFPa0IsS0FBS0UsSUFBTCxDQUFQLENBQUosRUFBd0I7Y0FDbEJELFNBQUosRUFBZTtlQUNWQyxJQUFILElBQVcsSUFBSUksSUFBSixDQUFTTixLQUFLRSxJQUFMLEVBQVdsQixPQUFYLEVBQVQsQ0FBWDs7U0FGSixNQUlPLElBQUlULFFBQVF5QixLQUFLRSxJQUFMLENBQVIsQ0FBSixFQUF5QjtjQUMxQkQsU0FBSixFQUFlO2VBQ1ZDLElBQUgsSUFBV0YsS0FBS0UsSUFBTCxFQUFXSyxLQUFYLENBQWlCLENBQWpCLENBQVg7O1NBRkcsTUFJQTthQUNGTCxJQUFILElBQVdKLE9BQU8sRUFBUCxFQUFXRSxLQUFLRSxJQUFMLENBQVgsRUFBdUJELFNBQXZCLENBQVg7O09BVkosTUFZTyxJQUFJQSxhQUFhLENBQUNFLE9BQWxCLEVBQTJCO1dBQzdCRCxJQUFILElBQVdGLEtBQUtFLElBQUwsQ0FBWDs7O1dBR0dILEVBQVA7R0F0QkY7O01BeUJNUyxZQUFZLFNBQVpBLFNBQVksQ0FBQ2pELEVBQUQsRUFBS2tELFNBQUwsRUFBZ0JDLElBQWhCLEVBQXlCO1FBQ3JDQyxXQUFKOztRQUVJdkQsU0FBU3dELFdBQWIsRUFBMEI7V0FDbkJ4RCxTQUFTd0QsV0FBVCxDQUFxQixZQUFyQixDQUFMO1NBQ0dDLFNBQUgsQ0FBYUosU0FBYixFQUF3QixJQUF4QixFQUE4QixLQUE5QjtXQUNLWCxPQUFPYSxFQUFQLEVBQVdELElBQVgsQ0FBTDtTQUNHSSxhQUFILENBQWlCSCxFQUFqQjtLQUpGLE1BS08sSUFBSXZELFNBQVMyRCxpQkFBYixFQUFnQztXQUNoQzNELFNBQVMyRCxpQkFBVCxFQUFMO1dBQ0tqQixPQUFPYSxFQUFQLEVBQVdELElBQVgsQ0FBTDtTQUNHRixTQUFILENBQWEsT0FBT0MsU0FBcEIsRUFBK0JFLEVBQS9COztHQVhKOztNQWVNSyxpQkFBaUIsU0FBakJBLGNBQWlCLFdBQVk7UUFDN0JDLFNBQVN6QixLQUFULEdBQWlCLENBQXJCLEVBQXdCO2VBQ2JGLElBQVQsSUFBaUI0QixLQUFLQyxJQUFMLENBQVVELEtBQUtFLEdBQUwsQ0FBU0gsU0FBU3pCLEtBQWxCLElBQTJCLEVBQXJDLENBQWpCO2VBQ1NBLEtBQVQsSUFBa0IsRUFBbEI7O1FBRUV5QixTQUFTekIsS0FBVCxHQUFpQixFQUFyQixFQUF5QjtlQUNkRixJQUFULElBQWlCNEIsS0FBS0csS0FBTCxDQUFXSCxLQUFLRSxHQUFMLENBQVNILFNBQVN6QixLQUFsQixJQUEyQixFQUF0QyxDQUFqQjtlQUNTQSxLQUFULElBQWtCLEVBQWxCOztXQUVLeUIsUUFBUDtHQVRGOzs7OztNQWVNSyxXQUFXOzs7V0FHUixJQUhROzs7V0FNUmxCLFNBTlE7Ozs7Y0FVTCxhQVZLOzs7Z0JBYUgsSUFiRzs7O1lBZ0JQLFlBaEJPOzs7O2NBb0JMLElBcEJLOzs7V0F1QlIsSUF2QlE7OztpQkEwQkYsSUExQkU7OztvQkE2QkMsS0E3QkQ7OztjQWdDTCxDQWhDSzs7O2tCQW1DRCxLQW5DQzs7O2FBc0NOLElBdENNOzthQXdDTixJQXhDTTs7O2VBMkNKLEVBM0NJOzs7b0JBOENDLEtBOUNEOzs7bUJBaURBLEtBakRBOzs7YUFvRE4sQ0FwRE07YUFxRE4sSUFyRE07Y0FzRExBLFNBdERLO2NBdURMQSxTQXZESzs7Z0JBeURILElBekRHO2NBMERMLElBMURLOztXQTREUixLQTVEUTs7O2dCQStESCxFQS9ERzs7O3dCQWtFSyxLQWxFTDs7O3FDQXFFa0IsS0FyRWxCOzs7Z0RBd0U2QixLQXhFN0I7OztvQkEyRUMsQ0EzRUQ7Ozs7a0JBK0VELE1BL0VDOzs7ZUFrRkpBLFNBbEZJOzs7dUJBcUZJLElBckZKOzs7VUF3RlQ7cUJBQ1csWUFEWDtpQkFFTyxZQUZQO2NBR0ksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsSUFBOUMsRUFBb0QsSUFBcEQsRUFBMEQsSUFBMUQsQ0FISjtnQkFJTSxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFNBQXJCLEVBQWdDLFdBQWhDLEVBQTZDLFVBQTdDLEVBQXlELFFBQXpELEVBQW1FLFVBQW5FLENBSk47cUJBS1csQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsS0FBcEMsRUFBMkMsS0FBM0M7S0E3RkY7OztXQWlHUixJQWpHUTs7O1lBb0dQLEVBcEdPOztpQkFzR0YsS0F0R0U7OztjQXlHTCxJQXpHSztZQTBHUCxJQTFHTzthQTJHTixJQTNHTTtZQTRHUDs7Ozs7R0E1R1YsQ0FrSEEsSUFBTW1CLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0MsSUFBRCxFQUFPdEMsR0FBUCxFQUFZdUMsSUFBWixFQUFxQjtXQUNsQ0QsS0FBS0UsUUFBWjtXQUNPeEMsT0FBTyxDQUFkLEVBQWlCO2FBQ1IsQ0FBUDs7V0FFS3VDLE9BQU9ELEtBQUtHLElBQUwsQ0FBVUMsYUFBVixDQUF3QjFDLEdBQXhCLENBQVAsR0FBc0NzQyxLQUFLRyxJQUFMLENBQVVFLFFBQVYsQ0FBbUIzQyxHQUFuQixDQUE3QztHQUxGOztNQVFNNEMsWUFBWSxTQUFaQSxTQUFZLE9BQVE7UUFDcEJDLE1BQU0sRUFBVjtRQUNJQyxlQUFlLE9BQW5CO1FBQ0lSLEtBQUtTLE9BQVQsRUFBa0I7VUFDWlQsS0FBS1UsK0JBQVQsRUFBMEM7WUFDcENDLElBQUosQ0FBUywwQkFBVDs7WUFFSSxDQUFDWCxLQUFLWSwwQ0FBVixFQUFzRDtjQUNoREQsSUFBSixDQUFTLHVCQUFUOztPQUpKLE1BTU87ZUFDRSw0QkFBUDs7O1FBR0FYLEtBQUthLFVBQVQsRUFBcUI7VUFDZkYsSUFBSixDQUFTLGFBQVQ7O1FBRUVYLEtBQUtjLE9BQVQsRUFBa0I7VUFDWkgsSUFBSixDQUFTLFVBQVQ7O1FBRUVYLEtBQUtlLFVBQVQsRUFBcUI7VUFDZkosSUFBSixDQUFTLGFBQVQ7cUJBQ2UsTUFBZjs7UUFFRVgsS0FBS2dCLFFBQVQsRUFBbUI7VUFDYkwsSUFBSixDQUFTLFdBQVQ7O1FBRUVYLEtBQUtpQixTQUFULEVBQW9CO1VBQ2ROLElBQUosQ0FBUyxZQUFUOztRQUVFWCxLQUFLa0IsWUFBVCxFQUF1QjtVQUNqQlAsSUFBSixDQUFTLGVBQVQ7O1FBRUVYLEtBQUttQixVQUFULEVBQXFCO1VBQ2ZSLElBQUosQ0FBUyxhQUFUOztXQUVLLG1CQUFtQlgsS0FBS3RDLEdBQXhCLEdBQThCLFdBQTlCLEdBQTRDNkMsSUFBSWEsSUFBSixDQUFTLEdBQVQsQ0FBNUMsR0FBNEQsbUJBQTVELEdBQWtGWixZQUFsRixHQUFpRyxJQUFqRyxHQUNILG1FQURHLEdBRUgsd0JBRkcsR0FFd0JSLEtBQUtsQyxJQUY3QixHQUVvQywyQkFGcEMsR0FFa0VrQyxLQUFLaEMsS0FGdkUsR0FFK0UseUJBRi9FLEdBRTJHZ0MsS0FBS3RDLEdBRmhILEdBRXNILElBRnRILEdBR0hzQyxLQUFLdEMsR0FIRixHQUlILFdBSkcsR0FLSCxPQUxKO0dBcENGOztNQTRDTTJELGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT0MsQ0FBUCxFQUFhO1FBQ3hCQyxTQUFTLElBQUkzQyxJQUFKLENBQVMwQyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWYsQ0FBZjtRQUNNRSxVQUFVaEMsS0FBS0MsSUFBTCxDQUFVLENBQUUsQ0FBQyxJQUFJYixJQUFKLENBQVMwQyxDQUFULEVBQVlELENBQVosRUFBZUQsQ0FBZixJQUFvQkcsTUFBckIsSUFBK0IsUUFBaEMsR0FBNENBLE9BQU83RCxNQUFQLEVBQTVDLEdBQThELENBQS9ELElBQW9FLENBQTlFLENBQWhCO1dBQ08sa0NBQWtDOEQsT0FBbEMsR0FBNEMsT0FBbkQ7R0FIRjs7TUFNTUMsWUFBWSxTQUFaQSxTQUFZLENBQUNDLElBQUQsRUFBT0MsS0FBUCxFQUFjQyxhQUFkLEVBQTZCQyxhQUE3QixFQUErQztXQUN4RCxnQ0FBZ0NELGdCQUFnQixrQkFBaEIsR0FBcUMsRUFBckUsS0FBNEVDLGdCQUFnQixjQUFoQixHQUFpQyxFQUE3RyxJQUFtSCxJQUFuSCxHQUEwSCxDQUFDRixRQUFRRCxLQUFLSSxPQUFMLEVBQVIsR0FBeUJKLElBQTFCLEVBQWdDUixJQUFoQyxDQUFxQyxFQUFyQyxDQUExSCxHQUFxSyxPQUE1SztHQURGOztNQUlNYSxhQUFhLFNBQWJBLFVBQWEsT0FBUTtXQUNsQixZQUFZQyxLQUFLZCxJQUFMLENBQVUsRUFBVixDQUFaLEdBQTRCLFVBQW5DO0dBREY7O01BSU1lLGFBQWEsU0FBYkEsVUFBYSxPQUFRO1FBQ3JCQyxVQUFKO1FBQ0k3QixNQUFNLEVBQVY7UUFDSVAsS0FBS3FDLGNBQVQsRUFBeUI7VUFDbkIxQixJQUFKLENBQVMsV0FBVDs7U0FFR3lCLElBQUksQ0FBVCxFQUFZQSxJQUFJLENBQWhCLEVBQW1CQSxHQUFuQixFQUF3QjtVQUNsQnpCLElBQUosQ0FBUyxrQ0FBa0NaLGNBQWNDLElBQWQsRUFBb0JvQyxDQUFwQixDQUFsQyxHQUEyRCxJQUEzRCxHQUFrRXJDLGNBQWNDLElBQWQsRUFBb0JvQyxDQUFwQixFQUF1QixJQUF2QixDQUFsRSxHQUFpRyxjQUExRzs7V0FFSyxnQkFBZ0IsQ0FBQ3BDLEtBQUs2QixLQUFMLEdBQWF0QixJQUFJeUIsT0FBSixFQUFiLEdBQTZCekIsR0FBOUIsRUFBbUNhLElBQW5DLENBQXdDLEVBQXhDLENBQWhCLEdBQThELGVBQXJFO0dBVEY7O01BWU1rQixjQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsUUFBRCxFQUFXQyxDQUFYLEVBQWMxRSxJQUFkLEVBQW9CRSxLQUFwQixFQUEyQnlFLE9BQTNCLEVBQW9DQyxNQUFwQyxFQUErQztRQUM3RE4sVUFBSjtRQUNJTyxVQUFKO1FBQ0lwQyxZQUFKO1FBQ01QLE9BQU91QyxTQUFTSyxFQUF0QjtRQUNNQyxZQUFZL0UsU0FBU2tDLEtBQUs4QyxPQUFoQztRQUNNQyxZQUFZakYsU0FBU2tDLEtBQUtnRCxPQUFoQztRQUNJQyxPQUFPLGNBQWNQLE1BQWQsR0FBdUIsbUVBQWxDOztRQUVJUSxPQUFPLElBQVg7UUFDSUMsT0FBTyxJQUFYOztTQUVLNUMsTUFBTSxFQUFOLEVBQVU2QixJQUFJLENBQW5CLEVBQXNCQSxJQUFJLEVBQTFCLEVBQThCQSxHQUE5QixFQUFtQztVQUM3QnpCLElBQUosQ0FBUyxxQkFBcUI3QyxTQUFTMkUsT0FBVCxHQUFtQkwsSUFBSUksQ0FBdkIsR0FBMkIsS0FBS0osQ0FBTCxHQUFTSSxDQUF6RCxJQUE4RCxHQUE5RCxJQUNKSixNQUFNcEUsS0FBTixHQUFjLHNCQUFkLEdBQXVDLEVBRG5DLEtBRUg2RSxhQUFhVCxJQUFJcEMsS0FBS29ELFFBQXZCLElBQXFDTCxhQUFhWCxJQUFJcEMsS0FBS3FELFFBQTNELEdBQXVFLHFCQUF2RSxHQUErRixFQUYzRixJQUVpRyxHQUZqRyxHQUdMckQsS0FBS0csSUFBTCxDQUFVbUQsTUFBVixDQUFpQmxCLENBQWpCLENBSEssR0FHaUIsV0FIMUI7OztRQU1JbUIsWUFBWSxvQ0FBb0N2RCxLQUFLRyxJQUFMLENBQVVtRCxNQUFWLENBQWlCdEYsS0FBakIsQ0FBcEMsR0FBOEQsNEVBQTlELEdBQTZJdUMsSUFBSWEsSUFBSixDQUFTLEVBQVQsQ0FBN0ksR0FBNEosaUJBQTlLOztRQUVJckUsUUFBUWlELEtBQUt3RCxTQUFiLENBQUosRUFBNkI7VUFDdkJ4RCxLQUFLd0QsU0FBTCxDQUFlLENBQWYsQ0FBSjtVQUNJeEQsS0FBS3dELFNBQUwsQ0FBZSxDQUFmLElBQW9CLENBQXhCO0tBRkYsTUFHTztVQUNEMUYsT0FBT2tDLEtBQUt3RCxTQUFoQjtVQUNJLElBQUkxRixJQUFKLEdBQVdrQyxLQUFLd0QsU0FBcEI7OztTQUdHakQsTUFBTSxFQUFYLEVBQWU2QixJQUFJTyxDQUFKLElBQVNQLEtBQUtwQyxLQUFLZ0QsT0FBbEMsRUFBMkNaLEdBQTNDLEVBQWdEO1VBQzFDQSxLQUFLcEMsS0FBSzhDLE9BQWQsRUFBdUI7WUFDakJuQyxJQUFKLENBQVMsb0JBQW9CeUIsQ0FBcEIsR0FBd0IsR0FBeEIsSUFBK0JBLE1BQU10RSxJQUFOLEdBQWEsc0JBQWIsR0FBc0MsRUFBckUsSUFBMkUsR0FBM0UsR0FBa0ZzRSxDQUFsRixHQUF1RixXQUFoRzs7O1FBR0VxQixXQUFXLG9DQUFvQzNGLElBQXBDLEdBQTJDa0MsS0FBSzBELFVBQWhELEdBQTZELDJFQUE3RCxHQUEySW5ELElBQUlhLElBQUosQ0FBUyxFQUFULENBQTNJLEdBQTBKLGlCQUEzSzs7UUFFSXBCLEtBQUsyRCxrQkFBVCxFQUE2QjtjQUNuQkYsV0FBV0YsU0FBbkI7S0FERixNQUVPO2NBQ0dBLFlBQVlFLFFBQXBCOzs7UUFHRVosY0FBYzdFLFVBQVUsQ0FBVixJQUFlZ0MsS0FBS29ELFFBQUwsSUFBaUJwRixLQUE5QyxDQUFKLEVBQTBEO2FBQ2pELEtBQVA7OztRQUdFK0UsY0FBYy9FLFVBQVUsRUFBVixJQUFnQmdDLEtBQUtxRCxRQUFMLElBQWlCckYsS0FBL0MsQ0FBSixFQUEyRDthQUNsRCxLQUFQOzs7UUFHRXdFLE1BQU0sQ0FBVixFQUFhO2NBQ0gscUNBQXFDVSxPQUFPLEVBQVAsR0FBWSxjQUFqRCxJQUFtRSxrQkFBbkUsR0FBd0ZsRCxLQUFLRyxJQUFMLENBQVV5RCxhQUFsRyxHQUFrSCxXQUExSDs7UUFFRXBCLE1BQU9ELFNBQVNLLEVBQVQsQ0FBWWlCLGNBQVosR0FBNkIsQ0FBeEMsRUFBNEM7Y0FDbEMscUNBQXFDVixPQUFPLEVBQVAsR0FBWSxjQUFqRCxJQUFtRSxrQkFBbkUsR0FBd0ZuRCxLQUFLRyxJQUFMLENBQVUyRCxTQUFsRyxHQUE4RyxXQUF0SDs7O1lBR00sUUFBUjs7V0FFT2IsSUFBUDtHQTNERjs7TUE4RE1jLGNBQWMsU0FBZEEsV0FBYyxDQUFDL0QsSUFBRCxFQUFPZCxJQUFQLEVBQWF3RCxNQUFiLEVBQXdCO1dBQ25DLG1HQUFtR0EsTUFBbkcsR0FBNEcsSUFBNUcsR0FBbUhQLFdBQVduQyxJQUFYLENBQW5ILEdBQXNJaUMsV0FBVy9DLElBQVgsQ0FBdEksR0FBeUosVUFBaEs7R0FERjs7Ozs7TUFPTThFLGNBQWMsU0FBZEEsV0FBYyxDQUFVQyxPQUFWLEVBQW1CO1FBQy9CQyxPQUFPLElBQWI7UUFDTWxFLE9BQU9rRSxLQUFLQyxNQUFMLENBQVlGLE9BQVosQ0FBYjtRQUNNRyxpQkFBaUJwRSxLQUFLcUUsT0FBNUI7U0FDS0MsWUFBTCxHQUFvQixFQUFwQjtTQUNLQyxvQkFBTCxHQUE0QixFQUE1Qjs7U0FFS0MsWUFBTCxHQUFvQixhQUFLO1VBQ25CLENBQUNOLEtBQUtPLEVBQVYsRUFBYzs7O1VBR1Z6SSxLQUFLSCxPQUFPNkksS0FBaEI7VUFDTUMsU0FBUzNJLEVBQUUySSxNQUFGLElBQVkzSSxFQUFFNEksVUFBN0I7VUFDSSxDQUFDRCxNQUFMLEVBQWE7Ozs7VUFJVCxDQUFDbEksU0FBU2tJLE1BQVQsRUFBaUIsYUFBakIsQ0FBTCxFQUFzQztZQUNoQ2xJLFNBQVNrSSxNQUFULEVBQWlCLG9CQUFqQixLQUEwQyxDQUFDbEksU0FBU2tJLE1BQVQsRUFBaUIsVUFBakIsQ0FBM0MsSUFBMkUsQ0FBQ2xJLFNBQVNrSSxPQUFPRSxVQUFoQixFQUE0QixhQUE1QixDQUFoRixFQUE0SDtjQUN0SDdFLEtBQUs4RSxLQUFULEVBQWdCO3VCQUNILFlBQU07a0JBQ1g5RSxLQUFLK0UsV0FBVCxFQUFzQjs7b0JBQ2hCQyxlQUFlLElBQUlsRyxJQUFKLENBQVM2RixPQUFPTSxZQUFQLENBQW9CLHNCQUFwQixDQUFULEVBQXNETixPQUFPTSxZQUFQLENBQW9CLHVCQUFwQixDQUF0RCxFQUFvR04sT0FBT00sWUFBUCxDQUFvQixxQkFBcEIsQ0FBcEcsQ0FBbkI7eUJBQ1NOLE1BQVQsRUFBaUIsOEJBQWpCO3FCQUNLTyxVQUFMLENBQWdCRixZQUFoQjs7cUJBRUtWLFlBQUwsQ0FBa0IzRCxJQUFsQixDQUF1QnFFOzs7a0JBR3ZCLElBQUlkLEtBQUtJLFlBQUwsQ0FBa0JhLE1BQWxCLEdBQTJCLENBQS9CLEVBQWtDO3VCQUMzQmIsWUFBTCxDQUFrQmMsS0FBbEI7OztxQkFHR2QsWUFBTCxDQUFrQmUsT0FBbEIsQ0FBMEIsVUFBVXJKLENBQVYsRUFBYTt1QkFDaENzSixPQUFMLENBQWF0SixDQUFiO2lCQURGO29CQUdJa0ksS0FBS0ksWUFBTCxDQUFrQmEsTUFBbEIsR0FBMkIsQ0FBL0IsRUFBa0M7dUJBQzNCSSxJQUFMO3VCQUNLTCxVQUFMLENBQWdCZCxjQUFoQjs7b0JBRUVwRSxLQUFLd0YsaUJBQUwsSUFBMEJ4RixLQUFLeUYsS0FBbkMsRUFBMEM7dUJBQ25DQSxLQUFMLENBQVdDLElBQVg7O2VBcEJKLE1Bc0JPO3FCQUNBSixPQUFMLENBQWEsSUFBSXhHLElBQUosQ0FBUzZGLE9BQU9NLFlBQVAsQ0FBb0Isc0JBQXBCLENBQVQsRUFBc0ROLE9BQU9NLFlBQVAsQ0FBb0IsdUJBQXBCLENBQXRELEVBQW9HTixPQUFPTSxZQUFQLENBQW9CLHFCQUFwQixDQUFwRyxDQUFiO3FCQUNLTSxJQUFMO29CQUNJdkYsS0FBS3dGLGlCQUFMLElBQTBCeEYsS0FBS3lGLEtBQW5DLEVBQTBDO3VCQUNuQ0EsS0FBTCxDQUFXQyxJQUFYOzs7YUEzQk4sRUE4QkcsR0E5Qkg7O1NBRkosTUFrQ08sSUFBSWpKLFNBQVNrSSxNQUFULEVBQWlCLGtCQUFqQixDQUFKLEVBQTBDO2VBQzFDZ0IsU0FBTDtTQURLLE1BRUEsSUFBSWxKLFNBQVNrSSxNQUFULEVBQWlCLGtCQUFqQixDQUFKLEVBQTBDO2VBQzFDYixTQUFMOzs7VUFHQSxDQUFDckgsU0FBU2tJLE1BQVQsRUFBaUIsb0JBQWpCLENBQUwsRUFBNkM7WUFDdkMzSSxFQUFFNEosY0FBTixFQUFzQjtZQUNsQkEsY0FBRjtTQURGLE1BRU87WUFDSEMsV0FBRixHQUFnQixLQUFoQjtpQkFDTyxLQUFQOztPQUxKLE1BT087YUFDQUMsRUFBTCxHQUFVLElBQVY7O0tBM0RKOzs7U0FnRUtDLFNBQUwsR0FBaUIsYUFBSztVQUNoQi9KLEtBQUtILE9BQU82SSxLQUFoQjtVQUNNQyxTQUFTM0ksRUFBRTJJLE1BQUYsSUFBWTNJLEVBQUU0SSxVQUE3QjtVQUNJLENBQUNELE1BQUwsRUFBYTs7O1VBR1RsSSxTQUFTa0ksTUFBVCxFQUFpQiwwQkFBakIsQ0FBSixFQUFrRDthQUMzQ3FCLFNBQUwsQ0FBZXJCLE9BQU9zQixLQUF0QjtPQURGLE1BRU8sSUFBSXhKLFNBQVNrSSxNQUFULEVBQWlCLHlCQUFqQixDQUFKLEVBQWlEO2FBQ2pEdUIsUUFBTCxDQUFjdkIsT0FBT3NCLEtBQXJCOztLQVRKOztTQWFLRSxZQUFMLEdBQW9CLGFBQUs7VUFDbkJuSyxLQUFLSCxPQUFPNkksS0FBaEI7O1VBRUlSLEtBQUtrQyxTQUFMLEVBQUosRUFBc0I7Z0JBQ1pwSyxFQUFFcUssT0FBVjtlQUNPLEVBQUw7ZUFDSyxFQUFMO2dCQUNNckcsS0FBS3lGLEtBQVQsRUFBZ0I7a0JBQ1Z6RixLQUFLK0UsV0FBVCxFQUFzQjt3QkFDWnVCLEdBQVIsQ0FBWSxpQkFBWjtlQURGLE1BRU87cUJBQ0FiLEtBQUwsQ0FBV0MsSUFBWDs7OztlQUlELEVBQUw7Y0FDSUUsY0FBRjtpQkFDS1csVUFBTCxDQUFnQixVQUFoQixFQUE0QixDQUE1Qjs7ZUFFRyxFQUFMO2lCQUNPQSxVQUFMLENBQWdCLFVBQWhCLEVBQTRCLENBQTVCOztlQUVHLEVBQUw7aUJBQ09BLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsQ0FBdkI7O2VBRUcsRUFBTDtpQkFDT0EsVUFBTCxDQUFnQixLQUFoQixFQUF1QixDQUF2Qjs7OztLQTFCUjs7U0FnQ0tDLGNBQUwsR0FBc0IsYUFBSztVQUNyQjdJLGFBQUo7O1VBRUkzQixFQUFFeUssT0FBRixLQUFjdkMsSUFBbEIsRUFBd0I7OztVQUdwQmxFLEtBQUswRyxLQUFULEVBQWdCO2VBQ1AxRyxLQUFLMEcsS0FBTCxDQUFXMUcsS0FBS3lGLEtBQUwsQ0FBV1EsS0FBdEIsRUFBNkJqRyxLQUFLMkcsTUFBbEMsQ0FBUDtPQURGLE1BRU87ZUFDRSxJQUFJN0gsSUFBSixDQUFTQSxLQUFLNEgsS0FBTCxDQUFXMUcsS0FBS3lGLEtBQUwsQ0FBV1EsS0FBdEIsQ0FBVCxDQUFQOztVQUVFM0ksT0FBT0ssSUFBUCxDQUFKLEVBQWtCO2FBQ1gySCxPQUFMLENBQWEzSCxJQUFiOztVQUVFLENBQUN1RyxLQUFLTyxFQUFWLEVBQWM7YUFDUG1DLElBQUw7O0tBZko7O1NBbUJLQyxhQUFMLEdBQXFCLFlBQU07V0FDcEJELElBQUw7S0FERjs7U0FJS0UsYUFBTCxHQUFxQixZQUFNO1dBQ3BCRixJQUFMO0tBREY7O1NBSUtHLFlBQUwsR0FBb0IsWUFBTTtVQUNwQkMsTUFBTXBMLFNBQVNxTCxhQUFuQjtTQUNHO1lBQ0d4SyxTQUFTdUssR0FBVCxFQUFjLFlBQWQsQ0FBSixFQUFpQzs7O09BRG5DLFFBS1FBLE1BQU1BLElBQUluQyxVQUxsQjs7VUFPSSxDQUFDWCxLQUFLNEIsRUFBVixFQUFjO2FBQ1BvQixFQUFMLEdBQVVDLFdBQVcsWUFBTTtlQUNwQjVCLElBQUw7U0FEUSxFQUVQLEVBRk8sQ0FBVjs7V0FJR08sRUFBTCxHQUFVLEtBQVY7S0FkRjs7U0FpQktzQixRQUFMLEdBQWdCLGFBQUs7VUFDZnBMLEtBQUtILE9BQU82SSxLQUFoQjtVQUNNQyxTQUFTM0ksRUFBRTJJLE1BQUYsSUFBWTNJLEVBQUU0SSxVQUE3QjtVQUNJb0MsTUFBTXJDLE1BQVY7O1VBRUksQ0FBQ0EsTUFBTCxFQUFhOzs7U0FHVjtZQUNHbEksU0FBU3VLLEdBQVQsRUFBYyxZQUFkLEtBQStCQSxRQUFRaEgsS0FBS3FILE9BQWhELEVBQXlEOzs7T0FEM0QsUUFLUUwsTUFBTUEsSUFBSW5DLFVBTGxCO1VBTUlYLEtBQUtPLEVBQUwsSUFBV0UsV0FBVzNFLEtBQUtxSCxPQUEzQixJQUFzQ0wsUUFBUWhILEtBQUtxSCxPQUF2RCxFQUFnRTthQUN6RDlCLElBQUw7O0tBZko7O1NBbUJLeEosRUFBTCxHQUFVSCxTQUFTMEwsYUFBVCxDQUF1QixLQUF2QixDQUFWO1NBQ0t2TCxFQUFMLENBQVFZLFNBQVIsR0FBb0IsZ0JBQWdCcUQsS0FBSzZCLEtBQUwsR0FBYSxTQUFiLEdBQXlCLEVBQXpDLEtBQWdEN0IsS0FBS3VILEtBQUwsR0FBYSxNQUFNdkgsS0FBS3VILEtBQXhCLEdBQWdDLEVBQWhGLENBQXBCOzthQUVTckQsS0FBS25JLEVBQWQsRUFBa0IsV0FBbEIsRUFBK0JtSSxLQUFLTSxZQUFwQyxFQUFrRCxJQUFsRDthQUNTTixLQUFLbkksRUFBZCxFQUFrQixVQUFsQixFQUE4Qm1JLEtBQUtNLFlBQW5DLEVBQWlELElBQWpEO2FBQ1NOLEtBQUtuSSxFQUFkLEVBQWtCLFFBQWxCLEVBQTRCbUksS0FBSzZCLFNBQWpDO2FBQ1NuSyxRQUFULEVBQW1CLFNBQW5CLEVBQThCc0ksS0FBS2lDLFlBQW5DOztRQUVJbkcsS0FBS3lGLEtBQVQsRUFBZ0I7VUFDVnpGLEtBQUt3SCxTQUFULEVBQW9CO2FBQ2JBLFNBQUwsQ0FBZUMsV0FBZixDQUEyQnZELEtBQUtuSSxFQUFoQztPQURGLE1BRU8sSUFBSWlFLEtBQUs4RSxLQUFULEVBQWdCO2lCQUNaNEMsSUFBVCxDQUFjRCxXQUFkLENBQTBCdkQsS0FBS25JLEVBQS9CO09BREssTUFFQTthQUNBMEosS0FBTCxDQUFXWixVQUFYLENBQXNCOEMsWUFBdEIsQ0FBbUN6RCxLQUFLbkksRUFBeEMsRUFBNENpRSxLQUFLeUYsS0FBTCxDQUFXbUMsV0FBdkQ7O2VBRU81SCxLQUFLeUYsS0FBZCxFQUFxQixRQUFyQixFQUErQnZCLEtBQUtzQyxjQUFwQzs7VUFFSSxDQUFDeEcsS0FBSzZILFdBQVYsRUFBdUI7YUFDaEJBLFdBQUwsR0FBbUIsSUFBSS9JLElBQUosQ0FBU0EsS0FBSzRILEtBQUwsQ0FBVzFHLEtBQUt5RixLQUFMLENBQVdRLEtBQXRCLENBQVQsQ0FBbkI7YUFDSzZCLGNBQUwsR0FBc0IsSUFBdEI7Ozs7UUFJRUMsVUFBVS9ILEtBQUs2SCxXQUFyQjs7UUFFSXZLLE9BQU95SyxPQUFQLENBQUosRUFBcUI7VUFDZi9ILEtBQUs4SCxjQUFULEVBQXlCO2FBQ2xCeEMsT0FBTCxDQUFheUMsT0FBYixFQUFzQixJQUF0QjtPQURGLE1BRU87YUFDQUMsUUFBTCxDQUFjRCxPQUFkOztLQUpKLE1BTU87V0FDQUMsUUFBTCxDQUFjLElBQUlsSixJQUFKLEVBQWQ7OztRQUdFa0IsS0FBSzhFLEtBQVQsRUFBZ0I7V0FDVFMsSUFBTDtXQUNLeEosRUFBTCxDQUFRWSxTQUFSLElBQXFCLFdBQXJCO2VBQ1NxRCxLQUFLcUgsT0FBZCxFQUF1QixPQUF2QixFQUFnQ25ELEtBQUs0QyxhQUFyQztlQUNTOUcsS0FBS3FILE9BQWQsRUFBdUIsT0FBdkIsRUFBZ0NuRCxLQUFLMkMsYUFBckM7ZUFDUzdHLEtBQUtxSCxPQUFkLEVBQXVCLE1BQXZCLEVBQStCbkQsS0FBSzZDLFlBQXBDO0tBTEYsTUFNTztXQUNBSCxJQUFMOztHQTlOSjs7Ozs7Y0FxT1kxSixTQUFaLEdBQXdCOzs7OztZQUtkLGdCQUFVK0csT0FBVixFQUFtQjtVQUNyQixDQUFDLEtBQUtyQixFQUFWLEVBQWM7YUFDUEEsRUFBTCxHQUFVdEUsT0FBTyxFQUFQLEVBQVd3QixRQUFYLEVBQXFCLElBQXJCLENBQVY7OztVQUdJRSxPQUFPMUIsT0FBTyxLQUFLc0UsRUFBWixFQUFnQnFCLE9BQWhCLEVBQXlCLElBQXpCLENBQWI7O1dBRUtwQyxLQUFMLEdBQWEsQ0FBQyxDQUFDN0IsS0FBSzZCLEtBQXBCOztXQUVLNEQsS0FBTCxHQUFjekYsS0FBS3lGLEtBQUwsSUFBY3pGLEtBQUt5RixLQUFMLENBQVc1RyxRQUExQixHQUFzQ21CLEtBQUt5RixLQUEzQyxHQUFtRCxJQUFoRTs7V0FFSzhCLEtBQUwsR0FBYyxPQUFPdkgsS0FBS3VILEtBQWIsS0FBd0IsUUFBeEIsSUFBb0N2SCxLQUFLdUgsS0FBekMsR0FBaUR2SCxLQUFLdUgsS0FBdEQsR0FBOEQsSUFBM0U7O1dBRUt6QyxLQUFMLEdBQWEsQ0FBQyxFQUFFOUUsS0FBSzhFLEtBQUwsS0FBZWxHLFNBQWYsR0FBMkJvQixLQUFLeUYsS0FBTCxJQUFjekYsS0FBSzhFLEtBQTlDLEdBQXNEOUUsS0FBS3lGLEtBQTdELENBQWQ7O1dBRUs0QixPQUFMLEdBQWdCckgsS0FBS3FILE9BQUwsSUFBZ0JySCxLQUFLcUgsT0FBTCxDQUFheEksUUFBOUIsR0FBMENtQixLQUFLcUgsT0FBL0MsR0FBeURySCxLQUFLeUYsS0FBN0U7O1dBRUt3QyxlQUFMLEdBQXVCLENBQUMsQ0FBQ2pJLEtBQUtpSSxlQUE5Qjs7V0FFS0MsWUFBTCxHQUFxQixPQUFPbEksS0FBS2tJLFlBQWIsS0FBK0IsVUFBL0IsR0FBNENsSSxLQUFLa0ksWUFBakQsR0FBZ0UsSUFBcEY7O1VBRU1DLE1BQU1DLFNBQVNwSSxLQUFLNkQsY0FBZCxFQUE4QixFQUE5QixLQUFxQyxDQUFqRDtXQUNLQSxjQUFMLEdBQXNCc0UsTUFBTSxDQUFOLEdBQVUsQ0FBVixHQUFjQSxHQUFwQzs7VUFFSSxDQUFDN0ssT0FBTzBDLEtBQUtxRSxPQUFaLENBQUwsRUFBMkI7YUFDcEJBLE9BQUwsR0FBZSxLQUFmOztVQUVFLENBQUMvRyxPQUFPMEMsS0FBS3FJLE9BQVosQ0FBTCxFQUEyQjthQUNwQkEsT0FBTCxHQUFlLEtBQWY7O1VBRUdySSxLQUFLcUUsT0FBTCxJQUFnQnJFLEtBQUtxSSxPQUF0QixJQUFrQ3JJLEtBQUtxSSxPQUFMLEdBQWVySSxLQUFLcUUsT0FBMUQsRUFBbUU7YUFDNURnRSxPQUFMLEdBQWVySSxLQUFLcUUsT0FBTCxHQUFlLEtBQTlCOztVQUVFckUsS0FBS3FFLE9BQVQsRUFBa0I7YUFDWGEsVUFBTCxDQUFnQmxGLEtBQUtxRSxPQUFyQjs7VUFFRXJFLEtBQUtxSSxPQUFULEVBQWtCO2FBQ1hDLFVBQUwsQ0FBZ0J0SSxLQUFLcUksT0FBckI7OztVQUdFdEwsUUFBUWlELEtBQUt3RCxTQUFiLENBQUosRUFBNkI7WUFDckIrRSxXQUFXLElBQUl6SixJQUFKLEdBQVcwSixXQUFYLEtBQTJCLEVBQTVDO2FBQ0toRixTQUFMLENBQWUsQ0FBZixJQUFvQjRFLFNBQVNwSSxLQUFLd0QsU0FBTCxDQUFlLENBQWYsQ0FBVCxFQUE0QixFQUE1QixLQUFtQytFLFFBQXZEO2FBQ0svRSxTQUFMLENBQWUsQ0FBZixJQUFvQjRFLFNBQVNwSSxLQUFLd0QsU0FBTCxDQUFlLENBQWYsQ0FBVCxFQUE0QixFQUE1QixLQUFtQytFLFFBQXZEO09BSEYsTUFJTzthQUNBL0UsU0FBTCxHQUFpQjlELEtBQUtFLEdBQUwsQ0FBU3dJLFNBQVNwSSxLQUFLd0QsU0FBZCxFQUF5QixFQUF6QixDQUFULEtBQTBDMUQsU0FBUzBELFNBQXBFO1lBQ0l4RCxLQUFLd0QsU0FBTCxHQUFpQixHQUFyQixFQUEwQjtlQUNuQkEsU0FBTCxHQUFpQixHQUFqQjs7OzthQUlHeEQsSUFBUDtLQXhEb0I7Ozs7O2NBOERaLGtCQUFVMkcsTUFBVixFQUFrQjtlQUNqQkEsVUFBVSxLQUFLL0QsRUFBTCxDQUFRK0QsTUFBM0I7VUFDSSxDQUFDckosT0FBTyxLQUFLbUwsRUFBWixDQUFMLEVBQXNCO2VBQ2IsRUFBUDs7VUFFRSxLQUFLN0YsRUFBTCxDQUFRekYsUUFBWixFQUFzQjtlQUNiLEtBQUt5RixFQUFMLENBQVF6RixRQUFSLENBQWlCLEtBQUtzTCxFQUF0QixFQUEwQjlCLE1BQTFCLENBQVA7OzthQUdLLEtBQUs4QixFQUFMLENBQVFDLFlBQVIsRUFBUDtLQXZFb0I7Ozs7O2FBNkViLG1CQUFZO2FBQ1pwTCxPQUFPLEtBQUttTCxFQUFaLElBQWtCLElBQUkzSixJQUFKLENBQVMsS0FBSzJKLEVBQUwsQ0FBUWpMLE9BQVIsRUFBVCxDQUFsQixHQUFnRCxJQUF2RDtLQTlFb0I7Ozs7O2FBb0ZiLGlCQUFVRyxJQUFWLEVBQWdCZ0wsZUFBaEIsRUFBaUM7VUFDbEN6RSxPQUFPLElBQWI7O1VBRUksQ0FBQ3ZHLElBQUwsRUFBVzthQUNKOEssRUFBTCxHQUFVLElBQVY7O1lBRUksS0FBSzdGLEVBQUwsQ0FBUTZDLEtBQVosRUFBbUI7ZUFDWjdDLEVBQUwsQ0FBUTZDLEtBQVIsQ0FBY1EsS0FBZCxHQUFzQixFQUF0QjtvQkFDVS9CLEtBQUt0QixFQUFMLENBQVE2QyxLQUFsQixFQUF5QixRQUF6QixFQUFtQztxQkFDeEJ2QjtXQURYOzs7ZUFLS0EsS0FBSzBFLElBQUwsRUFBUDs7VUFFRSxPQUFPakwsSUFBUCxLQUFnQixRQUFwQixFQUE4QjtlQUNyQixJQUFJbUIsSUFBSixDQUFTQSxLQUFLNEgsS0FBTCxDQUFXL0ksSUFBWCxDQUFULENBQVA7O1VBRUUsQ0FBQ0wsT0FBT0ssSUFBUCxDQUFMLEVBQW1COzs7O1VBSWJrTCxNQUFNM0UsS0FBS3RCLEVBQUwsQ0FBUXlCLE9BQXBCO1VBQ015RSxNQUFNNUUsS0FBS3RCLEVBQUwsQ0FBUXlGLE9BQXBCOztVQUVJL0ssT0FBT3VMLEdBQVAsS0FBZWxMLE9BQU9rTCxHQUExQixFQUErQjtlQUN0QkEsR0FBUDtPQURGLE1BRU8sSUFBSXZMLE9BQU93TCxHQUFQLEtBQWVuTCxPQUFPbUwsR0FBMUIsRUFBK0I7ZUFDN0JBLEdBQVA7OztXQUdHTCxFQUFMLEdBQVUsSUFBSTNKLElBQUosQ0FBU25CLEtBQUtILE9BQUwsRUFBVCxDQUFWO3NCQUNnQjBHLEtBQUt1RSxFQUFyQjtXQUNLVCxRQUFMLENBQWM5RCxLQUFLdUUsRUFBbkI7O1VBRUl2RSxLQUFLdEIsRUFBTCxDQUFRNkMsS0FBWixFQUFtQjthQUNaN0MsRUFBTCxDQUFRNkMsS0FBUixDQUFjUSxLQUFkLEdBQXNCL0IsS0FBSy9HLFFBQUwsRUFBdEI7a0JBQ1UrRyxLQUFLdEIsRUFBTCxDQUFRNkMsS0FBbEIsRUFBeUIsUUFBekIsRUFBbUM7bUJBQ3hCdkI7U0FEWDs7VUFJRSxDQUFDeUUsZUFBRCxJQUFvQixPQUFPekUsS0FBS3RCLEVBQUwsQ0FBUW1HLFFBQWYsS0FBNEIsVUFBcEQsRUFBZ0U7YUFDekRuRyxFQUFMLENBQVFtRyxRQUFSLENBQWlCM0wsSUFBakIsQ0FBc0I4RyxJQUF0QixFQUE0QkEsS0FBSzhFLE9BQUwsRUFBNUI7OztVQUdFOUUsS0FBS3RCLEVBQUwsQ0FBUW1DLFdBQVosRUFBeUI7YUFDbEJuQyxFQUFMLENBQVE2QyxLQUFSLENBQWNRLEtBQWQsR0FBc0IvQixLQUFLSSxZQUFMLENBQWtCbEQsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBdEI7O0tBbElrQjs7Ozs7Y0F5SVosa0JBQVV6RCxJQUFWLEVBQWdCO1VBQ3BCc0wsY0FBYyxJQUFsQjs7VUFFSSxDQUFDM0wsT0FBT0ssSUFBUCxDQUFMLEVBQW1COzs7O1VBSWYsS0FBS3VMLFNBQVQsRUFBb0I7WUFDWkMsbUJBQW1CLElBQUlySyxJQUFKLENBQVMsS0FBS29LLFNBQUwsQ0FBZSxDQUFmLEVBQWtCcEwsSUFBM0IsRUFBaUMsS0FBS29MLFNBQUwsQ0FBZSxDQUFmLEVBQWtCbEwsS0FBbkQsRUFBMEQsQ0FBMUQsQ0FBekI7WUFDTW9MLGtCQUFrQixJQUFJdEssSUFBSixDQUFTLEtBQUtvSyxTQUFMLENBQWUsS0FBS0EsU0FBTCxDQUFlL0QsTUFBZixHQUF3QixDQUF2QyxFQUEwQ3JILElBQW5ELEVBQXlELEtBQUtvTCxTQUFMLENBQWUsS0FBS0EsU0FBTCxDQUFlL0QsTUFBZixHQUF3QixDQUF2QyxFQUEwQ25ILEtBQW5HLEVBQTBHLENBQTFHLENBQXhCO1lBQ01xTCxjQUFjMUwsS0FBS0g7O1VBQXpCLENBRUE0TCxnQkFBZ0JFLFFBQWhCLENBQXlCRixnQkFBZ0JHLFFBQWhCLEtBQTZCLENBQXREO3dCQUNnQmpFLE9BQWhCLENBQXdCOEQsZ0JBQWdCSixPQUFoQixLQUE0QixDQUFwRDtzQkFDZUssY0FBY0YsaUJBQWlCM0wsT0FBakIsRUFBZCxJQUE0QzRMLGdCQUFnQjVMLE9BQWhCLEtBQTRCNkwsV0FBdkY7OztVQUdFSixXQUFKLEVBQWlCO2FBQ1ZDLFNBQUwsR0FBaUIsQ0FBQztpQkFDVHZMLEtBQUs0TCxRQUFMLEVBRFM7Z0JBRVY1TCxLQUFLNkssV0FBTDtTQUZTLENBQWpCO1lBSUksS0FBSzVGLEVBQUwsQ0FBUTRHLFlBQVIsS0FBeUIsT0FBN0IsRUFBc0M7ZUFDL0JOLFNBQUwsQ0FBZSxDQUFmLEVBQWtCbEwsS0FBbEIsSUFBMkIsSUFBSSxLQUFLNEUsRUFBTCxDQUFRaUIsY0FBdkM7Ozs7V0FJQzRGLGVBQUw7S0FwS29COztnQkF1S1Ysb0JBQVVDLElBQVYsRUFBZ0I5SCxJQUFoQixFQUFzQjtVQUMxQmxFLE1BQU0sS0FBS3NMLE9BQUwsTUFBa0IsSUFBSWxLLElBQUosRUFBOUI7VUFDTTZLLGFBQWF2QixTQUFTeEcsSUFBVCxJQUFpQixFQUFqQixHQUFzQixFQUF0QixHQUEyQixFQUEzQixHQUFnQyxJQUFuRDs7VUFFSWdJLGVBQUo7O1VBRUlGLFNBQVMsS0FBYixFQUFvQjtpQkFDVCxJQUFJNUssSUFBSixDQUFTcEIsSUFBSW1NLE9BQUosS0FBZ0JGLFVBQXpCLENBQVQ7T0FERixNQUVPLElBQUlELFNBQVMsVUFBYixFQUF5QjtpQkFDckIsSUFBSTVLLElBQUosQ0FBU3BCLElBQUltTSxPQUFKLEtBQWdCRixVQUF6QixDQUFUOzs7V0FHR3JFLE9BQUwsQ0FBYXNFLE1BQWI7S0FuTG9COztxQkFzTEwsMkJBQVk7VUFDdkJwSCxVQUFKOztXQUVLMEcsU0FBTCxDQUFlLENBQWYsSUFBb0IxSixlQUFlLEtBQUswSixTQUFMLENBQWUsQ0FBZixDQUFmLENBQXBCO1dBQ0sxRyxJQUFJLENBQVQsRUFBWUEsSUFBSSxLQUFLSSxFQUFMLENBQVFpQixjQUF4QixFQUF3Q3JCLEdBQXhDLEVBQTZDO2FBQ3RDMEcsU0FBTCxDQUFlMUcsQ0FBZixJQUFvQmhELGVBQWU7aUJBQzFCLEtBQUswSixTQUFMLENBQWUsQ0FBZixFQUFrQmxMLEtBQWxCLEdBQTBCd0UsQ0FEQTtnQkFFM0IsS0FBSzBHLFNBQUwsQ0FBZSxDQUFmLEVBQWtCcEw7U0FGTixDQUFwQjs7V0FLRzhLLElBQUw7S0FoTW9COztlQW1NWCxxQkFBWTtXQUNoQlosUUFBTCxDQUFjLElBQUlsSixJQUFKLEVBQWQ7S0FwTW9COzs7OztlQTBNWCxtQkFBVWQsS0FBVixFQUFpQjtVQUN0QixDQUFDVCxNQUFNUyxLQUFOLENBQUwsRUFBbUI7YUFDWmtMLFNBQUwsQ0FBZSxDQUFmLEVBQWtCbEwsS0FBbEIsR0FBMEJvSyxTQUFTcEssS0FBVCxFQUFnQixFQUFoQixDQUExQjthQUNLeUwsZUFBTDs7S0E3TWtCOztlQWlOWCxxQkFBWTtXQUNoQlAsU0FBTCxDQUFlLENBQWYsRUFBa0JsTCxLQUFsQjtXQUNLeUwsZUFBTDtLQW5Ob0I7O2VBc05YLHFCQUFZO1dBQ2hCUCxTQUFMLENBQWUsQ0FBZixFQUFrQmxMLEtBQWxCO1dBQ0t5TCxlQUFMO0tBeE5vQjs7Ozs7Y0E4Tlosa0JBQVUzTCxJQUFWLEVBQWdCO1VBQ3BCLENBQUNQLE1BQU1PLElBQU4sQ0FBTCxFQUFrQjthQUNYb0wsU0FBTCxDQUFlLENBQWYsRUFBa0JwTCxJQUFsQixHQUF5QnNLLFNBQVN0SyxJQUFULEVBQWUsRUFBZixDQUF6QjthQUNLMkwsZUFBTDs7S0FqT2tCOzs7OztnQkF3T1Ysb0JBQVV4RCxLQUFWLEVBQWlCO1VBQ3ZCQSxpQkFBaUJuSCxJQUFyQixFQUEyQjt3QkFDVG1ILEtBQWhCO2FBQ0tyRCxFQUFMLENBQVF5QixPQUFSLEdBQWtCNEIsS0FBbEI7YUFDS3JELEVBQUwsQ0FBUUUsT0FBUixHQUFrQm1ELE1BQU11QyxXQUFOLEVBQWxCO2FBQ0s1RixFQUFMLENBQVFRLFFBQVIsR0FBbUI2QyxNQUFNc0QsUUFBTixFQUFuQjtPQUpGLE1BS087YUFDQTNHLEVBQUwsQ0FBUXlCLE9BQVIsR0FBa0J2RSxTQUFTdUUsT0FBM0I7YUFDS3pCLEVBQUwsQ0FBUUUsT0FBUixHQUFrQmhELFNBQVNnRCxPQUEzQjthQUNLRixFQUFMLENBQVFRLFFBQVIsR0FBbUJ0RCxTQUFTc0QsUUFBNUI7YUFDS1IsRUFBTCxDQUFRa0gsVUFBUixHQUFxQmhLLFNBQVNnSyxVQUE5Qjs7O1dBR0dsQixJQUFMO0tBclBvQjs7Ozs7Z0JBMlBWLG9CQUFVM0MsS0FBVixFQUFpQjtVQUN2QkEsaUJBQWlCbkgsSUFBckIsRUFBMkI7d0JBQ1RtSCxLQUFoQjthQUNLckQsRUFBTCxDQUFReUYsT0FBUixHQUFrQnBDLEtBQWxCO2FBQ0tyRCxFQUFMLENBQVFJLE9BQVIsR0FBa0JpRCxNQUFNdUMsV0FBTixFQUFsQjthQUNLNUYsRUFBTCxDQUFRUyxRQUFSLEdBQW1CNEMsTUFBTXNELFFBQU4sRUFBbkI7T0FKRixNQUtPO2FBQ0EzRyxFQUFMLENBQVF5RixPQUFSLEdBQWtCdkksU0FBU3VJLE9BQTNCO2FBQ0t6RixFQUFMLENBQVFJLE9BQVIsR0FBa0JsRCxTQUFTa0QsT0FBM0I7YUFDS0osRUFBTCxDQUFRUyxRQUFSLEdBQW1CdkQsU0FBU3VELFFBQTVCO2FBQ0tULEVBQUwsQ0FBUW1ILFFBQVIsR0FBbUJqSyxTQUFTaUssUUFBNUI7OztXQUdHbkIsSUFBTDtLQXhRb0I7O21CQTJRUCx1QkFBVTNDLEtBQVYsRUFBaUI7V0FDekJyRCxFQUFMLENBQVFrSCxVQUFSLEdBQXFCN0QsS0FBckI7S0E1UW9COztpQkErUVQscUJBQVVBLEtBQVYsRUFBaUI7V0FDdkJyRCxFQUFMLENBQVFtSCxRQUFSLEdBQW1COUQsS0FBbkI7S0FoUm9COzs7OztVQXNSaEIsY0FBVStELEtBQVYsRUFBaUI7VUFDakIsQ0FBQyxLQUFLdkYsRUFBTixJQUFZLENBQUN1RixLQUFqQixFQUF3Qjs7OztVQUlsQmhLLE9BQU8sS0FBSzRDLEVBQWxCO1VBQ01FLFVBQVU5QyxLQUFLOEMsT0FBckI7VUFDTUUsVUFBVWhELEtBQUtnRCxPQUFyQjtVQUNNSSxXQUFXcEQsS0FBS29ELFFBQXRCO1VBQ01DLFdBQVdyRCxLQUFLcUQsUUFBdEI7VUFDSUosT0FBTyxFQUFYO1VBQ0lQLGVBQUo7O1VBRUksS0FBS3VILEVBQUwsSUFBV25ILE9BQWYsRUFBd0I7YUFDakJtSCxFQUFMLEdBQVVuSCxPQUFWO1lBQ0ksQ0FBQ3ZGLE1BQU02RixRQUFOLENBQUQsSUFBb0IsS0FBSzhHLEVBQUwsR0FBVTlHLFFBQWxDLEVBQTRDO2VBQ3JDOEcsRUFBTCxHQUFVOUcsUUFBVjs7O1VBR0EsS0FBSzZHLEVBQUwsSUFBV2pILE9BQWYsRUFBd0I7YUFDakJpSCxFQUFMLEdBQVVqSCxPQUFWO1lBQ0ksQ0FBQ3pGLE1BQU04RixRQUFOLENBQUQsSUFBb0IsS0FBSzZHLEVBQUwsR0FBVTdHLFFBQWxDLEVBQTRDO2VBQ3JDNkcsRUFBTCxHQUFVN0csUUFBVjs7OztlQUlLLHVCQUF1QjNELEtBQUt5SyxNQUFMLEdBQWNoTixRQUFkLENBQXVCLEVBQXZCLEVBQTJCWCxPQUEzQixDQUFtQyxVQUFuQyxFQUErQyxFQUEvQyxFQUFtRDROLE1BQW5ELENBQTBELENBQTFELEVBQTZELENBQTdELENBQWhDOztVQUVJNUgsVUFBSjtXQUNLQSxJQUFJLENBQVQsRUFBWUEsSUFBSXhDLEtBQUs2RCxjQUFyQixFQUFxQ3JCLEdBQXJDLEVBQTBDO2dCQUNoQyxxQ0FBcUNGLFlBQVksSUFBWixFQUFrQkUsQ0FBbEIsRUFBcUIsS0FBSzBHLFNBQUwsQ0FBZTFHLENBQWYsRUFBa0IxRSxJQUF2QyxFQUE2QyxLQUFLb0wsU0FBTCxDQUFlMUcsQ0FBZixFQUFrQnhFLEtBQS9ELEVBQXNFLEtBQUtrTCxTQUFMLENBQWUsQ0FBZixFQUFrQnBMLElBQXhGLEVBQThGNEUsTUFBOUYsQ0FBckMsR0FBNkksS0FBSzJILE1BQUwsQ0FBWSxLQUFLbkIsU0FBTCxDQUFlMUcsQ0FBZixFQUFrQjFFLElBQTlCLEVBQW9DLEtBQUtvTCxTQUFMLENBQWUxRyxDQUFmLEVBQWtCeEUsS0FBdEQsRUFBNkQwRSxNQUE3RCxDQUE3SSxHQUFvTixRQUE1Tjs7O1dBR0czRyxFQUFMLENBQVF1TyxTQUFSLEdBQW9CckgsSUFBcEI7O1VBRUlqRCxLQUFLOEUsS0FBVCxFQUFnQjtZQUNWOUUsS0FBS3lGLEtBQUwsQ0FBVzhFLElBQVgsS0FBb0IsUUFBeEIsRUFBa0M7cUJBQ3JCLFlBQU07aUJBQ1ZsRCxPQUFMLENBQWFtRCxLQUFiO1dBREYsRUFFRyxDQUZIOzs7O1VBTUEsT0FBTyxLQUFLNUgsRUFBTCxDQUFRNkgsTUFBZixLQUEwQixVQUE5QixFQUEwQzthQUNuQzdILEVBQUwsQ0FBUTZILE1BQVIsQ0FBZSxJQUFmOzs7VUFHRXpLLEtBQUs4RSxLQUFULEVBQWdCOzthQUVUVyxLQUFMLENBQVdpRixZQUFYLENBQXdCLFlBQXhCLEVBQXNDLG1DQUF0Qzs7S0F2VWtCOztvQkEyVU4sMEJBQVk7VUFDdEIsS0FBSzlILEVBQUwsQ0FBUTRFLFNBQVosRUFBdUI7O1dBRWxCekwsRUFBTCxDQUFRNE8sS0FBUixDQUFjQyxRQUFkLEdBQXlCLFVBQXpCOztVQUVNbkYsUUFBUSxLQUFLN0MsRUFBTCxDQUFReUUsT0FBdEI7VUFDSUwsTUFBTXZCLEtBQVY7VUFDTW9GLFFBQVEsS0FBSzlPLEVBQUwsQ0FBUStPLFdBQXRCO1VBQ01DLFNBQVMsS0FBS2hQLEVBQUwsQ0FBUWlQLFlBQXZCO1VBQ01DLGdCQUFnQnBQLE9BQU9xUCxVQUFQLElBQXFCdFAsU0FBU3VQLGVBQVQsQ0FBeUJDLFdBQXBFO1VBQ01DLGlCQUFpQnhQLE9BQU95UCxXQUFQLElBQXNCMVAsU0FBU3VQLGVBQVQsQ0FBeUJJLFlBQXRFO1VBQ01DLFlBQVkzUCxPQUFPNFAsV0FBUCxJQUFzQjdQLFNBQVM4TCxJQUFULENBQWM4RCxTQUFwQyxJQUFpRDVQLFNBQVN1UCxlQUFULENBQXlCSyxTQUE1RjtVQUNJRSxhQUFKO1VBQ0lDLFlBQUo7O1VBRUksT0FBT2xHLE1BQU1tRyxxQkFBYixLQUF1QyxVQUEzQyxFQUF1RDtZQUMvQ0MsYUFBYXBHLE1BQU1tRyxxQkFBTixFQUFuQjtlQUNPQyxXQUFXSCxJQUFYLEdBQWtCN1AsT0FBT2lRLFdBQWhDO2NBQ01ELFdBQVdFLE1BQVgsR0FBb0JsUSxPQUFPNFAsV0FBakM7T0FIRixNQUlPO2VBQ0V6RSxJQUFJZ0YsVUFBWDtjQUNNaEYsSUFBSWlGLFNBQUosR0FBZ0JqRixJQUFJZ0UsWUFBMUI7ZUFDUWhFLE1BQU1BLElBQUlrRixZQUFsQixFQUFpQztrQkFDdkJsRixJQUFJZ0YsVUFBWjtpQkFDT2hGLElBQUlpRixTQUFYOzs7OztVQUtDLEtBQUtySixFQUFMLENBQVF1SixVQUFSLElBQXNCVCxPQUFPYixLQUFQLEdBQWVJLGFBQXRDLElBQ0EsS0FBS3JJLEVBQUwsQ0FBUWdJLFFBQVIsQ0FBaUJoTyxPQUFqQixDQUF5QixPQUF6QixJQUFvQyxDQUFDLENBQXJDLElBQ0E4TyxPQUFPYixLQUFQLEdBQWVwRixNQUFNcUYsV0FBckIsR0FBbUMsQ0FGdkMsRUFHSztlQUNJWSxPQUFPYixLQUFQLEdBQWVwRixNQUFNcUYsV0FBNUI7O1VBRUcsS0FBS2xJLEVBQUwsQ0FBUXVKLFVBQVIsSUFBc0JSLE1BQU1aLE1BQU4sR0FBZU0saUJBQWlCRyxTQUF2RCxJQUNBLEtBQUs1SSxFQUFMLENBQVFnSSxRQUFSLENBQWlCaE8sT0FBakIsQ0FBeUIsS0FBekIsSUFBa0MsQ0FBQyxDQUFuQyxJQUNBK08sTUFBTVosTUFBTixHQUFldEYsTUFBTXVGLFlBQXJCLEdBQW9DLENBRnhDLEVBR0s7Y0FDR1csTUFBTVosTUFBTixHQUFldEYsTUFBTXVGLFlBQTNCOzs7V0FHR2pQLEVBQUwsQ0FBUTRPLEtBQVIsQ0FBY2UsSUFBZCxHQUFxQkEsT0FBTyxJQUE1QjtXQUNLM1AsRUFBTCxDQUFRNE8sS0FBUixDQUFjZ0IsR0FBZCxHQUFvQkEsTUFBTSxJQUExQjtLQXRYb0I7Ozs7O1lBNFhkLGdCQUFVN04sSUFBVixFQUFnQkUsS0FBaEIsRUFBdUIwRSxNQUF2QixFQUErQjtVQUMvQjFDLE9BQU8sS0FBSzRDLEVBQWxCO1VBQ013SixNQUFNLElBQUl0TixJQUFKLEVBQVo7VUFDTThDLE9BQU83RCxlQUFlRCxJQUFmLEVBQXFCRSxLQUFyQixDQUFiO1VBQ0lxTyxTQUFTLElBQUl2TixJQUFKLENBQVNoQixJQUFULEVBQWVFLEtBQWYsRUFBc0IsQ0FBdEIsRUFBeUJKLE1BQXpCLEVBQWI7VUFDSXNCLE9BQU8sRUFBWDtVQUNJb04sTUFBTSxFQUFWOztzQkFFZ0JGLEdBQWhCOztVQUVJcE0sS0FBS0UsUUFBTCxHQUFnQixDQUFwQixFQUF1QjtrQkFDWEYsS0FBS0UsUUFBZjtZQUNJbU0sU0FBUyxDQUFiLEVBQWdCO29CQUNKLENBQVY7Ozs7VUFJRXpJLGdCQUFnQjVGLFVBQVUsQ0FBVixHQUFjLEVBQWQsR0FBbUJBLFFBQVEsQ0FBakQ7VUFDTThGLFlBQVk5RixVQUFVLEVBQVYsR0FBZSxDQUFmLEdBQW1CQSxRQUFRLENBQTdDO1VBQ011TyxzQkFBc0J2TyxVQUFVLENBQVYsR0FBY0YsT0FBTyxDQUFyQixHQUF5QkEsSUFBckQ7VUFDTTBPLGtCQUFrQnhPLFVBQVUsRUFBVixHQUFlRixPQUFPLENBQXRCLEdBQTBCQSxJQUFsRDtVQUNNMk8sc0JBQXNCMU8sZUFBZXdPLG1CQUFmLEVBQW9DM0ksYUFBcEMsQ0FBNUI7VUFDSThJLFFBQVE5SyxPQUFPeUssTUFBbkI7VUFDSU0sUUFBUUQsS0FBWjs7YUFFT0MsUUFBUSxDQUFmLEVBQWtCO2lCQUNQLENBQVQ7OztlQUdPLElBQUlBLEtBQWI7VUFDSUMsaUJBQWlCLEtBQXJCO1VBQ0l4SyxVQUFKO1VBQU95SyxVQUFQOztXQUVLekssSUFBSSxDQUFKLEVBQU95SyxJQUFJLENBQWhCLEVBQW1CekssSUFBSXNLLEtBQXZCLEVBQThCdEssR0FBOUIsRUFBbUM7WUFDM0IxRSxNQUFNLElBQUlvQixJQUFKLENBQVNoQixJQUFULEVBQWVFLEtBQWYsRUFBc0IsS0FBS29FLElBQUlpSyxNQUFULENBQXRCLENBQVo7WUFDTXRMLGFBQWF6RCxPQUFPLEtBQUttTCxFQUFaLElBQWtCdEssYUFBYVQsR0FBYixFQUFrQixLQUFLK0ssRUFBdkIsQ0FBbEIsR0FBK0MsS0FBbEU7WUFDTTNILFVBQVUzQyxhQUFhVCxHQUFiLEVBQWtCME8sR0FBbEIsQ0FBaEI7WUFDTXBMLFdBQVdoQixLQUFLOE0sTUFBTCxDQUFZbFEsT0FBWixDQUFvQmMsSUFBSWdMLFlBQUosRUFBcEIsTUFBNEMsQ0FBQyxDQUE5RDtZQUNNakksVUFBVTJCLElBQUlpSyxNQUFKLElBQWNqSyxLQUFNUixPQUFPeUssTUFBM0M7WUFDSVUsWUFBWSxLQUFLM0ssSUFBSWlLLE1BQVQsQ0FBaEI7WUFDSVcsY0FBY2hQLEtBQWxCO1lBQ0lpUCxhQUFhblAsSUFBakI7WUFDTW9ELGVBQWVsQixLQUFLOEosVUFBTCxJQUFtQjNMLGFBQWE2QixLQUFLOEosVUFBbEIsRUFBOEJwTSxHQUE5QixDQUF4QztZQUNNeUQsYUFBYW5CLEtBQUsrSixRQUFMLElBQWlCNUwsYUFBYTZCLEtBQUsrSixRQUFsQixFQUE0QnJNLEdBQTVCLENBQXBDO1lBQ011RCxZQUFZakIsS0FBSzhKLFVBQUwsSUFBbUI5SixLQUFLK0osUUFBeEIsSUFBb0MvSixLQUFLOEosVUFBTCxHQUFrQnBNLEdBQXRELElBQTZEQSxNQUFNc0MsS0FBSytKLFFBQTFGO1lBQ01sSixhQUFjYixLQUFLcUUsT0FBTCxJQUFnQjNHLE1BQU1zQyxLQUFLcUUsT0FBNUIsSUFDaEJyRSxLQUFLcUksT0FBTCxJQUFnQjNLLE1BQU1zQyxLQUFLcUksT0FEWCxJQUVoQnJJLEtBQUtpSSxlQUFMLElBQXdCeEssVUFBVUMsR0FBVixDQUZSLElBR2hCc0MsS0FBS2tJLFlBQUwsSUFBcUJsSSxLQUFLa0ksWUFBTCxDQUFrQnhLLEdBQWxCLENBSHhCOztZQUtJK0MsT0FBSixFQUFhO2NBQ1AyQixJQUFJaUssTUFBUixFQUFnQjt3QkFDRkksc0JBQXNCTSxTQUFsQzswQkFDY25KLGFBQWQ7eUJBQ2EySSxtQkFBYjtXQUhGLE1BSU87d0JBQ09RLFlBQVluTCxJQUF4QjswQkFDY2tDLFNBQWQ7eUJBQ2EwSSxlQUFiOzs7O1lBSUVVLFlBQVk7ZUFDWEgsU0FEVztpQkFFVEMsV0FGUztnQkFHVkMsVUFIVTtvQkFJTmpNLFFBSk07c0JBS0pELFVBTEk7bUJBTVBELE9BTk87c0JBT0pELFVBUEk7bUJBUVBKLE9BUk87d0JBU0ZTLFlBVEU7c0JBVUpDLFVBVkk7cUJBV0xGLFNBWEs7MkNBWWlCakIsS0FBS1UsK0JBWnRCO3NEQWE0QlYsS0FBS1k7U0FibkQ7O1lBZ0JJWixLQUFLOEIsYUFBTCxJQUFzQmYsVUFBMUIsRUFBc0M7MkJBQ25CLElBQWpCOzs7WUFHRUosSUFBSixDQUFTTCxVQUFVNE0sU0FBVixDQUFUOztZQUVJLEVBQUVMLENBQUYsS0FBUSxDQUFaLEVBQWU7Y0FDVDdNLEtBQUtxQyxjQUFULEVBQXlCO2dCQUNuQjhLLE9BQUosQ0FBWTlMLFdBQVdlLElBQUlpSyxNQUFmLEVBQXVCck8sS0FBdkIsRUFBOEJGLElBQTlCLENBQVo7O2VBRUc2QyxJQUFMLENBQVVnQixVQUFVMkssR0FBVixFQUFldE0sS0FBSzZCLEtBQXBCLEVBQTJCN0IsS0FBSzhCLGFBQWhDLEVBQStDOEssY0FBL0MsQ0FBVjtnQkFDTSxFQUFOO2NBQ0ksQ0FBSjsyQkFDaUIsS0FBakI7OzthQUdHN0ksWUFBWS9ELElBQVosRUFBa0JkLElBQWxCLEVBQXdCd0QsTUFBeEIsQ0FBUDtLQTFkb0I7O2VBNmRYLHFCQUFZO2FBQ2QsS0FBSytCLEVBQVo7S0E5ZG9COztVQWllaEIsZ0JBQVk7VUFDWixDQUFDLEtBQUsyQixTQUFMLEVBQUwsRUFBdUI7YUFDaEIzQixFQUFMLEdBQVUsSUFBVjthQUNLbUUsSUFBTDtvQkFDWSxLQUFLN00sRUFBakIsRUFBcUIsV0FBckI7WUFDSSxLQUFLNkcsRUFBTCxDQUFRa0MsS0FBWixFQUFtQjttQkFDUmxKLFFBQVQsRUFBbUIsT0FBbkIsRUFBNEIsS0FBS3dMLFFBQWpDO2VBQ0tnRyxjQUFMOztZQUVFLE9BQU8sS0FBS3hLLEVBQUwsQ0FBUXlLLE1BQWYsS0FBMEIsVUFBOUIsRUFBMEM7ZUFDbkN6SyxFQUFMLENBQVF5SyxNQUFSLENBQWVqUSxJQUFmLENBQW9CLElBQXBCOzs7S0EzZWdCOztVQWdmaEIsZ0JBQVk7VUFDVmtRLElBQUksS0FBSzdJLEVBQWY7VUFDSTZJLE1BQU0sS0FBVixFQUFpQjtZQUNYLEtBQUsxSyxFQUFMLENBQVFrQyxLQUFaLEVBQW1CO3NCQUNMbEosUUFBWixFQUFzQixPQUF0QixFQUErQixLQUFLd0wsUUFBcEM7O2FBRUdyTCxFQUFMLENBQVE0TyxLQUFSLENBQWNDLFFBQWQsR0FBeUIsUUFBekIsQ0FKZTthQUtWN08sRUFBTCxDQUFRNE8sS0FBUixDQUFjZSxJQUFkLEdBQXFCLE1BQXJCO2FBQ0szUCxFQUFMLENBQVE0TyxLQUFSLENBQWNnQixHQUFkLEdBQW9CLE1BQXBCO2lCQUNTLEtBQUs1UCxFQUFkLEVBQWtCLFdBQWxCO2FBQ0swSSxFQUFMLEdBQVUsS0FBVjtZQUNJNkksTUFBTTFPLFNBQU4sSUFBbUIsT0FBTyxLQUFLZ0UsRUFBTCxDQUFRMkssT0FBZixLQUEyQixVQUFsRCxFQUE4RDtlQUN2RDNLLEVBQUwsQ0FBUTJLLE9BQVIsQ0FBZ0JuUSxJQUFoQixDQUFxQixJQUFyQjs7O0tBNWZnQjs7YUFpZ0JiLG1CQUFZO1dBQ2RtSSxJQUFMO2tCQUNZLEtBQUt4SixFQUFqQixFQUFxQixXQUFyQixFQUFrQyxLQUFLeUksWUFBdkMsRUFBcUQsSUFBckQ7a0JBQ1ksS0FBS3pJLEVBQWpCLEVBQXFCLFVBQXJCLEVBQWlDLEtBQUt5SSxZQUF0QyxFQUFvRCxJQUFwRDtrQkFDWSxLQUFLekksRUFBakIsRUFBcUIsUUFBckIsRUFBK0IsS0FBS2dLLFNBQXBDO1VBQ0ksS0FBS25ELEVBQUwsQ0FBUTZDLEtBQVosRUFBbUI7b0JBQ0wsS0FBSzdDLEVBQUwsQ0FBUTZDLEtBQXBCLEVBQTJCLFFBQTNCLEVBQXFDLEtBQUtlLGNBQTFDO1lBQ0ksS0FBSzVELEVBQUwsQ0FBUWtDLEtBQVosRUFBbUI7c0JBQ0wsS0FBS2xDLEVBQUwsQ0FBUXlFLE9BQXBCLEVBQTZCLE9BQTdCLEVBQXNDLEtBQUtQLGFBQTNDO3NCQUNZLEtBQUtsRSxFQUFMLENBQVF5RSxPQUFwQixFQUE2QixPQUE3QixFQUFzQyxLQUFLUixhQUEzQztzQkFDWSxLQUFLakUsRUFBTCxDQUFReUUsT0FBcEIsRUFBNkIsTUFBN0IsRUFBcUMsS0FBS04sWUFBMUM7OztVQUdBLEtBQUtoTCxFQUFMLENBQVE4SSxVQUFaLEVBQXdCO2FBQ2pCOUksRUFBTCxDQUFROEksVUFBUixDQUFtQjJJLFdBQW5CLENBQStCLEtBQUt6UixFQUFwQzs7O0dBL2dCTjtTQW1oQk9pSSxXQUFQLEdBQXFCQSxXQUFyQjtDQWhuQ0YifQ==
