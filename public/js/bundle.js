'use strict';

(function () {
  /**
   * feature detection and helper functions
   */
  var document = window.document;
  var addEvent = function (el, e, callback, capture) {
    el.addEventListener(e, callback, !!capture);
  };

  var removeEvent = function (el, e, callback, capture) {
    el.removeEventListener(e, callback, !!capture);
  };

  var trim = function (str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
  };

  var hasClass = function (el, cn) {
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1
  };

  var addClass = function (el, cn) {
    if (!hasClass(el, cn)) {
      el.className = (el.className === '') ? cn : el.className + ' ' + cn;
    }
  };

  var removeClass = function (el, cn) {
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
  };

  var isArray = function (obj) {
    return (/Array/).test(Object.prototype.toString.call(obj))
  };

  var isDate = function (obj) {
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
  };

  var isWeekend = function (date) {
    var day = date.getDay();
    return day === 0 || day === 6
  };

  var isLeapYear = function (year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  };

  var getDaysInMonth = function (year, month) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  };

  var setToStartOfDay = function (date) {
    if (isDate(date)) date.setHours(0, 0, 0, 0);
  };

  var compareDates = function (a, b) {
    return a.getTime() === b.getTime()
  };

  var extend = function (to, from, overwrite) {
    var prop, hasProp;
    for (prop in from) {
      hasProp = to[prop] !== undefined;
      if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
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
    return to
  };

  var fireEvent = function (el, eventName, data) {
    var ev;

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

  var adjustCalendar = function (calendar) {
    if (calendar.month < 0) {
      calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
      calendar.month += 12;
    }
    if (calendar.month > 11) {
      calendar.year += Math.floor(Math.abs(calendar.month) / 12);
      calendar.month -= 12;
    }
    return calendar
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
  };

  /**
   * templating functions to abstract HTML rendering
   */
  var renderDayName = function (opts, day, abbr) {
    day += opts.firstDay;
    while (day >= 7) {
      day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day]
  };

  var renderDay = function (opts) {
    var arr = [];
    var ariaSelected = 'false';
    if (opts.isEmpty) {
      if (opts.showDaysInNextAndPreviousMonths) {
        arr.push('is-outside-current-month');

        if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
          arr.push('is-selection-disabled');
        }
      } else {
        return '<td class="is-empty"></td>'
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
    return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
        '<button class="datepicker__button datepicker__day" type="button" ' +
        'data-datepicker-year="' + opts.year + '" data-datepicker-month="' + opts.month + '" data-datepicker-day="' + opts.day + '">' +
        opts.day +
        '</button>' +
        '</td>'
  };

  var renderWeek = function (d, m, y) {
    var onejan = new Date(y, 0, 1);
    var weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return '<td class="datepicker__week">' + weekNum + '</td>'
  };

  var renderRow = function (days, isRTL, pickWholeWeek, isRowSelected) {
    return '<tr class="datepicker__row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>'
  };

  var renderBody = function (rows) {
    return '<tbody>' + rows.join('') + '</tbody>'
  };

  var renderHead = function (opts) {
    var i;
    var arr = [];
    if (opts.showWeekNumber) {
      arr.push('<th></th>');
    }
    for (i = 0; i < 7; i++) {
      arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
    }
    return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>'
  };

  var renderTitle = function (instance, c, year, month, refYear, randId) {
    var i;
    var j;
    var arr;
    var opts = instance._o;
    var isMinYear = year === opts.minYear;
    var isMaxYear = year === opts.maxYear;
    var html = '<div id="' + randId + '" class="datepicker__title" role="heading" aria-live="assertive">';
    var monthHtml;
    var yearHtml;
    var prev = true;
    var next = true;

    for (arr = [], i = 0; i < 12; i++) {
      arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
          (i === month ? ' selected="selected"' : '') +
          ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled="disabled"' : '') + '>' +
          opts.i18n.months[i] + '</option>');
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
        arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + (i) + '</option>');
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
      html += '<button class="datepicker__prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
    }
    if (c === (instance._o.numberOfMonths - 1)) {
      html += '<button class="datepicker__next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
    }

    html += '</div>';

    return html
  };

  var renderTable = function (opts, data, randId) {
    return '<table cellpadding="0" cellspacing="0" class="datepicker__table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>'
  };

  /**
   * PlainPicker constructor
   */
  var PlainPicker = function (options) {
    var self = this;
    var opts = self.config(options);

    self._onMouseDown = function (e) {
      if (!self._v) {
        return
      }
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return
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
          return false
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
        return
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
            break
          case 37:
            e.preventDefault();
            self.adjustDate('subtract', 1);
            break
          case 38:
            self.adjustDate('subtract', 7);
            break
          case 39:
            self.adjustDate('add', 1);
            break
          case 40:
            self.adjustDate('add', 7);
            break
        }
      }
    };

    self._onInputChange = function (e) {
      var date;

      if (e.firedBy === self) {
        return
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
          return
        }
      }
      while ((pEl = pEl.parentNode))

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
        return
      }
      do {
        if (hasClass(pEl, 'datepicker') || pEl === opts.trigger) {
          return
        }
      }
      while ((pEl = pEl.parentNode))
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
    config: function (options) {
      if (!this._o) {
        this._o = extend({}, defaults, true);
      }

      var opts = extend(this._o, options, true);

      opts.isRTL = !!opts.isRTL;

      opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

      opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

      opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

      opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

      opts.disableWeekends = !!opts.disableWeekends;

      opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

      var nom = parseInt(opts.numberOfMonths, 10) || 1;
      opts.numberOfMonths = nom > 4 ? 4 : nom;

      if (!isDate(opts.minDate)) {
        opts.minDate = false;
      }
      if (!isDate(opts.maxDate)) {
        opts.maxDate = false;
      }
      if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
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

      return opts
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function (format) {
      format = format || this._o.format;
      if (!isDate(this._d)) {
        return ''
      }
      if (this._o.toString) {
        return this._o.toString(this._d, format)
      }

      return this._d.toDateString()
    },

    /**
     * return a Date object of the current selection
     */
    getDate: function () {
      return isDate(this._d) ? new Date(this._d.getTime()) : null
    },

    /**
     * set the current selection
     */
    setDate: function (date, preventOnSelect) {
      if (!date) {
        this._d = null;

        if (this._o.field) {
          this._o.field.value = '';
          fireEvent(this._o.field, 'change', {
            firedBy: this
          });
        }

        return this.draw()
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!isDate(date)) {
        return
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
    gotoDate: function (date) {
      var newCalendar = true;

      if (!isDate(date)) {
        return
      }

      if (this.calendars) {
        var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1);
        var lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1);
        var visibleDate = date.getTime();
        // get the end of the month
        lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
        lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
        newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
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

    adjustDate: function (sign, days) {
      var day = this.getDate() || new Date();
      var difference = parseInt(days) * 24 * 60 * 60 * 1000;

      var newDay;

      if (sign === 'add') {
        newDay = new Date(day.valueOf() + difference);
      } else if (sign === 'subtract') {
        newDay = new Date(day.valueOf() - difference);
      }

      this.setDate(newDay);
    },

    adjustCalendars: function () {
      this.calendars[0] = adjustCalendar(this.calendars[0]);
      for (var c = 1; c < this._o.numberOfMonths; c++) {
        this.calendars[c] = adjustCalendar({
          month: this.calendars[0].month + c,
          year: this.calendars[0].year
        });
      }
      this.draw();
    },

    gotoToday: function () {
      this.gotoDate(new Date());
    },

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth: function (month) {
      if (!isNaN(month)) {
        this.calendars[0].month = parseInt(month, 10);
        this.adjustCalendars();
      }
    },

    nextMonth: function () {
      this.calendars[0].month++;
      this.adjustCalendars();
    },

    prevMonth: function () {
      this.calendars[0].month--;
      this.adjustCalendars();
    },

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear: function (year) {
      if (!isNaN(year)) {
        this.calendars[0].year = parseInt(year, 10);
        this.adjustCalendars();
      }
    },

    /**
     * change the minDate
     */
    setMinDate: function (value) {
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
    setMaxDate: function (value) {
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

    setStartRange: function (value) {
      this._o.startRange = value;
    },

    setEndRange: function (value) {
      this._o.endRange = value;
    },

    /**
     * refresh the HTML
     */
    draw: function (force) {
      if (!this._v && !force) {
        return
      }

      var opts = this._o;
      var minYear = opts.minYear;
      var maxYear = opts.maxYear;
      var minMonth = opts.minMonth;
      var maxMonth = opts.maxMonth;
      var html = '';
      var randId;

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

      for (var c = 0; c < opts.numberOfMonths; c++) {
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

    adjustPosition: function () {
      var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect;

      if (this._o.container) return

      this.el.style.position = 'absolute';

      field = this._o.trigger;
      pEl = field;
      width = this.el.offsetWidth;
      height = this.el.offsetHeight;
      viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

      if (typeof field.getBoundingClientRect === 'function') {
        clientRect = field.getBoundingClientRect();
        left = clientRect.left + window.pageXOffset;
        top = clientRect.bottom + window.pageYOffset;
      } else {
        left = pEl.offsetLeft;
        top = pEl.offsetTop + pEl.offsetHeight;
        while ((pEl = pEl.offsetParent)) {
          left += pEl.offsetLeft;
          top += pEl.offsetTop;
        }
      }

      // default position is bottom & left
      if ((this._o.reposition && left + width > viewportWidth) ||
        (
          this._o.position.indexOf('right') > -1 &&
          left - width + field.offsetWidth > 0
        )
      ) {
        left = left - width + field.offsetWidth;
      }
      if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
        (
          this._o.position.indexOf('top') > -1 &&
          top - height - field.offsetHeight > 0
        )
      ) {
        top = top - height - field.offsetHeight;
      }

      this.el.style.left = left + 'px';
      this.el.style.top = top + 'px';
    },

    /**
     * render HTML for a particular month
     */
    render: function (year, month, randId) {
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
      for (var i = 0, r = 0; i < cells; i++) {
        var day = new Date(year, month, 1 + (i - before));
        var isSelected = isDate(this._d) ? compareDates(day, this._d) : false;
        var isToday = compareDates(day, now);
        var hasEvent = opts.events.indexOf(day.toDateString()) !== -1;
        var isEmpty = i < before || i >= (days + before);
        var dayNumber = 1 + (i - before);
        var monthNumber = month;
        var yearNumber = year;
        var isStartRange = opts.startRange && compareDates(opts.startRange, day);
        var isEndRange = opts.endRange && compareDates(opts.endRange, day);
        var isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;
        var isDisabled = (opts.minDate && day < opts.minDate) ||
          (opts.maxDate && day > opts.maxDate) ||
          (opts.disableWeekends && isWeekend(day)) ||
          (opts.disableDayFn && opts.disableDayFn(day));

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
      return renderTable(opts, data, randId)
    },

    isVisible: function () {
      return this._v
    },

    show: function () {
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

    hide: function () {
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

    /**
     * GAME OVER
     */
    destroy: function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBmZWF0dXJlIGRldGVjdGlvbiBhbmQgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgdmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50XG4gIHZhciBhZGRFdmVudCA9IGZ1bmN0aW9uIChlbCwgZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGUsIGNhbGxiYWNrLCAhIWNhcHR1cmUpXG4gIH1cblxuICB2YXIgcmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiAoZWwsIGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuICB9XG5cbiAgdmFyIHRyaW0gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgfVxuXG4gIHZhciBoYXNDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY24pIHtcbiAgICByZXR1cm4gKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykuaW5kZXhPZignICcgKyBjbiArICcgJykgIT09IC0xXG4gIH1cblxuICB2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbiAoZWwsIGNuKSB7XG4gICAgaWYgKCFoYXNDbGFzcyhlbCwgY24pKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSAoZWwuY2xhc3NOYW1lID09PSAnJykgPyBjbiA6IGVsLmNsYXNzTmFtZSArICcgJyArIGNuXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGVsLCBjbikge1xuICAgIGVsLmNsYXNzTmFtZSA9IHRyaW0oKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbiArICcgJywgJyAnKSlcbiAgfVxuXG4gIHZhciBpc0FycmF5ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiAoL0FycmF5LykudGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcbiAgfVxuXG4gIHZhciBpc0RhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuICgvRGF0ZS8pLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuICB9XG5cbiAgdmFyIGlzV2Vla2VuZCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgdmFyIGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgdmFyIGlzTGVhcFllYXIgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgIHJldHVybiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCkgfHwgKHllYXIgJSA0MDAgPT09IDApXG4gIH1cblxuICB2YXIgZ2V0RGF5c0luTW9udGggPSBmdW5jdGlvbiAoeWVhciwgbW9udGgpIHtcbiAgICByZXR1cm4gWzMxLCBpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdW21vbnRoXVxuICB9XG5cbiAgdmFyIHNldFRvU3RhcnRPZkRheSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgaWYgKGlzRGF0ZShkYXRlKSkgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICB9XG5cbiAgdmFyIGNvbXBhcmVEYXRlcyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICB9XG5cbiAgdmFyIGV4dGVuZCA9IGZ1bmN0aW9uICh0bywgZnJvbSwgb3ZlcndyaXRlKSB7XG4gICAgdmFyIHByb3AsIGhhc1Byb3BcbiAgICBmb3IgKHByb3AgaW4gZnJvbSkge1xuICAgICAgaGFzUHJvcCA9IHRvW3Byb3BdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmIChoYXNQcm9wICYmIHR5cGVvZiBmcm9tW3Byb3BdID09PSAnb2JqZWN0JyAmJiBmcm9tW3Byb3BdICE9PSBudWxsICYmIGZyb21bcHJvcF0ubm9kZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXNEYXRlKGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBuZXcgRGF0ZShmcm9tW3Byb3BdLmdldFRpbWUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXS5zbGljZSgwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b1twcm9wXSA9IGV4dGVuZCh7fSwgZnJvbVtwcm9wXSwgb3ZlcndyaXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG92ZXJ3cml0ZSB8fCAhaGFzUHJvcCkge1xuICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvXG4gIH1cblxuICB2YXIgZmlyZUV2ZW50ID0gZnVuY3Rpb24gKGVsLCBldmVudE5hbWUsIGRhdGEpIHtcbiAgICB2YXIgZXZcblxuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpXG4gICAgICBldi5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSlcbiAgICAgIGV2ID0gZXh0ZW5kKGV2LCBkYXRhKVxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChldilcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KClcbiAgICAgIGV2ID0gZXh0ZW5kKGV2LCBkYXRhKVxuICAgICAgZWwuZmlyZUV2ZW50KCdvbicgKyBldmVudE5hbWUsIGV2KVxuICAgIH1cbiAgfVxuXG4gIHZhciBhZGp1c3RDYWxlbmRhciA9IGZ1bmN0aW9uIChjYWxlbmRhcikge1xuICAgIGlmIChjYWxlbmRhci5tb250aCA8IDApIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgLT0gTWF0aC5jZWlsKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggKz0gMTJcbiAgICB9XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoID4gMTEpIHtcbiAgICAgIGNhbGVuZGFyLnllYXIgKz0gTWF0aC5mbG9vcihNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoIC09IDEyXG4gICAgfVxuICAgIHJldHVybiBjYWxlbmRhclxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmF1bHRzIGFuZCBsb2NhbGlzYXRpb25cbiAgICovXG4gIHZhciBkZWZhdWx0cyA9IHtcblxuICAgIC8vIGJpbmQgdGhlIHBpY2tlciB0byBhIGZvcm0gZmllbGRcbiAgICBmaWVsZDogbnVsbCxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgc2hvdy9oaWRlIHRoZSBwaWNrZXIgb24gYGZpZWxkYCBmb2N1cyAoZGVmYXVsdCBgdHJ1ZWAgaWYgYGZpZWxkYCBpcyBzZXQpXG4gICAgYm91bmQ6IHVuZGVmaW5lZCxcblxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyLCByZWxhdGl2ZSB0byB0aGUgZmllbGQgKGRlZmF1bHQgdG8gYm90dG9tICYgbGVmdClcbiAgICAvLyAoJ2JvdHRvbScgJiAnbGVmdCcga2V5d29yZHMgYXJlIG5vdCB1c2VkLCAndG9wJyAmICdyaWdodCcgYXJlIG1vZGlmaWVyIG9uIHRoZSBib3R0b20vbGVmdCBwb3NpdGlvbilcbiAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgZml0IGluIHRoZSB2aWV3cG9ydCBldmVuIGlmIGl0IG1lYW5zIHJlcG9zaXRpb25pbmcgZnJvbSB0aGUgcG9zaXRpb24gb3B0aW9uXG4gICAgcmVwb3NpdGlvbjogdHJ1ZSxcblxuICAgIC8vIHRoZSBkZWZhdWx0IG91dHB1dCBmb3JtYXQgZm9yIGAudG9TdHJpbmcoKWAgYW5kIGBmaWVsZGAgdmFsdWVcbiAgICBmb3JtYXQ6ICdZWVlZLU1NLUREJyxcblxuICAgIC8vIHRoZSB0b1N0cmluZyBmdW5jdGlvbiB3aGljaCBnZXRzIHBhc3NlZCBhIGN1cnJlbnQgZGF0ZSBvYmplY3QgYW5kIGZvcm1hdFxuICAgIC8vIGFuZCByZXR1cm5zIGEgc3RyaW5nXG4gICAgdG9TdHJpbmc6IG51bGwsXG5cbiAgICAvLyB1c2VkIHRvIGNyZWF0ZSBkYXRlIG9iamVjdCBmcm9tIGN1cnJlbnQgaW5wdXQgc3RyaW5nXG4gICAgcGFyc2U6IG51bGwsXG5cbiAgICAvLyB0aGUgaW5pdGlhbCBkYXRlIHRvIHZpZXcgd2hlbiBmaXJzdCBvcGVuZWRcbiAgICBkZWZhdWx0RGF0ZTogbnVsbCxcblxuICAgIC8vIG1ha2UgdGhlIGBkZWZhdWx0RGF0ZWAgdGhlIGluaXRpYWwgc2VsZWN0ZWQgdmFsdWVcbiAgICBzZXREZWZhdWx0RGF0ZTogZmFsc2UsXG5cbiAgICAvLyBmaXJzdCBkYXkgb2Ygd2VlayAoMDogU3VuZGF5LCAxOiBNb25kYXkgZXRjKVxuICAgIGZpcnN0RGF5OiAwLFxuXG4gICAgLy8gdGhlIGRlZmF1bHQgZmxhZyBmb3IgbW9tZW50J3Mgc3RyaWN0IGRhdGUgcGFyc2luZ1xuICAgIGZvcm1hdFN0cmljdDogZmFsc2UsXG5cbiAgICAvLyB0aGUgbWluaW11bS9lYXJsaWVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgbWluRGF0ZTogbnVsbCxcbiAgICAvLyB0aGUgbWF4aW11bS9sYXRlc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1heERhdGU6IG51bGwsXG5cbiAgICAvLyBudW1iZXIgb2YgeWVhcnMgZWl0aGVyIHNpZGUsIG9yIGFycmF5IG9mIHVwcGVyL2xvd2VyIHJhbmdlXG4gICAgeWVhclJhbmdlOiAxMCxcblxuICAgIC8vIHNob3cgd2VlayBudW1iZXJzIGF0IGhlYWQgb2Ygcm93XG4gICAgc2hvd1dlZWtOdW1iZXI6IGZhbHNlLFxuXG4gICAgLy8gV2VlayBwaWNrZXIgbW9kZVxuICAgIHBpY2tXaG9sZVdlZWs6IGZhbHNlLFxuXG4gICAgLy8gdXNlZCBpbnRlcm5hbGx5IChkb24ndCBjb25maWcgb3V0c2lkZSlcbiAgICBtaW5ZZWFyOiAwLFxuICAgIG1heFllYXI6IDk5OTksXG4gICAgbWluTW9udGg6IHVuZGVmaW5lZCxcbiAgICBtYXhNb250aDogdW5kZWZpbmVkLFxuXG4gICAgc3RhcnRSYW5nZTogbnVsbCxcbiAgICBlbmRSYW5nZTogbnVsbCxcblxuICAgIGlzUlRMOiBmYWxzZSxcblxuICAgIC8vIEFkZGl0aW9uYWwgdGV4dCB0byBhcHBlbmQgdG8gdGhlIHllYXIgaW4gdGhlIGNhbGVuZGFyIHRpdGxlXG4gICAgeWVhclN1ZmZpeDogJycsXG5cbiAgICAvLyBSZW5kZXIgdGhlIG1vbnRoIGFmdGVyIHllYXIgaW4gdGhlIGNhbGVuZGFyIHRpdGxlXG4gICAgc2hvd01vbnRoQWZ0ZXJZZWFyOiBmYWxzZSxcblxuICAgIC8vIFJlbmRlciBkYXlzIG9mIHRoZSBjYWxlbmRhciBncmlkIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IGZhbHNlLFxuXG4gICAgLy8gQWxsb3dzIHVzZXIgdG8gc2VsZWN0IGRheXMgdGhhdCBmYWxsIGluIHRoZSBuZXh0IG9yIHByZXZpb3VzIG1vbnRoXG4gICAgZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIGhvdyBtYW55IG1vbnRocyBhcmUgdmlzaWJsZVxuICAgIG51bWJlck9mTW9udGhzOiAxLFxuXG4gICAgLy8gd2hlbiBudW1iZXJPZk1vbnRocyBpcyB1c2VkLCB0aGlzIHdpbGwgaGVscCB5b3UgdG8gY2hvb3NlIHdoZXJlIHRoZSBtYWluIGNhbGVuZGFyIHdpbGwgYmUgKGRlZmF1bHQgYGxlZnRgLCBjYW4gYmUgc2V0IHRvIGByaWdodGApXG4gICAgLy8gb25seSB1c2VkIGZvciB0aGUgZmlyc3QgZGlzcGxheSBvciB3aGVuIGEgc2VsZWN0ZWQgZGF0ZSBpcyBub3QgdmlzaWJsZVxuICAgIG1haW5DYWxlbmRhcjogJ2xlZnQnLFxuXG4gICAgLy8gU3BlY2lmeSBhIERPTSBlbGVtZW50IHRvIHJlbmRlciB0aGUgY2FsZW5kYXIgaW5cbiAgICBjb250YWluZXI6IHVuZGVmaW5lZCxcblxuICAgIC8vIEJsdXIgZmllbGQgd2hlbiBkYXRlIGlzIHNlbGVjdGVkXG4gICAgYmx1ckZpZWxkT25TZWxlY3Q6IHRydWUsXG5cbiAgICAvLyBpbnRlcm5hdGlvbmFsaXphdGlvblxuICAgIGkxOG46IHtcbiAgICAgIHByZXZpb3VzTW9udGg6ICdQcmV2IE1vbnRoJyxcbiAgICAgIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICAgICAgbW9udGhzOiBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzEwJywgJzExJywgJzEyJ10sXG4gICAgICB3ZWVrZGF5czogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAgICAgd2Vla2RheXNTaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXVxuICAgIH0sXG5cbiAgICAvLyBUaGVtZSBDbGFzc25hbWVcbiAgICB0aGVtZTogbnVsbCxcblxuICAgIC8vIGV2ZW50cyBhcnJheVxuICAgIGV2ZW50czogW10sXG5cbiAgICByYW5nZVNlbGVjdDogZmFsc2UsXG5cbiAgICAvLyBjYWxsYmFjayBmdW5jdGlvblxuICAgIG9uU2VsZWN0OiBudWxsLFxuICAgIG9uT3BlbjogbnVsbCxcbiAgICBvbkNsb3NlOiBudWxsLFxuICAgIG9uRHJhdzogbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIHRlbXBsYXRpbmcgZnVuY3Rpb25zIHRvIGFic3RyYWN0IEhUTUwgcmVuZGVyaW5nXG4gICAqL1xuICB2YXIgcmVuZGVyRGF5TmFtZSA9IGZ1bmN0aW9uIChvcHRzLCBkYXksIGFiYnIpIHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIHZhciByZW5kZXJEYXkgPSBmdW5jdGlvbiAob3B0cykge1xuICAgIHZhciBhcnIgPSBbXVxuICAgIHZhciBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNUb2RheSkge1xuICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5JylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkge1xuICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG4gICAgfVxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuICAgIH1cbiAgICBpZiAob3B0cy5pc1N0YXJ0UmFuZ2UpIHtcbiAgICAgIGFyci5wdXNoKCdpcy1zdGFydHJhbmdlJylcbiAgICB9XG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xuICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcbiAgICB9XG4gICAgcmV0dXJuICc8dGQgZGF0YS1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCIgY2xhc3M9XCInICsgYXJyLmpvaW4oJyAnKSArICdcIiBhcmlhLXNlbGVjdGVkPVwiJyArIGFyaWFTZWxlY3RlZCArICdcIj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyX19idXR0b24gZGF0ZXBpY2tlcl9fZGF5XCIgdHlwZT1cImJ1dHRvblwiICcgK1xuICAgICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICsgb3B0cy55ZWFyICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1tb250aD1cIicgKyBvcHRzLm1vbnRoICsgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICsgb3B0cy5kYXkgKyAnXCI+JyArXG4gICAgICAgIG9wdHMuZGF5ICtcbiAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAnPC90ZD4nXG4gIH1cblxuICB2YXIgcmVuZGVyV2VlayA9IGZ1bmN0aW9uIChkLCBtLCB5KSB7XG4gICAgdmFyIG9uZWphbiA9IG5ldyBEYXRlKHksIDAsIDEpXG4gICAgdmFyIHdlZWtOdW0gPSBNYXRoLmNlaWwoKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDApICsgb25lamFuLmdldERheSgpICsgMSkgLyA3KVxuICAgIHJldHVybiAnPHRkIGNsYXNzPVwiZGF0ZXBpY2tlcl9fd2Vla1wiPicgKyB3ZWVrTnVtICsgJzwvdGQ+J1xuICB9XG5cbiAgdmFyIHJlbmRlclJvdyA9IGZ1bmN0aW9uIChkYXlzLCBpc1JUTCwgcGlja1dob2xlV2VlaywgaXNSb3dTZWxlY3RlZCkge1xuICAgIHJldHVybiAnPHRyIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcm93JyArIChwaWNrV2hvbGVXZWVrID8gJyBwaWNrLXdob2xlLXdlZWsnIDogJycpICsgKGlzUm93U2VsZWN0ZWQgPyAnIGlzLXNlbGVjdGVkJyA6ICcnKSArICdcIj4nICsgKGlzUlRMID8gZGF5cy5yZXZlcnNlKCkgOiBkYXlzKS5qb2luKCcnKSArICc8L3RyPidcbiAgfVxuXG4gIHZhciByZW5kZXJCb2R5ID0gZnVuY3Rpb24gKHJvd3MpIHtcbiAgICByZXR1cm4gJzx0Ym9keT4nICsgcm93cy5qb2luKCcnKSArICc8L3Rib2R5PidcbiAgfVxuXG4gIHZhciByZW5kZXJIZWFkID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgICB2YXIgaVxuICAgIHZhciBhcnIgPSBbXVxuICAgIGlmIChvcHRzLnNob3dXZWVrTnVtYmVyKSB7XG4gICAgICBhcnIucHVzaCgnPHRoPjwvdGg+JylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgYXJyLnB1c2goJzx0aCBzY29wZT1cImNvbFwiPjxhYmJyIHRpdGxlPVwiJyArIHJlbmRlckRheU5hbWUob3B0cywgaSkgKyAnXCI+JyArIHJlbmRlckRheU5hbWUob3B0cywgaSwgdHJ1ZSkgKyAnPC9hYmJyPjwvdGg+JylcbiAgICB9XG4gICAgcmV0dXJuICc8dGhlYWQ+PHRyPicgKyAob3B0cy5pc1JUTCA/IGFyci5yZXZlcnNlKCkgOiBhcnIpLmpvaW4oJycpICsgJzwvdHI+PC90aGVhZD4nXG4gIH1cblxuICB2YXIgcmVuZGVyVGl0bGUgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIGMsIHllYXIsIG1vbnRoLCByZWZZZWFyLCByYW5kSWQpIHtcbiAgICB2YXIgaVxuICAgIHZhciBqXG4gICAgdmFyIGFyclxuICAgIHZhciBvcHRzID0gaW5zdGFuY2UuX29cbiAgICB2YXIgaXNNaW5ZZWFyID0geWVhciA9PT0gb3B0cy5taW5ZZWFyXG4gICAgdmFyIGlzTWF4WWVhciA9IHllYXIgPT09IG9wdHMubWF4WWVhclxuICAgIHZhciBodG1sID0gJzxkaXYgaWQ9XCInICsgcmFuZElkICsgJ1wiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGl0bGVcIiByb2xlPVwiaGVhZGluZ1wiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPidcbiAgICB2YXIgbW9udGhIdG1sXG4gICAgdmFyIHllYXJIdG1sXG4gICAgdmFyIHByZXYgPSB0cnVlXG4gICAgdmFyIG5leHQgPSB0cnVlXG5cbiAgICBmb3IgKGFyciA9IFtdLCBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgIGFyci5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiJyArICh5ZWFyID09PSByZWZZZWFyID8gaSAtIGMgOiAxMiArIGkgLSBjKSArICdcIicgK1xuICAgICAgICAgIChpID09PSBtb250aCA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArXG4gICAgICAgICAgKChpc01pblllYXIgJiYgaSA8IG9wdHMubWluTW9udGgpIHx8IChpc01heFllYXIgJiYgaSA+IG9wdHMubWF4TW9udGgpID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJykgKyAnPicgK1xuICAgICAgICAgIG9wdHMuaTE4bi5tb250aHNbaV0gKyAnPC9vcHRpb24+JylcbiAgICB9XG5cbiAgICBtb250aEh0bWwgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xhYmVsXCI+JyArIG9wdHMuaTE4bi5tb250aHNbbW9udGhdICsgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoXCIgdGFiaW5kZXg9XCItMVwiPicgKyBhcnIuam9pbignJykgKyAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICBpID0gb3B0cy55ZWFyUmFuZ2VbMF1cbiAgICAgIGogPSBvcHRzLnllYXJSYW5nZVsxXSArIDFcbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZVxuICAgICAgaiA9IDEgKyB5ZWFyICsgb3B0cy55ZWFyUmFuZ2VcbiAgICB9XG5cbiAgICBmb3IgKGFyciA9IFtdOyBpIDwgaiAmJiBpIDw9IG9wdHMubWF4WWVhcjsgaSsrKSB7XG4gICAgICBpZiAoaSA+PSBvcHRzLm1pblllYXIpIHtcbiAgICAgICAgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIChpKSArICc8L29wdGlvbj4nKVxuICAgICAgfVxuICAgIH1cbiAgICB5ZWFySHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICsgeWVhciArIG9wdHMueWVhclN1ZmZpeCArICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC15ZWFyXCIgdGFiaW5kZXg9XCItMVwiPicgKyBhcnIuam9pbignJykgKyAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKG9wdHMuc2hvd01vbnRoQWZ0ZXJZZWFyKSB7XG4gICAgICBodG1sICs9IHllYXJIdG1sICsgbW9udGhIdG1sXG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgKz0gbW9udGhIdG1sICsgeWVhckh0bWxcbiAgICB9XG5cbiAgICBpZiAoaXNNaW5ZZWFyICYmIChtb250aCA9PT0gMCB8fCBvcHRzLm1pbk1vbnRoID49IG1vbnRoKSkge1xuICAgICAgcHJldiA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKGlzTWF4WWVhciAmJiAobW9udGggPT09IDExIHx8IG9wdHMubWF4TW9udGggPD0gbW9udGgpKSB7XG4gICAgICBuZXh0ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoYyA9PT0gMCkge1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX3ByZXYnICsgKHByZXYgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArICdcIiB0eXBlPVwiYnV0dG9uXCI+JyArIG9wdHMuaTE4bi5wcmV2aW91c01vbnRoICsgJzwvYnV0dG9uPidcbiAgICB9XG4gICAgaWYgKGMgPT09IChpbnN0YW5jZS5fby5udW1iZXJPZk1vbnRocyAtIDEpKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fbmV4dCcgKyAobmV4dCA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLm5leHRNb250aCArICc8L2J1dHRvbj4nXG4gICAgfVxuXG4gICAgaHRtbCArPSAnPC9kaXY+J1xuXG4gICAgcmV0dXJuIGh0bWxcbiAgfVxuXG4gIHZhciByZW5kZXJUYWJsZSA9IGZ1bmN0aW9uIChvcHRzLCBkYXRhLCByYW5kSWQpIHtcbiAgICByZXR1cm4gJzx0YWJsZSBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RhYmxlXCIgcm9sZT1cImdyaWRcIiBhcmlhLWxhYmVsbGVkYnk9XCInICsgcmFuZElkICsgJ1wiPicgKyByZW5kZXJIZWFkKG9wdHMpICsgcmVuZGVyQm9keShkYXRhKSArICc8L3RhYmxlPidcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGFpblBpY2tlciBjb25zdHJ1Y3RvclxuICAgKi9cbiAgdmFyIFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB2YXIgb3B0cyA9IHNlbGYuY29uZmlnKG9wdGlvbnMpXG5cbiAgICBzZWxmLl9vbk1vdXNlRG93biA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoIXNlbGYuX3YpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWRpc2FibGVkJykpIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX2J1dHRvbicpICYmICFoYXNDbGFzcyh0YXJnZXQsICdpcy1lbXB0eScpICYmICFoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2lzLWRpc2FibGVkJykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaXMtZGF0ZScpXG4gICAgICAgICAgc2VsZi5zZXREYXRlKG5ldyBEYXRlKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci15ZWFyJyksIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItZGF5JykpKVxuICAgICAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy8gc2VsZWN0YWJsZSBkYXRlIHJhbmdlIG9uIHNpbmdsZSBjYWxlbmRhclxuICAgICAgICAgICAgICBpZiAob3B0cy5yYW5nZVNlbGVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyYW5nZVNlbGVjdGFibGUnKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgICAgICAgICAgaWYgKG9wdHMuYmx1ckZpZWxkT25TZWxlY3QgJiYgb3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fcHJldicpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2lzLXByZXYnKVxuICAgICAgICAgIHNlbGYucHJldk1vbnRoKClcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19uZXh0JykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaXMtbmV4dCcpXG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICAgIGNvbnNvbGUubG9nKCdpcy1zZWxlY3QnKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDxzZWxlY3Q+XG4gICAgc2VsZi5fb25DaGFuZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QtbW9udGgnKSkge1xuICAgICAgICBzZWxmLmdvdG9Nb250aCh0YXJnZXQudmFsdWUpXG4gICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC15ZWFyJykpIHtcbiAgICAgICAgc2VsZi5nb3RvWWVhcih0YXJnZXQudmFsdWUpXG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnb25jaGFuZ2UnKVxuICAgIH1cblxuICAgIHNlbGYuX29uS2V5Q2hhbmdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuXG4gICAgICBpZiAoc2VsZi5pc1Zpc2libGUoKSkge1xuICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgIGlmIChvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgIGlmIChvcHRzLnJhbmdlU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3JhbmdlU2VsZWN0YWJsZScpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ3N1YnRyYWN0JywgMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDaGFuZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGRhdGVcblxuICAgICAgaWYgKGUuZmlyZWRCeSA9PT0gc2VsZikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLnBhcnNlKSB7XG4gICAgICAgIGRhdGUgPSBvcHRzLnBhcnNlKG9wdHMuZmllbGQudmFsdWUsIG9wdHMuZm9ybWF0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICB9XG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgfVxuICAgICAgaWYgKCFzZWxmLl92KSB7XG4gICAgICAgIHNlbGYuc2hvdygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Q2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRCbHVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHBFbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHNlbGYuX2IgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLmhpZGUoKVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICB2YXIgcEVsID0gdGFyZ2V0XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpIHx8IHBFbCA9PT0gb3B0cy50cmlnZ2VyKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzZWxmLmVsLmNsYXNzTmFtZSA9ICdkYXRlcGlja2VyJyArIChvcHRzLmlzUlRMID8gJyBpcy1ydGwnIDogJycpICsgKG9wdHMudGhlbWUgPyAnICcgKyBvcHRzLnRoZW1lIDogJycpXG5cbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2Vkb3duJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZkRhdGUgPSBvcHRzLmRlZmF1bHREYXRlXG5cbiAgICBpZiAoaXNEYXRlKGRlZkRhdGUpKSB7XG4gICAgICBpZiAob3B0cy5zZXREZWZhdWx0RGF0ZSkge1xuICAgICAgICBzZWxmLnNldERhdGUoZGVmRGF0ZSwgdHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuZ290b0RhdGUoZGVmRGF0ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgICAgc2VsZi5lbC5jbGFzc05hbWUgKz0gJyBpcy1ib3VuZCdcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2NsaWNrJywgc2VsZi5fb25JbnB1dENsaWNrKVxuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnZm9jdXMnLCBzZWxmLl9vbklucHV0Rm9jdXMpXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdibHVyJywgc2VsZi5fb25JbnB1dEJsdXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvdygpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHB1YmxpYyBQbGFpblBpY2tlciBBUElcbiAgICovXG4gIFBsYWluUGlja2VyLnByb3RvdHlwZSA9IHtcblxuICAgIC8qKlxuICAgICAqIGNvbmZpZ3VyZSBmdW5jdGlvbmFsaXR5XG4gICAgICovXG4gICAgY29uZmlnOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKCF0aGlzLl9vKSB7XG4gICAgICAgIHRoaXMuX28gPSBleHRlbmQoe30sIGRlZmF1bHRzLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9IGV4dGVuZCh0aGlzLl9vLCBvcHRpb25zLCB0cnVlKVxuXG4gICAgICBvcHRzLmlzUlRMID0gISFvcHRzLmlzUlRMXG5cbiAgICAgIG9wdHMuZmllbGQgPSAob3B0cy5maWVsZCAmJiBvcHRzLmZpZWxkLm5vZGVOYW1lKSA/IG9wdHMuZmllbGQgOiBudWxsXG5cbiAgICAgIG9wdHMudGhlbWUgPSAodHlwZW9mIG9wdHMudGhlbWUpID09PSAnc3RyaW5nJyAmJiBvcHRzLnRoZW1lID8gb3B0cy50aGVtZSA6IG51bGxcblxuICAgICAgb3B0cy5ib3VuZCA9ICEhKG9wdHMuYm91bmQgIT09IHVuZGVmaW5lZCA/IG9wdHMuZmllbGQgJiYgb3B0cy5ib3VuZCA6IG9wdHMuZmllbGQpXG5cbiAgICAgIG9wdHMudHJpZ2dlciA9IChvcHRzLnRyaWdnZXIgJiYgb3B0cy50cmlnZ2VyLm5vZGVOYW1lKSA/IG9wdHMudHJpZ2dlciA6IG9wdHMuZmllbGRcblxuICAgICAgb3B0cy5kaXNhYmxlV2Vla2VuZHMgPSAhIW9wdHMuZGlzYWJsZVdlZWtlbmRzXG5cbiAgICAgIG9wdHMuZGlzYWJsZURheUZuID0gKHR5cGVvZiBvcHRzLmRpc2FibGVEYXlGbikgPT09ICdmdW5jdGlvbicgPyBvcHRzLmRpc2FibGVEYXlGbiA6IG51bGxcblxuICAgICAgdmFyIG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkge1xuICAgICAgICBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkge1xuICAgICAgICBvcHRzLm1heERhdGUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKChvcHRzLm1pbkRhdGUgJiYgb3B0cy5tYXhEYXRlKSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgb3B0cy5tYXhEYXRlID0gb3B0cy5taW5EYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNaW5EYXRlKG9wdHMubWluRGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRNYXhEYXRlKG9wdHMubWF4RGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICAgIHZhciBmYWxsYmFjayA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSAtIDEwXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzBdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMF0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgICBvcHRzLnllYXJSYW5nZVsxXSA9IHBhcnNlSW50KG9wdHMueWVhclJhbmdlWzFdLCAxMCkgfHwgZmFsbGJhY2tcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMueWVhclJhbmdlID0gTWF0aC5hYnMocGFyc2VJbnQob3B0cy55ZWFyUmFuZ2UsIDEwKSkgfHwgZGVmYXVsdHMueWVhclJhbmdlXG4gICAgICAgIGlmIChvcHRzLnllYXJSYW5nZSA+IDEwMCkge1xuICAgICAgICAgIG9wdHMueWVhclJhbmdlID0gMTAwXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9wdHNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgZm9ybWF0dGVkIHN0cmluZyBvZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gKHVzaW5nIE1vbWVudC5qcyBpZiBhdmFpbGFibGUpXG4gICAgICovXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCB0aGlzLl9vLmZvcm1hdFxuICAgICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fby50b1N0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fby50b1N0cmluZyh0aGlzLl9kLCBmb3JtYXQpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9kLnRvRGF0ZVN0cmluZygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbiAoZGF0ZSwgcHJldmVudE9uU2VsZWN0KSB7XG4gICAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgdGhpcy5fZCA9IG51bGxcblxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICAgIHRoaXMuX28uZmllbGQudmFsdWUgPSAnJ1xuICAgICAgICAgIGZpcmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgICAgZmlyZWRCeTogdGhpc1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KClcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2UoZGF0ZSkpXG4gICAgICB9XG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdmFyIG1pbiA9IHRoaXMuX28ubWluRGF0ZVxuICAgICAgdmFyIG1heCA9IHRoaXMuX28ubWF4RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xuICAgICAgICBkYXRlID0gbWluXG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcbiAgICAgICAgZGF0ZSA9IG1heFxuICAgICAgfVxuXG4gICAgICB0aGlzLl9kID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkodGhpcy5fZClcbiAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5fZClcblxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgdGhpcy5fby5maWVsZC52YWx1ZSA9IHRoaXMudG9TdHJpbmcoKVxuICAgICAgICBmaXJlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHtcbiAgICAgICAgICBmaXJlZEJ5OiB0aGlzXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAoIXByZXZlbnRPblNlbGVjdCAmJiB0eXBlb2YgdGhpcy5fby5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vLm9uU2VsZWN0LmNhbGwodGhpcywgdGhpcy5nZXREYXRlKCkpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZGF0ZVxuICAgICAqL1xuICAgIGdvdG9EYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgdmFyIG5ld0NhbGVuZGFyID0gdHJ1ZVxuXG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY2FsZW5kYXJzKSB7XG4gICAgICAgIHZhciBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIHZhciBsYXN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS5tb250aCwgMSlcbiAgICAgICAgdmFyIHZpc2libGVEYXRlID0gZGF0ZS5nZXRUaW1lKClcbiAgICAgICAgLy8gZ2V0IHRoZSBlbmQgb2YgdGhlIG1vbnRoXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXRNb250aChsYXN0VmlzaWJsZURhdGUuZ2V0TW9udGgoKSArIDEpXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXREYXRlKGxhc3RWaXNpYmxlRGF0ZS5nZXREYXRlKCkgLSAxKVxuICAgICAgICBuZXdDYWxlbmRhciA9ICh2aXNpYmxlRGF0ZSA8IGZpcnN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIHx8IGxhc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgPCB2aXNpYmxlRGF0ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW3tcbiAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxuICAgICAgICAgIHllYXI6IGRhdGUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB9XVxuICAgICAgICBpZiAodGhpcy5fby5tYWluQ2FsZW5kYXIgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArPSAxIC0gdGhpcy5fby5udW1iZXJPZk1vbnRoc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgYWRqdXN0RGF0ZTogZnVuY3Rpb24gKHNpZ24sIGRheXMpIHtcbiAgICAgIHZhciBkYXkgPSB0aGlzLmdldERhdGUoKSB8fCBuZXcgRGF0ZSgpXG4gICAgICB2YXIgZGlmZmVyZW5jZSA9IHBhcnNlSW50KGRheXMpICogMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgICB2YXIgbmV3RGF5XG5cbiAgICAgIGlmIChzaWduID09PSAnYWRkJykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpICsgZGlmZmVyZW5jZSlcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PT0gJ3N1YnRyYWN0Jykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpIC0gZGlmZmVyZW5jZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXREYXRlKG5ld0RheSlcbiAgICB9LFxuXG4gICAgYWRqdXN0Q2FsZW5kYXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXSA9IGFkanVzdENhbGVuZGFyKHRoaXMuY2FsZW5kYXJzWzBdKVxuICAgICAgZm9yICh2YXIgYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuZ290b0RhdGUobmV3IERhdGUoKSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBtb250aCAoemVyby1pbmRleCwgZS5nLiAwOiBKYW51YXJ5KVxuICAgICAqL1xuICAgIGdvdG9Nb250aDogZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgICBpZiAoIWlzTmFOKG1vbnRoKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCA9IHBhcnNlSW50KG1vbnRoLCAxMClcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBuZXh0TW9udGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aC0tXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZnVsbCB5ZWFyIChlLmcuIFwiMjAxMlwiKVxuICAgICAqL1xuICAgIGdvdG9ZZWFyOiBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgaWYgKCFpc05hTih5ZWFyKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS55ZWFyID0gcGFyc2VJbnQoeWVhciwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHRoZSBtaW5EYXRlXG4gICAgICovXG4gICAgc2V0TWluRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheSh2YWx1ZSlcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gdmFsdWUuZ2V0TW9udGgoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gZGVmYXVsdHMubWluRGF0ZVxuICAgICAgICB0aGlzLl9vLm1pblllYXIgPSBkZWZhdWx0cy5taW5ZZWFyXG4gICAgICAgIHRoaXMuX28ubWluTW9udGggPSBkZWZhdWx0cy5taW5Nb250aFxuICAgICAgICB0aGlzLl9vLnN0YXJ0UmFuZ2UgPSBkZWZhdWx0cy5zdGFydFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IGRlZmF1bHRzLm1heERhdGVcbiAgICAgICAgdGhpcy5fby5tYXhZZWFyID0gZGVmYXVsdHMubWF4WWVhclxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZGVmYXVsdHMubWF4TW9udGhcbiAgICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IGRlZmF1bHRzLmVuZFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlZnJlc2ggdGhlIEhUTUxcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbiAoZm9yY2UpIHtcbiAgICAgIGlmICghdGhpcy5fdiAmJiAhZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHZhciBvcHRzID0gdGhpcy5fb1xuICAgICAgdmFyIG1pblllYXIgPSBvcHRzLm1pblllYXJcbiAgICAgIHZhciBtYXhZZWFyID0gb3B0cy5tYXhZZWFyXG4gICAgICB2YXIgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICB2YXIgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoXG4gICAgICB2YXIgaHRtbCA9ICcnXG4gICAgICB2YXIgcmFuZElkXG5cbiAgICAgIGlmICh0aGlzLl95IDw9IG1pblllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1pblllYXJcbiAgICAgICAgaWYgKCFpc05hTihtaW5Nb250aCkgJiYgdGhpcy5fbSA8IG1pbk1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1pbk1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl95ID49IG1heFllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1heFllYXJcbiAgICAgICAgaWYgKCFpc05hTihtYXhNb250aCkgJiYgdGhpcy5fbSA+IG1heE1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1heE1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmFuZElkID0gJ2RhdGVwaWNrZXJfX3RpdGxlLScgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKC9bXmEtel0rL2csICcnKS5zdWJzdHIoMCwgMilcblxuICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBvcHRzLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xlbmRhclwiPicgKyByZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArIHRoaXMucmVuZGVyKHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCByYW5kSWQpICsgJzwvZGl2PidcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGlmIChvcHRzLmZpZWxkLnR5cGUgIT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBvcHRzLnRyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIH0sIDEpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uRHJhdyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vLm9uRHJhdyh0aGlzKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICAvLyBsZXQgdGhlIHNjcmVlbiByZWFkZXIgdXNlciBrbm93IHRvIHVzZSBhcnJvdyBrZXlzXG4gICAgICAgIG9wdHMuZmllbGQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ1VzZSB0aGUgYXJyb3cga2V5cyB0byBwaWNrIGEgZGF0ZScpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGFkanVzdFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQsIHBFbCwgd2lkdGgsIGhlaWdodCwgdmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIHNjcm9sbFRvcCwgbGVmdCwgdG9wLCBjbGllbnRSZWN0XG5cbiAgICAgIGlmICh0aGlzLl9vLmNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cbiAgICAgIGZpZWxkID0gdGhpcy5fby50cmlnZ2VyXG4gICAgICBwRWwgPSBmaWVsZFxuICAgICAgd2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoXG4gICAgICBoZWlnaHQgPSB0aGlzLmVsLm9mZnNldEhlaWdodFxuICAgICAgdmlld3BvcnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgICAgdmlld3BvcnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICAgICAgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcblxuICAgICAgaWYgKHR5cGVvZiBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2xpZW50UmVjdCA9IGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGxlZnQgPSBjbGllbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXRcbiAgICAgICAgdG9wID0gY2xpZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZnQgPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICB0b3AgPSBwRWwub2Zmc2V0VG9wICsgcEVsLm9mZnNldEhlaWdodFxuICAgICAgICB3aGlsZSAoKHBFbCA9IHBFbC5vZmZzZXRQYXJlbnQpKSB7XG4gICAgICAgICAgbGVmdCArPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICAgIHRvcCArPSBwRWwub2Zmc2V0VG9wXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyBib3R0b20gJiBsZWZ0XG4gICAgICBpZiAoKHRoaXMuX28ucmVwb3NpdGlvbiAmJiBsZWZ0ICsgd2lkdGggPiB2aWV3cG9ydFdpZHRoKSB8fFxuICAgICAgICAoXG4gICAgICAgICAgdGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCdyaWdodCcpID4gLTEgJiZcbiAgICAgICAgICBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aCA+IDBcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIGxlZnQgPSBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aFxuICAgICAgfVxuICAgICAgaWYgKCh0aGlzLl9vLnJlcG9zaXRpb24gJiYgdG9wICsgaGVpZ2h0ID4gdmlld3BvcnRIZWlnaHQgKyBzY3JvbGxUb3ApIHx8XG4gICAgICAgIChcbiAgICAgICAgICB0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEgJiZcbiAgICAgICAgICB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHQgPiAwXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0b3AgPSB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHRcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCdcbiAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW5kZXIgSFRNTCBmb3IgYSBwYXJ0aWN1bGFyIG1vbnRoXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoeWVhciwgbW9udGgsIHJhbmRJZCkge1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLl9vXG4gICAgICB2YXIgbm93ID0gbmV3IERhdGUoKVxuICAgICAgdmFyIGRheXMgPSBnZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aClcbiAgICAgIHZhciBiZWZvcmUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KClcbiAgICAgIHZhciBkYXRhID0gW11cbiAgICAgIHZhciByb3cgPSBbXVxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcbiAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheVxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xuICAgICAgICAgIGJlZm9yZSArPSA3XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBwcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyAxMSA6IG1vbnRoIC0gMVxuICAgICAgdmFyIG5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IDAgOiBtb250aCArIDFcbiAgICAgIHZhciB5ZWFyT2ZQcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyB5ZWFyIC0gMSA6IHllYXJcbiAgICAgIHZhciB5ZWFyT2ZOZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXJcbiAgICAgIHZhciBkYXlzSW5QcmV2aW91c01vbnRoID0gZ2V0RGF5c0luTW9udGgoeWVhck9mUHJldmlvdXNNb250aCwgcHJldmlvdXNNb250aClcbiAgICAgIHZhciBjZWxscyA9IGRheXMgKyBiZWZvcmVcbiAgICAgIHZhciBhZnRlciA9IGNlbGxzXG4gICAgICB3aGlsZSAoYWZ0ZXIgPiA3KSB7XG4gICAgICAgIGFmdGVyIC09IDdcbiAgICAgIH1cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgdmFyIGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgIGZvciAodmFyIGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcbiAgICAgICAgdmFyIGRheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxICsgKGkgLSBiZWZvcmUpKVxuICAgICAgICB2YXIgaXNTZWxlY3RlZCA9IGlzRGF0ZSh0aGlzLl9kKSA/IGNvbXBhcmVEYXRlcyhkYXksIHRoaXMuX2QpIDogZmFsc2VcbiAgICAgICAgdmFyIGlzVG9kYXkgPSBjb21wYXJlRGF0ZXMoZGF5LCBub3cpXG4gICAgICAgIHZhciBoYXNFdmVudCA9IG9wdHMuZXZlbnRzLmluZGV4T2YoZGF5LnRvRGF0ZVN0cmluZygpKSAhPT0gLTFcbiAgICAgICAgdmFyIGlzRW1wdHkgPSBpIDwgYmVmb3JlIHx8IGkgPj0gKGRheXMgKyBiZWZvcmUpXG4gICAgICAgIHZhciBkYXlOdW1iZXIgPSAxICsgKGkgLSBiZWZvcmUpXG4gICAgICAgIHZhciBtb250aE51bWJlciA9IG1vbnRoXG4gICAgICAgIHZhciB5ZWFyTnVtYmVyID0geWVhclxuICAgICAgICB2YXIgaXNTdGFydFJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLnN0YXJ0UmFuZ2UsIGRheSlcbiAgICAgICAgdmFyIGlzRW5kUmFuZ2UgPSBvcHRzLmVuZFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLmVuZFJhbmdlLCBkYXkpXG4gICAgICAgIHZhciBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgICB2YXIgaXNEaXNhYmxlZCA9IChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxuICAgICAgICAgIChvcHRzLm1heERhdGUgJiYgZGF5ID4gb3B0cy5tYXhEYXRlKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVXZWVrZW5kcyAmJiBpc1dlZWtlbmQoZGF5KSkgfHxcbiAgICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4oZGF5KSlcblxuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGlmIChpIDwgYmVmb3JlKSB7XG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlzSW5QcmV2aW91c01vbnRoICsgZGF5TnVtYmVyXG4gICAgICAgICAgICBtb250aE51bWJlciA9IHByZXZpb3VzTW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZQcmV2aW91c01vbnRoXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheU51bWJlciAtIGRheXNcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gbmV4dE1vbnRoXG4gICAgICAgICAgICB5ZWFyTnVtYmVyID0geWVhck9mTmV4dE1vbnRoXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRheUNvbmZpZyA9IHtcbiAgICAgICAgICBkYXk6IGRheU51bWJlcixcbiAgICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXG4gICAgICAgICAgeWVhcjogeWVhck51bWJlcixcbiAgICAgICAgICBoYXNFdmVudDogaGFzRXZlbnQsXG4gICAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5LFxuICAgICAgICAgIGlzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcbiAgICAgICAgICBpc1N0YXJ0UmFuZ2U6IGlzU3RhcnRSYW5nZSxcbiAgICAgICAgICBpc0VuZFJhbmdlOiBpc0VuZFJhbmdlLFxuICAgICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxuICAgICAgICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyxcbiAgICAgICAgICBlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy5waWNrV2hvbGVXZWVrICYmIGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBpc1dlZWtTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIHJvdy5wdXNoKHJlbmRlckRheShkYXlDb25maWcpKVxuXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcbiAgICAgICAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgICAgICAgcm93LnVuc2hpZnQocmVuZGVyV2VlayhpIC0gYmVmb3JlLCBtb250aCwgeWVhcikpXG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEucHVzaChyZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMLCBvcHRzLnBpY2tXaG9sZVdlZWssIGlzV2Vla1NlbGVjdGVkKSlcbiAgICAgICAgICByb3cgPSBbXVxuICAgICAgICAgIHIgPSAwXG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyVGFibGUob3B0cywgZGF0YSwgcmFuZElkKVxuICAgIH0sXG5cbiAgICBpc1Zpc2libGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl92XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICB0aGlzLl92ID0gdHJ1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICAgICAgICB0aGlzLmFkanVzdFBvc2l0aW9uKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fby5vbk9wZW4uY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2ID0gdGhpcy5fdlxuICAgICAgaWYgKHYgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnIC8vIHJlc2V0XG4gICAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9ICdhdXRvJ1xuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9ICdhdXRvJ1xuICAgICAgICBhZGRDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IGZhbHNlXG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHRoaXMuX28ub25DbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25DbG9zZS5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR0FNRSBPVkVSXG4gICAgICovXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnZm9jdXMnLCB0aGlzLl9vbklucHV0Rm9jdXMpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnYmx1cicsIHRoaXMuX29uSW5wdXRCbHVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQ0FBQyxZQUFZOzs7O0VBSVgsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQTtFQUM5QixJQUFJLFFBQVEsR0FBRyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtJQUNqRCxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDNUMsQ0FBQTs7RUFFRCxJQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtJQUNwRCxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDL0MsQ0FBQTs7RUFFRCxJQUFJLElBQUksR0FBRyxVQUFVLEdBQUcsRUFBRTtJQUN4QixPQUFPLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztHQUM3RCxDQUFBOztFQUVELElBQUksUUFBUSxHQUFHLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUMvQixPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNqRSxDQUFBOztFQUVELElBQUksUUFBUSxHQUFHLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtNQUNyQixFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtLQUNwRTtHQUNGLENBQUE7O0VBRUQsSUFBSSxXQUFXLEdBQUcsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ2xDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQzdFLENBQUE7O0VBRUQsSUFBSSxPQUFPLEdBQUcsVUFBVSxHQUFHLEVBQUU7SUFDM0IsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQzNELENBQUE7O0VBRUQsSUFBSSxNQUFNLEdBQUcsVUFBVSxHQUFHLEVBQUU7SUFDMUIsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ25GLENBQUE7O0VBRUQsSUFBSSxTQUFTLEdBQUcsVUFBVSxJQUFJLEVBQUU7SUFDOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3ZCLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztHQUM5QixDQUFBOztFQUVELElBQUksVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFO0lBQy9CLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztHQUNsRSxDQUFBOztFQUVELElBQUksY0FBYyxHQUFHLFVBQVUsSUFBSSxFQUFFLEtBQUssRUFBRTtJQUMxQyxPQUFPLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztHQUN2RixDQUFBOztFQUVELElBQUksZUFBZSxHQUFHLFVBQVUsSUFBSSxFQUFFO0lBQ3BDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7R0FDNUMsQ0FBQTs7RUFFRCxJQUFJLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDakMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRTtHQUNuQyxDQUFBOztFQUVELElBQUksTUFBTSxHQUFHLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7SUFDMUMsSUFBSSxJQUFJLEVBQUUsT0FBTyxDQUFBO0lBQ2pCLEtBQUssSUFBSSxJQUFJLElBQUksRUFBRTtNQUNqQixPQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsQ0FBQTtNQUNoQyxJQUFJLE9BQU8sSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtRQUN6RyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtVQUN0QixJQUFJLFNBQVMsRUFBRTtZQUNiLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtXQUMxQztTQUNGLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7VUFDOUIsSUFBSSxTQUFTLEVBQUU7WUFDYixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtXQUMvQjtTQUNGLE1BQU07VUFDTCxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7U0FDN0M7T0FDRixNQUFNLElBQUksU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ2hDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDdEI7S0FDRjtJQUNELE9BQU8sRUFBRTtHQUNWLENBQUE7O0VBRUQsSUFBSSxTQUFTLEdBQUcsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtJQUM3QyxJQUFJLEVBQUUsQ0FBQTs7SUFFTixJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7TUFDeEIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUE7TUFDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO01BQ3BDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO01BQ3JCLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDckIsTUFBTSxJQUFJLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtNQUNyQyxFQUFFLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUE7TUFDakMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUE7TUFDckIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0tBQ25DO0dBQ0YsQ0FBQTs7RUFFRCxJQUFJLGNBQWMsR0FBRyxVQUFVLFFBQVEsRUFBRTtJQUN2QyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO01BQ3RCLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtNQUN6RCxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQTtLQUNyQjtJQUNELElBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUU7TUFDdkIsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO01BQzFELFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFBO0tBQ3JCO0lBQ0QsT0FBTyxRQUFRO0dBQ2hCLENBQUE7Ozs7O0VBS0QsSUFBSSxRQUFRLEdBQUc7OztJQUdiLEtBQUssRUFBRSxJQUFJOzs7SUFHWCxLQUFLLEVBQUUsU0FBUzs7OztJQUloQixRQUFRLEVBQUUsYUFBYTs7O0lBR3ZCLFVBQVUsRUFBRSxJQUFJOzs7SUFHaEIsTUFBTSxFQUFFLFlBQVk7Ozs7SUFJcEIsUUFBUSxFQUFFLElBQUk7OztJQUdkLEtBQUssRUFBRSxJQUFJOzs7SUFHWCxXQUFXLEVBQUUsSUFBSTs7O0lBR2pCLGNBQWMsRUFBRSxLQUFLOzs7SUFHckIsUUFBUSxFQUFFLENBQUM7OztJQUdYLFlBQVksRUFBRSxLQUFLOzs7SUFHbkIsT0FBTyxFQUFFLElBQUk7O0lBRWIsT0FBTyxFQUFFLElBQUk7OztJQUdiLFNBQVMsRUFBRSxFQUFFOzs7SUFHYixjQUFjLEVBQUUsS0FBSzs7O0lBR3JCLGFBQWEsRUFBRSxLQUFLOzs7SUFHcEIsT0FBTyxFQUFFLENBQUM7SUFDVixPQUFPLEVBQUUsSUFBSTtJQUNiLFFBQVEsRUFBRSxTQUFTO0lBQ25CLFFBQVEsRUFBRSxTQUFTOztJQUVuQixVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSTs7SUFFZCxLQUFLLEVBQUUsS0FBSzs7O0lBR1osVUFBVSxFQUFFLEVBQUU7OztJQUdkLGtCQUFrQixFQUFFLEtBQUs7OztJQUd6QiwrQkFBK0IsRUFBRSxLQUFLOzs7SUFHdEMsMENBQTBDLEVBQUUsS0FBSzs7O0lBR2pELGNBQWMsRUFBRSxDQUFDOzs7O0lBSWpCLFlBQVksRUFBRSxNQUFNOzs7SUFHcEIsU0FBUyxFQUFFLFNBQVM7OztJQUdwQixpQkFBaUIsRUFBRSxJQUFJOzs7SUFHdkIsSUFBSSxFQUFFO01BQ0osYUFBYSxFQUFFLFlBQVk7TUFDM0IsU0FBUyxFQUFFLFlBQVk7TUFDdkIsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7TUFDdkUsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDO01BQ3hGLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztLQUNqRTs7O0lBR0QsS0FBSyxFQUFFLElBQUk7OztJQUdYLE1BQU0sRUFBRSxFQUFFOztJQUVWLFdBQVcsRUFBRSxLQUFLOzs7SUFHbEIsUUFBUSxFQUFFLElBQUk7SUFDZCxNQUFNLEVBQUUsSUFBSTtJQUNaLE9BQU8sRUFBRSxJQUFJO0lBQ2IsTUFBTSxFQUFFLElBQUk7R0FDYixDQUFBOzs7OztFQUtELElBQUksYUFBYSxHQUFHLFVBQVUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7SUFDN0MsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUE7SUFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFO01BQ2YsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNUO0lBQ0QsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0dBQ3JFLENBQUE7O0VBRUQsSUFBSSxTQUFTLEdBQUcsVUFBVSxJQUFJLEVBQUU7SUFDOUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO0lBQ1osSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFBO0lBQzFCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtNQUNoQixJQUFJLElBQUksQ0FBQywrQkFBK0IsRUFBRTtRQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUE7O1FBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsMENBQTBDLEVBQUU7VUFDcEQsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1NBQ2xDO09BQ0YsTUFBTTtRQUNMLE9BQU8sNEJBQTRCO09BQ3BDO0tBQ0Y7SUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7TUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtLQUN4QjtJQUNELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtNQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQ3JCO0lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO01BQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7TUFDdkIsWUFBWSxHQUFHLE1BQU0sQ0FBQTtLQUN0QjtJQUNELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtNQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0tBQ3RCO0lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO01BQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDdkI7SUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7TUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtLQUMxQjtJQUNELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtNQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0tBQ3hCO0lBQ0QsT0FBTyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLG1CQUFtQixHQUFHLFlBQVksR0FBRyxJQUFJO1FBQ3hHLG1FQUFtRTtRQUNuRSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLDJCQUEyQixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcseUJBQXlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJO1FBQzdILElBQUksQ0FBQyxHQUFHO1FBQ1IsV0FBVztRQUNYLE9BQU87R0FDWixDQUFBOztFQUVELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDbEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzlGLE9BQU8sK0JBQStCLEdBQUcsT0FBTyxHQUFHLE9BQU87R0FDM0QsQ0FBQTs7RUFFRCxJQUFJLFNBQVMsR0FBRyxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtJQUNuRSxPQUFPLDRCQUE0QixJQUFJLGFBQWEsR0FBRyxrQkFBa0IsR0FBRyxFQUFFLENBQUMsSUFBSSxhQUFhLEdBQUcsY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPO0dBQ3BMLENBQUE7O0VBRUQsSUFBSSxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUU7SUFDL0IsT0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVO0dBQzlDLENBQUE7O0VBRUQsSUFBSSxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUU7SUFDL0IsSUFBSSxDQUFDLENBQUE7SUFDTCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUE7SUFDWixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7TUFDdkIsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUN0QjtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ3RCLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUE7S0FDMUg7SUFDRCxPQUFPLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZTtHQUNyRixDQUFBOztFQUVELElBQUksV0FBVyxHQUFHLFVBQVUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7SUFDckUsSUFBSSxDQUFDLENBQUE7SUFDTCxJQUFJLENBQUMsQ0FBQTtJQUNMLElBQUksR0FBRyxDQUFBO0lBQ1AsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQTtJQUN0QixJQUFJLFNBQVMsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQyxJQUFJLFNBQVMsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQyxJQUFJLElBQUksR0FBRyxXQUFXLEdBQUcsTUFBTSxHQUFHLG1FQUFtRSxDQUFBO0lBQ3JHLElBQUksU0FBUyxDQUFBO0lBQ2IsSUFBSSxRQUFRLENBQUE7SUFDWixJQUFJLElBQUksR0FBRyxJQUFJLENBQUE7SUFDZixJQUFJLElBQUksR0FBRyxJQUFJLENBQUE7O0lBRWYsS0FBSyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksS0FBSyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7V0FDckUsQ0FBQyxLQUFLLEtBQUssR0FBRyxzQkFBc0IsR0FBRyxFQUFFLENBQUM7V0FDMUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLE1BQU0sU0FBUyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcscUJBQXFCLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRztVQUN6RyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQTtLQUN2Qzs7SUFFRCxTQUFTLEdBQUcsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsNEVBQTRFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQTs7SUFFekwsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO01BQzNCLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3JCLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUMxQixNQUFNO01BQ0wsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO01BQ3pCLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUE7S0FDOUI7O0lBRUQsS0FBSyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDOUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxzQkFBc0IsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUE7T0FDN0c7S0FDRjtJQUNELFFBQVEsR0FBRyxpQ0FBaUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRywyRUFBMkUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFBOztJQUV0TCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtNQUMzQixJQUFJLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQTtLQUM3QixNQUFNO01BQ0wsSUFBSSxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUE7S0FDN0I7O0lBRUQsSUFBSSxTQUFTLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxFQUFFO01BQ3hELElBQUksR0FBRyxLQUFLLENBQUE7S0FDYjs7SUFFRCxJQUFJLFNBQVMsS0FBSyxLQUFLLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEVBQUU7TUFDekQsSUFBSSxHQUFHLEtBQUssQ0FBQTtLQUNiOztJQUVELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtNQUNYLElBQUksSUFBSSxpQ0FBaUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLGNBQWMsQ0FBQyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQTtLQUN0STtJQUNELElBQUksQ0FBQyxNQUFNLFFBQVEsQ0FBQyxFQUFFLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxFQUFFO01BQzFDLElBQUksSUFBSSxpQ0FBaUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLGNBQWMsQ0FBQyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQTtLQUNsSTs7SUFFRCxJQUFJLElBQUksUUFBUSxDQUFBOztJQUVoQixPQUFPLElBQUk7R0FDWixDQUFBOztFQUVELElBQUksV0FBVyxHQUFHLFVBQVUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDOUMsT0FBTyxnR0FBZ0csR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVTtHQUMzSyxDQUFBOzs7OztFQUtELElBQUksV0FBVyxHQUFHLFVBQVUsT0FBTyxFQUFFO0lBQ25DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNmLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7O0lBRS9CLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLEVBQUU7TUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDWixNQUFNO09BQ1A7TUFDRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUE7TUFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFBO01BQ3JDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxNQUFNO09BQ1A7O01BRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLEVBQUU7UUFDcEMsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEVBQUU7VUFDMUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtVQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtVQUM3SixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxVQUFVLENBQUMsWUFBWTs7Y0FFckIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7ZUFDL0IsTUFBTTtnQkFDTCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBQ1gsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtrQkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtpQkFDbEI7ZUFDRjthQUNGLEVBQUUsR0FBRyxDQUFDLENBQUE7V0FDUjtTQUNGLE1BQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7VUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtVQUN0QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7U0FDakIsTUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtVQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1VBQ3RCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUNqQjtPQUNGO01BQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtRQUMzQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUU7VUFDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO1NBQ25CLE1BQU07VUFDTCxDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQTtVQUNyQixPQUFPLEtBQUs7U0FDYjtPQUNGLE1BQU07UUFDTCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7T0FDekI7S0FDRixDQUFBOzs7SUFHRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxFQUFFO01BQzVCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQTtNQUNyQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUE7TUFDckMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE1BQU07T0FDUDtNQUNELElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSwwQkFBMEIsQ0FBQyxFQUFFO1FBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzdCLE1BQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLHlCQUF5QixDQUFDLEVBQUU7UUFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDNUI7TUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQ3hCLENBQUE7O0lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBRTtNQUMvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUE7O01BRXJCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1FBQ3BCLFFBQVEsQ0FBQyxDQUFDLE9BQU87VUFDZixLQUFLLEVBQUUsQ0FBQztVQUNSLEtBQUssRUFBRTtZQUNMLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtjQUNkLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO2VBQy9CLE1BQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtlQUNsQjthQUNGO1lBQ0QsS0FBSztVQUNQLEtBQUssRUFBRTtZQUNMLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUM5QixLQUFLO1VBQ1AsS0FBSyxFQUFFO1lBQ0wsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDOUIsS0FBSztVQUNQLEtBQUssRUFBRTtZQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3pCLEtBQUs7VUFDUCxLQUFLLEVBQUU7WUFDTCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUN6QixLQUFLO1NBQ1I7T0FDRjtLQUNGLENBQUE7O0lBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsRUFBRTtNQUNqQyxJQUFJLElBQUksQ0FBQTs7TUFFUixJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1FBQ3RCLE1BQU07T0FDUDtNQUNELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNkLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUNqRCxNQUFNO1FBQ0wsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO09BQzlDO01BQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUNuQjtNQUNELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ1osSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO09BQ1o7S0FDRixDQUFBOztJQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWTtNQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDWixDQUFBOztJQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWTtNQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDWixDQUFBOztJQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWTtNQUM5QixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFBO01BQ2hDLEdBQUc7UUFDRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUU7VUFDL0IsTUFBTTtTQUNQO09BQ0Y7Y0FDTyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRTs7TUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxZQUFZO1VBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUNaLEVBQUUsRUFBRSxDQUFDLENBQUE7T0FDUDtNQUNELElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFBO0tBQ2hCLENBQUE7O0lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsRUFBRTtNQUMzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUE7TUFDckIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFBO01BQ3JDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQTs7TUFFaEIsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE1BQU07T0FDUDtNQUNELEdBQUc7UUFDRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7VUFDdkQsTUFBTTtTQUNQO09BQ0Y7Y0FDTyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRTtNQUM5QixJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDOUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO09BQ1o7S0FDRixDQUFBOztJQUVELElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQTs7SUFFdkcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDdkQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUMzQyxRQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7O0lBRWhELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtNQUNkLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7T0FDcEMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDckIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQ25DLE1BQU07UUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQ3BFO01BQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTs7TUFFbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtPQUMzQjtLQUNGOztJQUVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUE7O0lBRTlCLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ25CLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUM1QixNQUFNO1FBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUN2QjtLQUNGLE1BQU07TUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUMxQjs7SUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7TUFDZCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7TUFDWCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUE7TUFDaEMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtNQUNuRCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO01BQ25ELFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDbEQsTUFBTTtNQUNMLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNaO0dBQ0YsQ0FBQTs7Ozs7RUFLRCxXQUFXLENBQUMsU0FBUyxHQUFHOzs7OztJQUt0QixNQUFNLEVBQUUsVUFBVSxPQUFPLEVBQUU7TUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ3JDOztNQUVELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTs7TUFFekMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTs7TUFFekIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7O01BRXBFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7O01BRS9FLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7O01BRWpGLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTs7TUFFbEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQTs7TUFFN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLFlBQVksTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7O01BRXhGLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtNQUNoRCxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTs7TUFFdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7T0FDckI7TUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtPQUNyQjtNQUNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ2pFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7T0FDcEM7TUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDOUI7TUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDOUI7O01BRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzNCLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksUUFBUSxDQUFBO1FBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksUUFBUSxDQUFBO09BQ2hFLE1BQU07UUFDTCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFBO1FBQzdFLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUU7VUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUE7U0FDckI7T0FDRjs7TUFFRCxPQUFPLElBQUk7S0FDWjs7Ozs7SUFLRCxRQUFRLEVBQUUsVUFBVSxNQUFNLEVBQUU7TUFDMUIsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQTtNQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNwQixPQUFPLEVBQUU7T0FDVjtNQUNELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDcEIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztPQUN6Qzs7TUFFRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFO0tBQzlCOzs7OztJQUtELE9BQU8sRUFBRSxZQUFZO01BQ25CLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSTtLQUM1RDs7Ozs7SUFLRCxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsZUFBZSxFQUFFO01BQ3hDLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQTs7UUFFZCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1VBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7VUFDeEIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRTtZQUNqQyxPQUFPLEVBQUUsSUFBSTtXQUNkLENBQUMsQ0FBQTtTQUNIOztRQUVELE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRTtPQUNuQjtNQUNELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7T0FDbEM7TUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pCLE1BQU07T0FDUDs7TUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQTtNQUN6QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQTs7TUFFekIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtRQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFBO09BQ1gsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO1FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUE7T0FDWDs7TUFFRCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO01BQ2xDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7TUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7O01BRXRCLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7UUFDakIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNyQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO1VBQ2pDLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFBO09BQ0g7TUFDRCxJQUFJLENBQUMsZUFBZSxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEtBQUssVUFBVSxFQUFFO1FBQzlELElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7T0FDNUM7S0FDRjs7Ozs7SUFLRCxRQUFRLEVBQUUsVUFBVSxJQUFJLEVBQUU7TUFDeEIsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFBOztNQUV0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pCLE1BQU07T0FDUDs7TUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNuRixJQUFJLGVBQWUsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNsSSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7O1FBRWhDLGVBQWUsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3hELGVBQWUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3RELFdBQVcsSUFBSSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFBO09BQ3BHOztNQUVELElBQUksV0FBVyxFQUFFO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO1VBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1VBQ3RCLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1NBQ3pCLENBQUMsQ0FBQTtRQUNGLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEtBQUssT0FBTyxFQUFFO1VBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQTtTQUN0RDtPQUNGOztNQUVELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtLQUN2Qjs7SUFFRCxVQUFVLEVBQUUsVUFBVSxJQUFJLEVBQUUsSUFBSSxFQUFFO01BQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFBO01BQ3RDLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUE7O01BRXJELElBQUksTUFBTSxDQUFBOztNQUVWLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRTtRQUNsQixNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFBO09BQzlDLE1BQU0sSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQzlCLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUE7T0FDOUM7O01BRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNyQjs7SUFFRCxlQUFlLEVBQUUsWUFBWTtNQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7TUFDckQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDO1VBQ2pDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDO1VBQ2xDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7U0FDN0IsQ0FBQyxDQUFBO09BQ0g7TUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDWjs7SUFFRCxTQUFTLEVBQUUsWUFBWTtNQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUMxQjs7Ozs7SUFLRCxTQUFTLEVBQUUsVUFBVSxLQUFLLEVBQUU7TUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzdDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtPQUN2QjtLQUNGOztJQUVELFNBQVMsRUFBRSxZQUFZO01BQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7TUFDekIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0tBQ3ZCOztJQUVELFNBQVMsRUFBRSxZQUFZO01BQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7TUFDekIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0tBQ3ZCOzs7OztJQUtELFFBQVEsRUFBRSxVQUFVLElBQUksRUFBRTtNQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDM0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO09BQ3ZCO0tBQ0Y7Ozs7O0lBS0QsVUFBVSxFQUFFLFVBQVUsS0FBSyxFQUFFO01BQzNCLElBQUksS0FBSyxZQUFZLElBQUksRUFBRTtRQUN6QixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7T0FDcEMsTUFBTTtRQUNMLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUE7UUFDbEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQTtRQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFBO1FBQ3BDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUE7T0FDekM7O01BRUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ1o7Ozs7O0lBS0QsVUFBVSxFQUFFLFVBQVUsS0FBSyxFQUFFO01BQzNCLElBQUksS0FBSyxZQUFZLElBQUksRUFBRTtRQUN6QixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7T0FDcEMsTUFBTTtRQUNMLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUE7UUFDbEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQTtRQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFBO1FBQ3BDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUE7T0FDckM7O01BRUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ1o7O0lBRUQsYUFBYSxFQUFFLFVBQVUsS0FBSyxFQUFFO01BQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtLQUMzQjs7SUFFRCxXQUFXLEVBQUUsVUFBVSxLQUFLLEVBQUU7TUFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO0tBQ3pCOzs7OztJQUtELElBQUksRUFBRSxVQUFVLEtBQUssRUFBRTtNQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUN0QixNQUFNO09BQ1A7O01BRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQTtNQUNsQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFBO01BQzFCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUE7TUFDMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtNQUM1QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO01BQzVCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtNQUNiLElBQUksTUFBTSxDQUFBOztNQUVWLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxPQUFPLEVBQUU7UUFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUE7UUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsRUFBRTtVQUMxQyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQTtTQUNuQjtPQUNGO01BQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE9BQU8sRUFBRTtRQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQTtRQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFO1VBQzFDLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFBO1NBQ25CO09BQ0Y7O01BRUQsTUFBTSxHQUFHLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBOztNQUUvRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QyxJQUFJLElBQUksa0NBQWtDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUE7T0FDck87O01BRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBOztNQUV4QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDZCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtVQUNoQyxVQUFVLENBQUMsWUFBWTtZQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO1dBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDTjtPQUNGOztNQUVELElBQUksT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7UUFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDckI7O01BRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFOztRQUVkLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO09BQzNFO0tBQ0Y7O0lBRUQsY0FBYyxFQUFFLFlBQVk7TUFDMUIsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUE7O01BRTlGLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTTs7TUFFN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQTs7TUFFbkMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFBO01BQ3ZCLEdBQUcsR0FBRyxLQUFLLENBQUE7TUFDWCxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUE7TUFDM0IsTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFBO01BQzdCLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFBO01BQ3pFLGNBQWMsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFBO01BQzVFLFNBQVMsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFBOztNQUUvRixJQUFJLE9BQU8sS0FBSyxDQUFDLHFCQUFxQixLQUFLLFVBQVUsRUFBRTtRQUNyRCxVQUFVLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLENBQUE7UUFDMUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTtRQUMzQyxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBO09BQzdDLE1BQU07UUFDTCxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQTtRQUNyQixHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFBO1FBQ3RDLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUc7VUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUE7VUFDdEIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUE7U0FDckI7T0FDRjs7O01BR0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsYUFBYTs7VUFFbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUN0QyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQztTQUNyQztRQUNEO1FBQ0EsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQTtPQUN4QztNQUNELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLGNBQWMsR0FBRyxTQUFTOztVQUVoRSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQ3BDLEdBQUcsR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDO1NBQ3RDO1FBQ0Q7UUFDQSxHQUFHLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFBO09BQ3hDOztNQUVELElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO01BQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBO0tBQy9COzs7OztJQUtELE1BQU0sRUFBRSxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO01BQ3JDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUE7TUFDbEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtNQUNwQixJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO01BQ3RDLElBQUksTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7TUFDOUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO01BQ2IsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO01BQ1osZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO01BQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUU7UUFDckIsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUE7UUFDdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ2QsTUFBTSxJQUFJLENBQUMsQ0FBQTtTQUNaO09BQ0Y7TUFDRCxJQUFJLGFBQWEsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO01BQ2hELElBQUksU0FBUyxHQUFHLEtBQUssS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7TUFDNUMsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO01BQ3ZELElBQUksZUFBZSxHQUFHLEtBQUssS0FBSyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7TUFDcEQsSUFBSSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsbUJBQW1CLEVBQUUsYUFBYSxDQUFDLENBQUE7TUFDNUUsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQTtNQUN6QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUE7TUFDakIsT0FBTyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1FBQ2hCLEtBQUssSUFBSSxDQUFDLENBQUE7T0FDWDtNQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFBO01BQ2xCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQTtNQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDakQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDckUsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNwQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUM3RCxJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUE7UUFDaEQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQTtRQUNoQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUE7UUFDdkIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBO1FBQ3JCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDeEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7UUFDaEcsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTztXQUNqRCxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1dBQ25DLElBQUksQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1dBQ3ZDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBOztRQUUvQyxJQUFJLE9BQU8sRUFBRTtVQUNYLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRTtZQUNkLFNBQVMsR0FBRyxtQkFBbUIsR0FBRyxTQUFTLENBQUE7WUFDM0MsV0FBVyxHQUFHLGFBQWEsQ0FBQTtZQUMzQixVQUFVLEdBQUcsbUJBQW1CLENBQUE7V0FDakMsTUFBTTtZQUNMLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFBO1lBQzVCLFdBQVcsR0FBRyxTQUFTLENBQUE7WUFDdkIsVUFBVSxHQUFHLGVBQWUsQ0FBQTtXQUM3QjtTQUNGOztRQUVELElBQUksU0FBUyxHQUFHO1VBQ2QsR0FBRyxFQUFFLFNBQVM7VUFDZCxLQUFLLEVBQUUsV0FBVztVQUNsQixJQUFJLEVBQUUsVUFBVTtVQUNoQixRQUFRLEVBQUUsUUFBUTtVQUNsQixVQUFVLEVBQUUsVUFBVTtVQUN0QixPQUFPLEVBQUUsT0FBTztVQUNoQixVQUFVLEVBQUUsVUFBVTtVQUN0QixPQUFPLEVBQUUsT0FBTztVQUNoQixZQUFZLEVBQUUsWUFBWTtVQUMxQixVQUFVLEVBQUUsVUFBVTtVQUN0QixTQUFTLEVBQUUsU0FBUztVQUNwQiwrQkFBK0IsRUFBRSxJQUFJLENBQUMsK0JBQStCO1VBQ3JFLDBDQUEwQyxFQUFFLElBQUksQ0FBQywwQ0FBMEM7U0FDNUYsQ0FBQTs7UUFFRCxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksVUFBVSxFQUFFO1VBQ3BDLGNBQWMsR0FBRyxJQUFJLENBQUE7U0FDdEI7O1FBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTs7UUFFOUIsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUU7VUFDYixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtXQUNqRDtVQUNELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQTtVQUN6RSxHQUFHLEdBQUcsRUFBRSxDQUFBO1VBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtVQUNMLGNBQWMsR0FBRyxLQUFLLENBQUE7U0FDdkI7T0FDRjtNQUNELE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0tBQ3ZDOztJQUVELFNBQVMsRUFBRSxZQUFZO01BQ3JCLE9BQU8sSUFBSSxDQUFDLEVBQUU7S0FDZjs7SUFFRCxJQUFJLEVBQUUsWUFBWTtNQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1FBQ3JCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFBO1FBQ2QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ1gsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUE7UUFDakMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtVQUNqQixRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7VUFDMUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1NBQ3RCO1FBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtVQUN4QyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDMUI7T0FDRjtLQUNGOztJQUVELElBQUksRUFBRSxZQUFZO01BQ2hCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUE7TUFDZixJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUU7UUFDZixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1VBQ2pCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUM5QztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDakMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtRQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFBO1FBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFBO1FBQ2YsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO1VBQzVELElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUMzQjtPQUNGO0tBQ0Y7Ozs7O0lBS0QsT0FBTyxFQUFFLFlBQVk7TUFDbkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO01BQ1gsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7TUFDMUQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7TUFDekQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtNQUM5QyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1FBQ2pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQ3pELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7VUFDakIsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7VUFDekQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7VUFDekQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7U0FDeEQ7T0FDRjtNQUNELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7UUFDdEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUN4QztLQUNGO0dBQ0YsQ0FBQTtFQUNELE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0NBQ2pDLEdBQUcsQ0FBQSJ9
