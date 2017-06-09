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
          console.log('is-date');
          self.setDate(new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day')));
          if (opts.bound) {
            setTimeout(function () {
              // selectable date range on single calendar
              if (opts.rangeSelect) {
                console.log('rangeSelectable');
              } else {
                self.hide();
                if (opts.blurFieldOnSelect && opts.field) {
                  opts.field.blur();
                }
              }
            }, 100);
          }
        } else if (hasClass(target, 'datepicker__prev')) {
          console.log('is-prev');
          self.prevMonth();
        } else if (hasClass(target, 'datepicker__next')) {
          console.log('is-next');
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
        console.log('is-select');
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
      console.log('onchange');
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
      if (!date) {
        this._d = null;

        if (this._o.field) {
          this._o.field.value = '';
          fireEvent(this._o.field, 'change', {
            firedBy: this
          });
        }

        return this.draw();
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!isDate(date)) {
        return;
      }

      var min = this._o.minDate;
      var max = this._o.maxDate;

      if (isDate(min) && date < min) {
        date = min;
      } else if (isDate(max) && date > max) {
        date = max;
      }

      this._d = new Date(date.getTime());
      setToStartOfDay(this._d);
      this.gotoDate(this._d);

      if (this._o.field) {
        this._o.field.value = this.toString();
        fireEvent(this._o.field, 'change', {
          firedBy: this
        });
      }
      if (!preventOnSelect && typeof this._o.onSelect === 'function') {
        this._o.onSelect.call(this, this.getDate());
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnRcbiAgY29uc3QgYWRkRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlRXZlbnQgPSAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSA9PiB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgY29uc3QgdHJpbSA9IHN0ciA9PiB7XG4gICAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgfVxuXG4gIGNvbnN0IGhhc0NsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIHJldHVybiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcbiAgfVxuXG4gIGNvbnN0IGFkZENsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGlmICghaGFzQ2xhc3MoZWwsIGNuKSkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gKGVsLmNsYXNzTmFtZSA9PT0gJycpID8gY24gOiBlbC5jbGFzc05hbWUgKyAnICcgKyBjblxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlbW92ZUNsYXNzID0gKGVsLCBjbikgPT4ge1xuICAgIGVsLmNsYXNzTmFtZSA9IHRyaW0oKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbiArICcgJywgJyAnKSlcbiAgfVxuXG4gIGNvbnN0IGlzQXJyYXkgPSBvYmogPT4ge1xuICAgIHJldHVybiAoL0FycmF5LykudGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcbiAgfVxuXG4gIGNvbnN0IGlzRGF0ZSA9IG9iaiA9PiB7XG4gICAgcmV0dXJuICgvRGF0ZS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuICB9XG5cbiAgY29uc3QgaXNXZWVrZW5kID0gZGF0ZSA9PiB7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXkoKVxuICAgIHJldHVybiBkYXkgPT09IDAgfHwgZGF5ID09PSA2XG4gIH1cblxuICBjb25zdCBpc0xlYXBZZWFyID0geWVhciA9PiB7XG4gICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCAoeWVhciAlIDQwMCA9PT0gMClcbiAgfVxuXG4gIGNvbnN0IGdldERheXNJbk1vbnRoID0gKHllYXIsIG1vbnRoKSA9PiB7XG4gICAgcmV0dXJuIFszMSwgaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF1cbiAgfVxuXG4gIGNvbnN0IHNldFRvU3RhcnRPZkRheSA9IGRhdGUgPT4ge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGNvbXBhcmVEYXRlcyA9IChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgY29uc3QgZXh0ZW5kID0gKHRvLCBmcm9tLCBvdmVyd3JpdGUpID0+IHtcbiAgICBsZXQgcHJvcFxuICAgIGxldCBoYXNQcm9wXG5cbiAgICBmb3IgKHByb3AgaW4gZnJvbSkge1xuICAgICAgaGFzUHJvcCA9IHRvW3Byb3BdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmIChoYXNQcm9wICYmIHR5cGVvZiBmcm9tW3Byb3BdID09PSAnb2JqZWN0JyAmJiBmcm9tW3Byb3BdICE9PSBudWxsICYmIGZyb21bcHJvcF0ubm9kZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXNEYXRlKGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBuZXcgRGF0ZShmcm9tW3Byb3BdLmdldFRpbWUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXS5zbGljZSgwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b1twcm9wXSA9IGV4dGVuZCh7fSwgZnJvbVtwcm9wXSwgb3ZlcndyaXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG92ZXJ3cml0ZSB8fCAhaGFzUHJvcCkge1xuICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvXG4gIH1cblxuICBjb25zdCBmaXJlRXZlbnQgPSAoZWwsIGV2ZW50TmFtZSwgZGF0YSkgPT4ge1xuICAgIGxldCBldlxuXG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJylcbiAgICAgIGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5maXJlRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgZXYpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBjYWxlbmRhciA9PiB7XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xuICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCArPSAxMlxuICAgIH1cbiAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xuICAgICAgY2FsZW5kYXIueWVhciArPSBNYXRoLmZsb29yKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggLT0gMTJcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG5cbiAgICAvLyBiaW5kIHRoZSBwaWNrZXIgdG8gYSBmb3JtIGZpZWxkXG4gICAgZmllbGQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cbiAgICAvLyB0aGUgdG9TdHJpbmcgZnVuY3Rpb24gd2hpY2ggZ2V0cyBwYXNzZWQgYSBjdXJyZW50IGRhdGUgb2JqZWN0IGFuZCBmb3JtYXRcbiAgICAvLyBhbmQgcmV0dXJucyBhIHN0cmluZ1xuICAgIHRvU3RyaW5nOiBudWxsLFxuXG4gICAgLy8gdXNlZCB0byBjcmVhdGUgZGF0ZSBvYmplY3QgZnJvbSBjdXJyZW50IGlucHV0IHN0cmluZ1xuICAgIHBhcnNlOiBudWxsLFxuXG4gICAgLy8gdGhlIGluaXRpYWwgZGF0ZSB0byB2aWV3IHdoZW4gZmlyc3Qgb3BlbmVkXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXG5cbiAgICAvLyBtYWtlIHRoZSBgZGVmYXVsdERhdGVgIHRoZSBpbml0aWFsIHNlbGVjdGVkIHZhbHVlXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxuXG4gICAgLy8gZmlyc3QgZGF5IG9mIHdlZWsgKDA6IFN1bmRheSwgMTogTW9uZGF5IGV0YylcbiAgICBmaXJzdERheTogMCxcblxuICAgIC8vIHRoZSBkZWZhdWx0IGZsYWcgZm9yIG1vbWVudCdzIHN0cmljdCBkYXRlIHBhcnNpbmdcbiAgICBmb3JtYXRTdHJpY3Q6IGZhbHNlLFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIFdlZWsgcGlja2VyIG1vZGVcbiAgICBwaWNrV2hvbGVXZWVrOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIEFsbG93cyB1c2VyIHRvIHNlbGVjdCBkYXlzIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBCbHVyIGZpZWxkIHdoZW4gZGF0ZSBpcyBzZWxlY3RlZFxuICAgIGJsdXJGaWVsZE9uU2VsZWN0OiB0cnVlLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldiBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBldmVudHMgYXJyYXlcbiAgICBldmVudHM6IFtdLFxuXG4gICAgcmFuZ2VTZWxlY3Q6IGZhbHNlLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNUb2RheSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5JylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkge1xuICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1N0YXJ0UmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zdGFydHJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcbiAgICB9XG4gICAgcmV0dXJuICc8dGQgZGF0YS1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCIgY2xhc3M9XCInICsgYXJyLmpvaW4oJyAnKSArICdcIiBhcmlhLXNlbGVjdGVkPVwiJyArIGFyaWFTZWxlY3RlZCArICdcIj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19idXR0b24gZGF0ZXBpY2tlcl9fZGF5XCIgdHlwZT1cImJ1dHRvblwiICcgK1xuICAgICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICsgb3B0cy55ZWFyICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgKyBvcHRzLm1vbnRoICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCI+JyArXG4gICAgICAgIG9wdHMuZGF5ICtcbiAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDApICsgb25lamFuLmdldERheSgpICsgMSkgLyA3KVxuICAgIHJldHVybiAnPHRkIGNsYXNzPVwiZGF0ZXBpY2tlcl9fd2Vla1wiPicgKyB3ZWVrTnVtICsgJzwvdGQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyUm93ID0gKGRheXMsIGlzUlRMLCBwaWNrV2hvbGVXZWVrLCBpc1Jvd1NlbGVjdGVkKSA9PiB7XG4gICAgcmV0dXJuICc8dHIgY2xhc3M9XCJkYXRlcGlja2VyX19yb3cnICsgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgKyAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICsgJ1wiPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IHJvd3MgPT4ge1xuICAgIHJldHVybiAnPHRib2R5PicgKyByb3dzLmpvaW4oJycpICsgJzwvdGJvZHk+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IG9wdHMgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGFyciA9IFtdXG4gICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgIGFyci5wdXNoKCc8dGg+PC90aD4nKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICBhcnIucHVzaCgnPHRoIHNjb3BlPVwiY29sXCI+PGFiYnIgdGl0bGU9XCInICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpKSArICdcIj4nICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpLCB0cnVlKSArICc8L2FiYnI+PC90aD4nKVxuICAgIH1cbiAgICByZXR1cm4gJzx0aGVhZD48dHI+JyArIChvcHRzLmlzUlRMID8gYXJyLnJldmVyc2UoKSA6IGFycikuam9pbignJykgKyAnPC90cj48L3RoZWFkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRpdGxlID0gKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRJZCArICdcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgcm9sZT1cImhlYWRpbmdcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj4nXG5cbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICsgJ1wiJyArXG4gICAgICAgICAgKGkgPT09IG1vbnRoID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICtcbiAgICAgICAgICAoKGlzTWluWWVhciAmJiBpIDwgb3B0cy5taW5Nb250aCkgfHwgKGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aCkgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSArICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArICc8L29wdGlvbj4nKVxuICAgIH1cblxuICAgIGNvbnN0IG1vbnRoSHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gKyAnPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXJfX3NlbGVjdCBkYXRlcGlja2VyX19zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikge1xuICAgICAgICBhcnIucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiJyArIChpID09PSB5ZWFyID8gJyBzZWxlY3RlZD1cInNlbGVjdGVkXCInIDogJycpICsgJz4nICsgKGkpICsgJzwvb3B0aW9uPicpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHllYXJIdG1sID0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgKyB5ZWFyICsgb3B0cy55ZWFyU3VmZml4ICsgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAob3B0cy5zaG93TW9udGhBZnRlclllYXIpIHtcbiAgICAgIGh0bWwgKz0geWVhckh0bWwgKyBtb250aEh0bWxcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSBtb250aEh0bWwgKyB5ZWFySHRtbFxuICAgIH1cblxuICAgIGlmIChpc01pblllYXIgJiYgKG1vbnRoID09PSAwIHx8IG9wdHMubWluTW9udGggPj0gbW9udGgpKSB7XG4gICAgICBwcmV2ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoaXNNYXhZZWFyICYmIChtb250aCA9PT0gMTEgfHwgb3B0cy5tYXhNb250aCA8PSBtb250aCkpIHtcbiAgICAgIG5leHQgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChjID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcHJldicgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLnByZXZpb3VzTW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cbiAgICBpZiAoYyA9PT0gKGluc3RhbmNlLl9vLm51bWJlck9mTW9udGhzIC0gMSkpIHtcbiAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19uZXh0JyArIChuZXh0ID8gJycgOiAnIGlzLWRpc2FibGVkJykgKyAnXCIgdHlwZT1cImJ1dHRvblwiPicgKyBvcHRzLmkxOG4ubmV4dE1vbnRoICsgJzwvYnV0dG9uPidcbiAgICB9XG5cbiAgICBodG1sICs9ICc8L2Rpdj4nXG5cbiAgICByZXR1cm4gaHRtbFxuICB9XG5cbiAgY29uc3QgcmVuZGVyVGFibGUgPSAob3B0cywgZGF0YSwgcmFuZElkKSA9PiB7XG4gICAgcmV0dXJuICc8dGFibGUgY2VsbHBhZGRpbmc9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCIgY2xhc3M9XCJkYXRlcGlja2VyX190YWJsZVwiIHJvbGU9XCJncmlkXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArIHJhbmRJZCArICdcIj4nICsgcmVuZGVySGVhZChvcHRzKSArIHJlbmRlckJvZHkoZGF0YSkgKyAnPC90YWJsZT4nXG4gIH1cblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuXG4gICAgc2VsZi5fb25Nb3VzZURvd24gPSBlID0+IHtcbiAgICAgIGlmICghc2VsZi5fdikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzLWRhdGUnKVxuICAgICAgICAgIHNlbGYuc2V0RGF0ZShuZXcgRGF0ZSh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXIteWVhcicpLCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItbW9udGgnKSwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpKSlcbiAgICAgICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIHNlbGVjdGFibGUgZGF0ZSByYW5nZSBvbiBzaW5nbGUgY2FsZW5kYXJcbiAgICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2VTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmFuZ2VTZWxlY3RhYmxlJylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICAgICAgICAgIGlmIChvcHRzLmJsdXJGaWVsZE9uU2VsZWN0ICYmIG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgIG9wdHMuZmllbGQuYmx1cigpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3ByZXYnKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdpcy1wcmV2JylcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzLW5leHQnKVxuICAgICAgICAgIHNlbGYubmV4dE1vbnRoKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QnKSkge1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLl9jID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLmxvZygnaXMtc2VsZWN0JylcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA8c2VsZWN0PlxuICAgIHNlbGYuX29uQ2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoJykpIHtcbiAgICAgICAgc2VsZi5nb3RvTW9udGgodGFyZ2V0LnZhbHVlKVxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QteWVhcicpKSB7XG4gICAgICAgIHNlbGYuZ290b1llYXIodGFyZ2V0LnZhbHVlKVxuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ29uY2hhbmdlJylcbiAgICB9XG5cbiAgICBzZWxmLl9vbktleUNoYW5nZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2VTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmFuZ2VTZWxlY3RhYmxlJylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdzdWJ0cmFjdCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENoYW5nZSA9IGUgPT4ge1xuICAgICAgbGV0IGRhdGVcblxuICAgICAgaWYgKGUuZmlyZWRCeSA9PT0gc2VsZikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLnBhcnNlKSB7XG4gICAgICAgIGRhdGUgPSBvcHRzLnBhcnNlKG9wdHMuZmllbGQudmFsdWUsIG9wdHMuZm9ybWF0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICB9XG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgfVxuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHNlbGYuc2hvdygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gKCkgPT4ge1xuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRCbHVyID0gKCkgPT4ge1xuICAgICAgbGV0IHBFbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHNlbGYuX2IgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uQ2xpY2sgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBsZXQgcEVsID0gdGFyZ2V0XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzZWxmLmVsLmNsYXNzTmFtZSA9ICdkYXRlcGlja2VyJyArIChvcHRzLmlzUlRMID8gJyBpcy1ydGwnIDogJycpICsgKG9wdHMudGhlbWUgPyAnICcgKyBvcHRzLnRoZW1lIDogJycpXG5cbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2Vkb3duJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmRGF0ZSA9IG9wdHMuZGVmYXVsdERhdGVcblxuICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkZWZEYXRlLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnY2xpY2snLCBzZWxmLl9vbklucHV0Q2xpY2spXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cbiAgUGxhaW5QaWNrZXIucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICogY29uZmlndXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKi9cbiAgICBjb25maWc6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAoIXRoaXMuX28pIHtcbiAgICAgICAgdGhpcy5fbyA9IGV4dGVuZCh7fSwgZGVmYXVsdHMsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdHMgPSBleHRlbmQodGhpcy5fbywgb3B0aW9ucywgdHJ1ZSlcblxuICAgICAgb3B0cy5pc1JUTCA9ICEhb3B0cy5pc1JUTFxuXG4gICAgICBvcHRzLmZpZWxkID0gKG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSkgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gKHR5cGVvZiBvcHRzLnRoZW1lKSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSAob3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSkgPyBvcHRzLnRyaWdnZXIgOiBvcHRzLmZpZWxkXG5cbiAgICAgIG9wdHMuZGlzYWJsZVdlZWtlbmRzID0gISFvcHRzLmRpc2FibGVXZWVrZW5kc1xuXG4gICAgICBvcHRzLmRpc2FibGVEYXlGbiA9ICh0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4pID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkge1xuICAgICAgICBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkge1xuICAgICAgICBvcHRzLm1heERhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKChvcHRzLm1pbkRhdGUgJiYgb3B0cy5tYXhEYXRlKSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMTBcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMF0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVswXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzFdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMV0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSBNYXRoLmFicyhwYXJzZUludChvcHRzLnllYXJSYW5nZSwgMTApKSB8fCBkZWZhdWx0cy55ZWFyUmFuZ2VcbiAgICAgICAgaWYgKG9wdHMueWVhclJhbmdlID4gMTAwKSB7XG4gICAgICAgICAgb3B0cy55ZWFyUmFuZ2UgPSAxMDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0c1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gYSBmb3JtYXR0ZWQgc3RyaW5nIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbiAodXNpbmcgTW9tZW50LmpzIGlmIGF2YWlsYWJsZSlcbiAgICAgKi9cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMuX28uZm9ybWF0XG4gICAgICBpZiAoIWlzRGF0ZSh0aGlzLl9kKSkge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9vLnRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vLnRvU3RyaW5nKHRoaXMuX2QsIGZvcm1hdClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzRGF0ZSh0aGlzLl9kKSA/IG5ldyBEYXRlKHRoaXMuX2QuZ2V0VGltZSgpKSA6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uIChkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aGlzLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBmaXJlZEJ5OiB0aGlzXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBtaW4gPSB0aGlzLl9vLm1pbkRhdGVcbiAgICAgIGNvbnN0IG1heCA9IHRoaXMuX28ubWF4RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xuICAgICAgICBkYXRlID0gbWluXG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcbiAgICAgICAgZGF0ZSA9IG1heFxuICAgICAgfVxuXG4gICAgICB0aGlzLl9kID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkodGhpcy5fZClcbiAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5fZClcblxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9IHRoaXMudG9TdHJpbmcoKVxuICAgICAgICBmaXJlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHtcbiAgICAgICAgICBmaXJlZEJ5OiB0aGlzXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoIXByZXZlbnRPblNlbGVjdCAmJiB0eXBlb2YgdGhpcy5fby5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vLm9uU2VsZWN0LmNhbGwodGhpcywgdGhpcy5nZXREYXRlKCkpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZGF0ZVxuICAgICAqL1xuICAgIGdvdG9EYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgbGV0IG5ld0NhbGVuZGFyID0gdHJ1ZVxuXG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2FsZW5kYXJzKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1swXS5tb250aCwgMSlcbiAgICAgICAgY29uc3QgbGFzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ueWVhciwgdGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IHZpc2libGVEYXRlID0gZGF0ZS5nZXRUaW1lKClcbiAgICAgICAgLy8gZ2V0IHRoZSBlbmQgb2YgdGhlIG1vbnRoXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXRNb250aChsYXN0VmlzaWJsZURhdGUuZ2V0TW9udGgoKSArIDEpXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXREYXRlKGxhc3RWaXNpYmxlRGF0ZS5nZXREYXRlKCkgLSAxKVxuICAgICAgICBuZXdDYWxlbmRhciA9ICh2aXNpYmxlRGF0ZSA8IGZpcnN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIHx8IGxhc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgPCB2aXNpYmxlRGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW3tcbiAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxuICAgICAgICAgIHllYXI6IGRhdGUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB9XVxuICAgICAgICBpZiAodGhpcy5fby5tYWluQ2FsZW5kYXIgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArPSAxIC0gdGhpcy5fby5udW1iZXJPZk1vbnRoc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgYWRqdXN0RGF0ZTogZnVuY3Rpb24gKHNpZ24sIGRheXMpIHtcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuZ2V0RGF0ZSgpIHx8IG5ldyBEYXRlKClcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBwYXJzZUludChkYXlzKSAqIDI0ICogNjAgKiA2MCAqIDEwMDBcblxuICAgICAgbGV0IG5ld0RheVxuXG4gICAgICBpZiAoc2lnbiA9PT0gJ2FkZCcpIHtcbiAgICAgICAgbmV3RGF5ID0gbmV3IERhdGUoZGF5LnZhbHVlT2YoKSArIGRpZmZlcmVuY2UpXG4gICAgICB9IGVsc2UgaWYgKHNpZ24gPT09ICdzdWJ0cmFjdCcpIHtcbiAgICAgICAgbmV3RGF5ID0gbmV3IERhdGUoZGF5LnZhbHVlT2YoKSAtIGRpZmZlcmVuY2UpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0RGF0ZShuZXdEYXkpXG4gICAgfSxcblxuICAgIGFkanVzdENhbGVuZGFyczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGNcblxuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSBhZGp1c3RDYWxlbmRhcih0aGlzLmNhbGVuZGFyc1swXSlcbiAgICAgIGZvciAoYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuZ290b0RhdGUobmV3IERhdGUoKSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBtb250aCAoemVyby1pbmRleCwgZS5nLiAwOiBKYW51YXJ5KVxuICAgICAqL1xuICAgIGdvdG9Nb250aDogZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgICBpZiAoIWlzTmFOKG1vbnRoKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCA9IHBhcnNlSW50KG1vbnRoLCAxMClcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBuZXh0TW9udGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aC0tXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZnVsbCB5ZWFyIChlLmcuIFwiMjAxMlwiKVxuICAgICAqL1xuICAgIGdvdG9ZZWFyOiBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgaWYgKCFpc05hTih5ZWFyKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS55ZWFyID0gcGFyc2VJbnQoeWVhciwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHRoZSBtaW5EYXRlXG4gICAgICovXG4gICAgc2V0TWluRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheSh2YWx1ZSlcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gdmFsdWUuZ2V0TW9udGgoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gZGVmYXVsdHMubWluRGF0ZVxuICAgICAgICB0aGlzLl9vLm1pblllYXIgPSBkZWZhdWx0cy5taW5ZZWFyXG4gICAgICAgIHRoaXMuX28ubWluTW9udGggPSBkZWZhdWx0cy5taW5Nb250aFxuICAgICAgICB0aGlzLl9vLnN0YXJ0UmFuZ2UgPSBkZWZhdWx0cy5zdGFydFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IGRlZmF1bHRzLm1heERhdGVcbiAgICAgICAgdGhpcy5fby5tYXhZZWFyID0gZGVmYXVsdHMubWF4WWVhclxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZGVmYXVsdHMubWF4TW9udGhcbiAgICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IGRlZmF1bHRzLmVuZFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlZnJlc2ggdGhlIEhUTUxcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbiAoZm9yY2UpIHtcbiAgICAgIGlmICghdGhpcy5fdiAmJiAhZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBtaW5ZZWFyID0gb3B0cy5taW5ZZWFyXG4gICAgICBjb25zdCBtYXhZZWFyID0gb3B0cy5tYXhZZWFyXG4gICAgICBjb25zdCBtaW5Nb250aCA9IG9wdHMubWluTW9udGhcbiAgICAgIGNvbnN0IG1heE1vbnRoID0gb3B0cy5tYXhNb250aFxuICAgICAgbGV0IGh0bWwgPSAnJ1xuICAgICAgbGV0IHJhbmRJZFxuXG4gICAgICBpZiAodGhpcy5feSA8PSBtaW5ZZWFyKSB7XG4gICAgICAgIHRoaXMuX3kgPSBtaW5ZZWFyXG4gICAgICAgIGlmICghaXNOYU4obWluTW9udGgpICYmIHRoaXMuX20gPCBtaW5Nb250aCkge1xuICAgICAgICAgIHRoaXMuX20gPSBtaW5Nb250aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5feSA+PSBtYXhZZWFyKSB7XG4gICAgICAgIHRoaXMuX3kgPSBtYXhZZWFyXG4gICAgICAgIGlmICghaXNOYU4obWF4TW9udGgpICYmIHRoaXMuX20gPiBtYXhNb250aCkge1xuICAgICAgICAgIHRoaXMuX20gPSBtYXhNb250aFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJhbmRJZCA9ICdkYXRlcGlja2VyX190aXRsZS0nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXpdKy9nLCAnJykuc3Vic3RyKDAsIDIpXG5cbiAgICAgIGxldCBjXG4gICAgICBmb3IgKGMgPSAwOyBjIDwgb3B0cy5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sZW5kYXJcIj4nICsgcmVuZGVyVGl0bGUodGhpcywgYywgdGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHRoaXMuY2FsZW5kYXJzWzBdLnllYXIsIHJhbmRJZCkgKyB0aGlzLnJlbmRlcih0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgcmFuZElkKSArICc8L2Rpdj4nXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICBpZiAob3B0cy5maWVsZC50eXBlICE9PSAnaGlkZGVuJykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgb3B0cy50cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICB9LCAxKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fby5vbkRyYXcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fby5vbkRyYXcodGhpcylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgLy8gbGV0IHRoZSBzY3JlZW4gcmVhZGVyIHVzZXIga25vdyB0byB1c2UgYXJyb3cga2V5c1xuICAgICAgICBvcHRzLmZpZWxkLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdVc2UgdGhlIGFycm93IGtleXMgdG8gcGljayBhIGRhdGUnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX28uY29udGFpbmVyKSByZXR1cm5cblxuICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLl9vLnRyaWdnZXJcbiAgICAgIGxldCBwRWwgPSBmaWVsZFxuICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmVsLm9mZnNldEhlaWdodFxuICAgICAgY29uc3Qgdmlld3BvcnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgICAgY29uc3Qgdmlld3BvcnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICAgIGxldCBsZWZ0XG4gICAgICBsZXQgdG9wXG5cbiAgICAgIGlmICh0eXBlb2YgZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudFJlY3QgPSBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBsZWZ0ID0gY2xpZW50UmVjdC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0XG4gICAgICAgIHRvcCA9IGNsaWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZWZ0ID0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgdG9wID0gcEVsLm9mZnNldFRvcCArIHBFbC5vZmZzZXRIZWlnaHRcbiAgICAgICAgd2hpbGUgKChwRWwgPSBwRWwub2Zmc2V0UGFyZW50KSkge1xuICAgICAgICAgIGxlZnQgKz0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgICB0b3AgKz0gcEVsLm9mZnNldFRvcFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgYm90dG9tICYgbGVmdFxuICAgICAgaWYgKCh0aGlzLl9vLnJlcG9zaXRpb24gJiYgbGVmdCArIHdpZHRoID4gdmlld3BvcnRXaWR0aCkgfHwgKFxuICAgICAgICAgIHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZigncmlnaHQnKSA+IC0xICYmXG4gICAgICAgICAgbGVmdCAtIHdpZHRoICsgZmllbGQub2Zmc2V0V2lkdGggPiAwXG4gICAgICAgICkpIHtcbiAgICAgICAgbGVmdCA9IGxlZnQgLSB3aWR0aCArIGZpZWxkLm9mZnNldFdpZHRoXG4gICAgICB9XG4gICAgICBpZiAoKHRoaXMuX28ucmVwb3NpdGlvbiAmJiB0b3AgKyBoZWlnaHQgPiB2aWV3cG9ydEhlaWdodCArIHNjcm9sbFRvcCkgfHwgKFxuICAgICAgICAgIHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZigndG9wJykgPiAtMSAmJlxuICAgICAgICAgIHRvcCAtIGhlaWdodCAtIGZpZWxkLm9mZnNldEhlaWdodCA+IDBcbiAgICAgICAgKSkge1xuICAgICAgICB0b3AgPSB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHRcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCdcbiAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW5kZXIgSFRNTCBmb3IgYSBwYXJ0aWN1bGFyIG1vbnRoXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoeWVhciwgbW9udGgsIHJhbmRJZCkge1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICAgIGNvbnN0IGRheXMgPSBnZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aClcbiAgICAgIGxldCBiZWZvcmUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KClcbiAgICAgIGxldCBkYXRhID0gW11cbiAgICAgIGxldCByb3cgPSBbXVxuXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkobm93KVxuXG4gICAgICBpZiAob3B0cy5maXJzdERheSA+IDApIHtcbiAgICAgICAgYmVmb3JlIC09IG9wdHMuZmlyc3REYXlcbiAgICAgICAgaWYgKGJlZm9yZSA8IDApIHtcbiAgICAgICAgICBiZWZvcmUgKz0gN1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IDExIDogbW9udGggLSAxXG4gICAgICBjb25zdCBuZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyAwIDogbW9udGggKyAxXG4gICAgICBjb25zdCB5ZWFyT2ZQcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyB5ZWFyIC0gMSA6IHllYXJcbiAgICAgIGNvbnN0IHllYXJPZk5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IHllYXIgKyAxIDogeWVhclxuICAgICAgY29uc3QgZGF5c0luUHJldmlvdXNNb250aCA9IGdldERheXNJbk1vbnRoKHllYXJPZlByZXZpb3VzTW9udGgsIHByZXZpb3VzTW9udGgpXG4gICAgICBsZXQgY2VsbHMgPSBkYXlzICsgYmVmb3JlXG4gICAgICBsZXQgYWZ0ZXIgPSBjZWxsc1xuXG4gICAgICB3aGlsZSAoYWZ0ZXIgPiA3KSB7XG4gICAgICAgIGFmdGVyIC09IDdcbiAgICAgIH1cblxuICAgICAgY2VsbHMgKz0gNyAtIGFmdGVyXG4gICAgICBsZXQgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgbGV0IGksIHJcblxuICAgICAgZm9yIChpID0gMCwgciA9IDA7IGkgPCBjZWxsczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxICsgKGkgLSBiZWZvcmUpKVxuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gaXNEYXRlKHRoaXMuX2QpID8gY29tcGFyZURhdGVzKGRheSwgdGhpcy5fZCkgOiBmYWxzZVxuICAgICAgICBjb25zdCBpc1RvZGF5ID0gY29tcGFyZURhdGVzKGRheSwgbm93KVxuICAgICAgICBjb25zdCBoYXNFdmVudCA9IG9wdHMuZXZlbnRzLmluZGV4T2YoZGF5LnRvRGF0ZVN0cmluZygpKSAhPT0gLTFcbiAgICAgICAgY29uc3QgaXNFbXB0eSA9IGkgPCBiZWZvcmUgfHwgaSA+PSAoZGF5cyArIGJlZm9yZSlcbiAgICAgICAgbGV0IGRheU51bWJlciA9IDEgKyAoaSAtIGJlZm9yZSlcbiAgICAgICAgbGV0IG1vbnRoTnVtYmVyID0gbW9udGhcbiAgICAgICAgbGV0IHllYXJOdW1iZXIgPSB5ZWFyXG4gICAgICAgIGNvbnN0IGlzU3RhcnRSYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBjb21wYXJlRGF0ZXMob3B0cy5zdGFydFJhbmdlLCBkYXkpXG4gICAgICAgIGNvbnN0IGlzRW5kUmFuZ2UgPSBvcHRzLmVuZFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLmVuZFJhbmdlLCBkYXkpXG4gICAgICAgIGNvbnN0IGlzSW5SYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBvcHRzLmVuZFJhbmdlICYmIG9wdHMuc3RhcnRSYW5nZSA8IGRheSAmJiBkYXkgPCBvcHRzLmVuZFJhbmdlXG4gICAgICAgIGNvbnN0IGlzRGlzYWJsZWQgPSAob3B0cy5taW5EYXRlICYmIGRheSA8IG9wdHMubWluRGF0ZSkgfHxcbiAgICAgICAgICAob3B0cy5tYXhEYXRlICYmIGRheSA+IG9wdHMubWF4RGF0ZSkgfHxcbiAgICAgICAgICAob3B0cy5kaXNhYmxlV2Vla2VuZHMgJiYgaXNXZWVrZW5kKGRheSkpIHx8XG4gICAgICAgICAgKG9wdHMuZGlzYWJsZURheUZuICYmIG9wdHMuZGlzYWJsZURheUZuKGRheSkpXG5cbiAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICBpZiAoaSA8IGJlZm9yZSkge1xuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5c0luUHJldmlvdXNNb250aCArIGRheU51bWJlclxuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBwcmV2aW91c01vbnRoXG4gICAgICAgICAgICB5ZWFyTnVtYmVyID0geWVhck9mUHJldmlvdXNNb250aFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlOdW1iZXIgLSBkYXlzXG4gICAgICAgICAgICBtb250aE51bWJlciA9IG5leHRNb250aFxuICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZk5leHRNb250aFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRheUNvbmZpZyA9IHtcbiAgICAgICAgICBkYXk6IGRheU51bWJlcixcbiAgICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXG4gICAgICAgICAgeWVhcjogeWVhck51bWJlcixcbiAgICAgICAgICBoYXNFdmVudDogaGFzRXZlbnQsXG4gICAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5LFxuICAgICAgICAgIGlzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcbiAgICAgICAgICBpc1N0YXJ0UmFuZ2U6IGlzU3RhcnRSYW5nZSxcbiAgICAgICAgICBpc0VuZFJhbmdlOiBpc0VuZFJhbmdlLFxuICAgICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxuICAgICAgICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyxcbiAgICAgICAgICBlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy5waWNrV2hvbGVXZWVrICYmIGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBpc1dlZWtTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIHJvdy5wdXNoKHJlbmRlckRheShkYXlDb25maWcpKVxuXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcbiAgICAgICAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgICAgICAgcm93LnVuc2hpZnQocmVuZGVyV2VlayhpIC0gYmVmb3JlLCBtb250aCwgeWVhcikpXG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEucHVzaChyZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMLCBvcHRzLnBpY2tXaG9sZVdlZWssIGlzV2Vla1NlbGVjdGVkKSlcbiAgICAgICAgICByb3cgPSBbXVxuICAgICAgICAgIHIgPSAwXG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyVGFibGUob3B0cywgZGF0YSwgcmFuZElkKVxuICAgIH0sXG5cbiAgICBpc1Zpc2libGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl92XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICB0aGlzLl92ID0gdHJ1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICAgICAgICB0aGlzLmFkanVzdFBvc2l0aW9uKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fby5vbk9wZW4uY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLl92XG4gICAgICBpZiAodiAhPT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICByZW1vdmVFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ3N0YXRpYycgLy8gcmVzZXRcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gJ2F1dG8nXG4gICAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gJ2F1dG8nXG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWwsICdpcy1oaWRkZW4nKVxuICAgICAgICB0aGlzLl92ID0gZmFsc2VcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5fby5vbkNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fby5vbkNsb3NlLmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ3RvdWNoZW5kJywgdGhpcy5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywgdGhpcy5fb25JbnB1dENoYW5nZSlcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdjbGljaycsIHRoaXMuX29uSW5wdXRDbGljaylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdmb2N1cycsIHRoaXMuX29uSW5wdXRGb2N1cylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdibHVyJywgdGhpcy5fb25JbnB1dEJsdXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgdGhpcy5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWwpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHdpbmRvdy5QbGFpblBpY2tlciA9IFBsYWluUGlja2VyXG59KSgpXG4iXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJ3aW5kb3ciLCJhZGRFdmVudCIsImVsIiwiZSIsImNhbGxiYWNrIiwiY2FwdHVyZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0cmltIiwic3RyIiwicmVwbGFjZSIsImhhc0NsYXNzIiwiY24iLCJjbGFzc05hbWUiLCJpbmRleE9mIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImlzQXJyYXkiLCJ0ZXN0IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwib2JqIiwiaXNEYXRlIiwiaXNOYU4iLCJnZXRUaW1lIiwiaXNXZWVrZW5kIiwiZGF5IiwiZGF0ZSIsImdldERheSIsImlzTGVhcFllYXIiLCJ5ZWFyIiwiZ2V0RGF5c0luTW9udGgiLCJtb250aCIsInNldFRvU3RhcnRPZkRheSIsInNldEhvdXJzIiwiY29tcGFyZURhdGVzIiwiYSIsImIiLCJleHRlbmQiLCJ0byIsImZyb20iLCJvdmVyd3JpdGUiLCJwcm9wIiwiaGFzUHJvcCIsInVuZGVmaW5lZCIsIm5vZGVOYW1lIiwiRGF0ZSIsInNsaWNlIiwiZmlyZUV2ZW50IiwiZXZlbnROYW1lIiwiZGF0YSIsImV2IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiY3JlYXRlRXZlbnRPYmplY3QiLCJhZGp1c3RDYWxlbmRhciIsImNhbGVuZGFyIiwiTWF0aCIsImNlaWwiLCJhYnMiLCJmbG9vciIsImRlZmF1bHRzIiwicmVuZGVyRGF5TmFtZSIsIm9wdHMiLCJhYmJyIiwiZmlyc3REYXkiLCJpMThuIiwid2Vla2RheXNTaG9ydCIsIndlZWtkYXlzIiwicmVuZGVyRGF5IiwiYXJyIiwiYXJpYVNlbGVjdGVkIiwiaXNFbXB0eSIsInNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMiLCJwdXNoIiwiZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzIiwiaXNEaXNhYmxlZCIsImlzVG9kYXkiLCJpc1NlbGVjdGVkIiwiaGFzRXZlbnQiLCJpc0luUmFuZ2UiLCJpc1N0YXJ0UmFuZ2UiLCJpc0VuZFJhbmdlIiwiam9pbiIsInJlbmRlcldlZWsiLCJkIiwibSIsInkiLCJvbmVqYW4iLCJ3ZWVrTnVtIiwicmVuZGVyUm93IiwiZGF5cyIsImlzUlRMIiwicGlja1dob2xlV2VlayIsImlzUm93U2VsZWN0ZWQiLCJyZXZlcnNlIiwicmVuZGVyQm9keSIsInJvd3MiLCJyZW5kZXJIZWFkIiwiaSIsInNob3dXZWVrTnVtYmVyIiwicmVuZGVyVGl0bGUiLCJpbnN0YW5jZSIsImMiLCJyZWZZZWFyIiwicmFuZElkIiwiaiIsIl9vIiwiaXNNaW5ZZWFyIiwibWluWWVhciIsImlzTWF4WWVhciIsIm1heFllYXIiLCJodG1sIiwicHJldiIsIm5leHQiLCJtaW5Nb250aCIsIm1heE1vbnRoIiwibW9udGhzIiwibW9udGhIdG1sIiwieWVhclJhbmdlIiwieWVhckh0bWwiLCJ5ZWFyU3VmZml4Iiwic2hvd01vbnRoQWZ0ZXJZZWFyIiwicHJldmlvdXNNb250aCIsIm51bWJlck9mTW9udGhzIiwibmV4dE1vbnRoIiwicmVuZGVyVGFibGUiLCJQbGFpblBpY2tlciIsIm9wdGlvbnMiLCJzZWxmIiwiY29uZmlnIiwiX29uTW91c2VEb3duIiwiX3YiLCJldmVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJwYXJlbnROb2RlIiwibG9nIiwic2V0RGF0ZSIsImdldEF0dHJpYnV0ZSIsImJvdW5kIiwicmFuZ2VTZWxlY3QiLCJoaWRlIiwiYmx1ckZpZWxkT25TZWxlY3QiLCJmaWVsZCIsImJsdXIiLCJwcmV2TW9udGgiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwiX2MiLCJfb25DaGFuZ2UiLCJnb3RvTW9udGgiLCJ2YWx1ZSIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiaXNWaXNpYmxlIiwia2V5Q29kZSIsImFkanVzdERhdGUiLCJfb25JbnB1dENoYW5nZSIsImZpcmVkQnkiLCJwYXJzZSIsImZvcm1hdCIsInNob3ciLCJfb25JbnB1dEZvY3VzIiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfYiIsInNldFRpbWVvdXQiLCJfb25DbGljayIsInRyaWdnZXIiLCJjcmVhdGVFbGVtZW50IiwidGhlbWUiLCJjb250YWluZXIiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJpbnNlcnRCZWZvcmUiLCJuZXh0U2libGluZyIsImRlZmF1bHREYXRlIiwic2V0RGVmYXVsdERhdGUiLCJkZWZEYXRlIiwiZ290b0RhdGUiLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJub20iLCJwYXJzZUludCIsIm1pbkRhdGUiLCJtYXhEYXRlIiwic2V0TWluRGF0ZSIsInNldE1heERhdGUiLCJmYWxsYmFjayIsImdldEZ1bGxZZWFyIiwiX2QiLCJ0b0RhdGVTdHJpbmciLCJwcmV2ZW50T25TZWxlY3QiLCJkcmF3IiwibWluIiwibWF4Iiwib25TZWxlY3QiLCJnZXREYXRlIiwibmV3Q2FsZW5kYXIiLCJjYWxlbmRhcnMiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwibGVuZ3RoIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsImdldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwic2lnbiIsImRpZmZlcmVuY2UiLCJuZXdEYXkiLCJ2YWx1ZU9mIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiZm9yY2UiLCJfeSIsIl9tIiwicmFuZG9tIiwic3Vic3RyIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwidHlwZSIsImZvY3VzIiwib25EcmF3Iiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJwb3NpdGlvbiIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwibGVmdCIsInRvcCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJwYWdlWE9mZnNldCIsImJvdHRvbSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRQYXJlbnQiLCJyZXBvc2l0aW9uIiwibm93IiwiYmVmb3JlIiwicm93IiwieWVhck9mUHJldmlvdXNNb250aCIsInllYXJPZk5leHRNb250aCIsImRheXNJblByZXZpb3VzTW9udGgiLCJjZWxscyIsImFmdGVyIiwiaXNXZWVrU2VsZWN0ZWQiLCJyIiwiZXZlbnRzIiwiZGF5TnVtYmVyIiwibW9udGhOdW1iZXIiLCJ5ZWFyTnVtYmVyIiwiZGF5Q29uZmlnIiwidW5zaGlmdCIs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
