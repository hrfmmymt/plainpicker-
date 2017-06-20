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

  var zeroPadding = function zeroPadding(num) {
    return ('0' + num).slice(-2);
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
    // format: 'YYYY-MM-DD',

    // the toString function which gets passed a current date object and format
    // and returns a string
    // toString: null,

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
      if (!self._v) return;

      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) return;

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          if (opts.bound) {
            setTimeout(function () {
              if (opts.rangeSelect) {
                // selectable date range on single calendar
                var selectedDate = new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day'));

                addClass(target, 'datepicker__button--started');

                self.setMinDate(selectedDate

                // 選択可能は二つまで。とりあえず
                );if (self.dateRangeArr.length > 1) {
                  self.dateRangeArr = [];
                }
                self.dateRangeArr.push(selectedDate

                // console.log(self.dateRangeArr)

                );self.dateRangeArr.forEach(function (e) {
                  self.setDate(e
                  // console.log(e)
                  );
                });

                if (self.dateRangeArr.length > 1) {
                  // self.hide()
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

    self._onMouseOver = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) return;
      if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled') && self.dateRangeArr.length > 0) {
        // if (opts.bound) {
        setTimeout(function () {
          addClass(target.parentNode, 'datepicker__highlighted');
        }, 200
        // }
        );
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
          // self.hide()
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
    addEvent(self.el, 'mouseover', self._onMouseOver, true);
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
    // toString: function (format) {
    //   format = format || this._o.format
    //   if (!isDate(this._d)) {
    //     return ''
    //   }

    //   if (this._o.toString) {
    //     console.log(this._o)
    //     return this._o.toString(this._d, format)
    //   }

    //   return this._d.toDateString()
    // },

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

      var superArr = [];

      self.dateRangeArr.forEach(function (e) {
        var yyyy = e.getFullYear();
        var mm = zeroPadding(e.getMonth() + 1);
        var dd = zeroPadding(e.getDate());
        var yyyymmdd = yyyy + '/' + mm + '/' + dd;
        superArr.push(yyyymmdd);
      });
      console.log(superArr);

      if (self._o.field) {
        if (self._o.rangeSelect) {
          self._o.field.value = superArr.join(' - ');
        } else {
          self._o.field.value = self.toString();
          fireEvent(self._o.field, 'change', {
            firedBy: self
          });
        }
      }

      if (!preventOnSelect && typeof self._o.onSelect === 'function') {
        self._o.onSelect.call(self, self.getDate());
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogZmVhdHVyZSBkZXRlY3Rpb24gYW5kIGhlbHBlciBmdW5jdGlvbnNcbiAgICovXG4gIGNvbnN0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50XG4gIGNvbnN0IGFkZEV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHJlbW92ZUV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHRyaW0gPSBzdHIgPT4gKHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cbiAgY29uc3QgaGFzQ2xhc3MgPSAoZWwsIGNuKSA9PiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcblxuICBjb25zdCBhZGRDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBpZiAoIWhhc0NsYXNzKGVsLCBjbikpIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSA9PT0gJycgPyBjbiA6IGVsLmNsYXNzTmFtZSArICcgJyArIGNuXG4gIH1cblxuICBjb25zdCByZW1vdmVDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBlbC5jbGFzc05hbWUgPSB0cmltKCgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLnJlcGxhY2UoJyAnICsgY24gKyAnICcsICcgJykpXG4gIH1cblxuICBjb25zdCBpc0FycmF5ID0gb2JqID0+IC9BcnJheS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcblxuICBjb25zdCBpc0RhdGUgPSBvYmogPT4gL0RhdGUvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuXG4gIGNvbnN0IHplcm9QYWRkaW5nID0gbnVtID0+ICgnMCcgKyBudW0pLnNsaWNlKC0yKVxuXG4gIGNvbnN0IGlzV2Vla2VuZCA9IGRhdGUgPT4ge1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgY29uc3QgaXNMZWFwWWVhciA9IHllYXIgPT4gKHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDApIHx8IHllYXIgJSA0MDAgPT09IDBcblxuICBjb25zdCBnZXREYXlzSW5Nb250aCA9ICh5ZWFyLCBtb250aCkgPT4gWzMxLCBpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdW21vbnRoXVxuXG4gIGNvbnN0IHNldFRvU3RhcnRPZkRheSA9IGRhdGUgPT4ge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGNvbXBhcmVEYXRlcyA9IChhLCBiKSA9PiBhLmdldFRpbWUoKSA9PT0gYi5nZXRUaW1lKClcblxuICBjb25zdCBleHRlbmQgPSAodG8sIGZyb20sIG92ZXJ3cml0ZSkgPT4ge1xuICAgIGxldCBwcm9wXG4gICAgbGV0IGhhc1Byb3BcblxuICAgIGZvciAocHJvcCBpbiBmcm9tKSB7XG4gICAgICBoYXNQcm9wID0gdG9bcHJvcF0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKGhhc1Byb3AgJiYgdHlwZW9mIGZyb21bcHJvcF0gPT09ICdvYmplY3QnICYmIGZyb21bcHJvcF0gIT09IG51bGwgJiYgZnJvbVtwcm9wXS5ub2RlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChpc0RhdGUoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IG5ldyBEYXRlKGZyb21bcHJvcF0uZ2V0VGltZSgpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdLnNsaWNlKDApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvW3Byb3BdID0gZXh0ZW5kKHt9LCBmcm9tW3Byb3BdLCBvdmVyd3JpdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3ZlcndyaXRlIHx8ICFoYXNQcm9wKSB7XG4gICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9cbiAgfVxuXG4gIGNvbnN0IGZpcmVFdmVudCA9IChlbCwgZXZlbnROYW1lLCBkYXRhKSA9PiB7XG4gICAgbGV0IGV2XG5cbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKVxuICAgICAgZXYuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQoZXYpXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBldilcbiAgICB9XG4gIH1cblxuICBjb25zdCBhZGp1c3RDYWxlbmRhciA9IGNhbGVuZGFyID0+IHtcbiAgICBpZiAoY2FsZW5kYXIubW9udGggPCAwKSB7XG4gICAgICBjYWxlbmRhci55ZWFyIC09IE1hdGguY2VpbChNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoICs9IDEyXG4gICAgfVxuICAgIGlmIChjYWxlbmRhci5tb250aCA+IDExKSB7XG4gICAgICBjYWxlbmRhci55ZWFyICs9IE1hdGguZmxvb3IoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCAtPSAxMlxuICAgIH1cbiAgICByZXR1cm4gY2FsZW5kYXJcbiAgfVxuXG4gIC8qKlxuICAgKiBkZWZhdWx0cyBhbmQgbG9jYWxpc2F0aW9uXG4gICAqL1xuICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAvLyBiaW5kIHRoZSBwaWNrZXIgdG8gYSBmb3JtIGZpZWxkXG4gICAgZmllbGQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgLy8gZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cbiAgICAvLyB0aGUgdG9TdHJpbmcgZnVuY3Rpb24gd2hpY2ggZ2V0cyBwYXNzZWQgYSBjdXJyZW50IGRhdGUgb2JqZWN0IGFuZCBmb3JtYXRcbiAgICAvLyBhbmQgcmV0dXJucyBhIHN0cmluZ1xuICAgIC8vIHRvU3RyaW5nOiBudWxsLFxuXG4gICAgLy8gdXNlZCB0byBjcmVhdGUgZGF0ZSBvYmplY3QgZnJvbSBjdXJyZW50IGlucHV0IHN0cmluZ1xuICAgIHBhcnNlOiBudWxsLFxuXG4gICAgLy8gdGhlIGluaXRpYWwgZGF0ZSB0byB2aWV3IHdoZW4gZmlyc3Qgb3BlbmVkXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXG5cbiAgICAvLyBtYWtlIHRoZSBgZGVmYXVsdERhdGVgIHRoZSBpbml0aWFsIHNlbGVjdGVkIHZhbHVlXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxuXG4gICAgLy8gZmlyc3QgZGF5IG9mIHdlZWsgKDA6IFN1bmRheSwgMTogTW9uZGF5IGV0YylcbiAgICBmaXJzdERheTogMCxcblxuICAgIC8vIHRoZSBkZWZhdWx0IGZsYWcgZm9yIG1vbWVudCdzIHN0cmljdCBkYXRlIHBhcnNpbmdcbiAgICBmb3JtYXRTdHJpY3Q6IGZhbHNlLFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIFdlZWsgcGlja2VyIG1vZGVcbiAgICBwaWNrV2hvbGVXZWVrOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIEFsbG93cyB1c2VyIHRvIHNlbGVjdCBkYXlzIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBCbHVyIGZpZWxkIHdoZW4gZGF0ZSBpcyBzZWxlY3RlZFxuICAgIGJsdXJGaWVsZE9uU2VsZWN0OiB0cnVlLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldiBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBldmVudHMgYXJyYXlcbiAgICBldmVudHM6IFtdLFxuXG4gICAgcmFuZ2VTZWxlY3Q6IGZhbHNlLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcblxuICAgIGlmIChvcHRzLmlzVG9kYXkpIGFyci5wdXNoKCdpcy10b2RheScpXG5cbiAgICBpZiAob3B0cy5pc1NlbGVjdGVkKSB7XG4gICAgICBhcnIucHVzaCgnaXMtc2VsZWN0ZWQnKVxuICAgICAgYXJpYVNlbGVjdGVkID0gJ3RydWUnXG4gICAgfVxuICAgIGlmIChvcHRzLmhhc0V2ZW50KSBhcnIucHVzaCgnaGFzLWV2ZW50JylcblxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuXG4gICAgaWYgKG9wdHMuaXNTdGFydFJhbmdlKSBhcnIucHVzaCgnaXMtc3RhcnRyYW5nZScpXG5cbiAgICBpZiAob3B0cy5pc0VuZFJhbmdlKSBhcnIucHVzaCgnaXMtZW5kcmFuZ2UnKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICc8dGQgZGF0YS1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIiBjbGFzcz1cIicgK1xuICAgICAgYXJyLmpvaW4oJyAnKSArXG4gICAgICAnXCIgYXJpYS1zZWxlY3RlZD1cIicgK1xuICAgICAgYXJpYVNlbGVjdGVkICtcbiAgICAgICdcIj4nICtcbiAgICAgICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fYnV0dG9uIGRhdGVwaWNrZXJfX2RheVwiIHR5cGU9XCJidXR0b25cIiAnICtcbiAgICAgICdkYXRhLWRhdGVwaWNrZXIteWVhcj1cIicgK1xuICAgICAgb3B0cy55ZWFyICtcbiAgICAgICdcIiBkYXRhLWRhdGVwaWNrZXItbW9udGg9XCInICtcbiAgICAgIG9wdHMubW9udGggK1xuICAgICAgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIj4nICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICc8L3RkPidcbiAgICApXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKChuZXcgRGF0ZSh5LCBtLCBkKSAtIG9uZWphbikgLyA4NjQwMDAwMCArIG9uZWphbi5nZXREYXkoKSArIDEpIC8gNylcbiAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImRhdGVwaWNrZXJfX3dlZWtcIj4nICsgd2Vla051bSArICc8L3RkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclJvdyA9IChkYXlzLCBpc1JUTCwgcGlja1dob2xlV2VlaywgaXNSb3dTZWxlY3RlZCkgPT5cbiAgICAnPHRyIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcm93JyArXG4gICAgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgK1xuICAgIChpc1Jvd1NlbGVjdGVkID8gJyBpcy1zZWxlY3RlZCcgOiAnJykgK1xuICAgICdcIj4nICtcbiAgICAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICtcbiAgICAnPC90cj4nXG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IHJvd3MgPT4gJzx0Ym9keT4nICsgcm93cy5qb2luKCcnKSArICc8L3Rib2R5PidcblxuICBjb25zdCByZW5kZXJIZWFkID0gb3B0cyA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgYXJyID0gW11cbiAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgYXJyLnB1c2goJzx0aD48L3RoPicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgIGFyci5wdXNoKCc8dGggc2NvcGU9XCJjb2xcIj48YWJiciB0aXRsZT1cIicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGkpICsgJ1wiPicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGksIHRydWUpICsgJzwvYWJicj48L3RoPicpXG4gICAgfVxuICAgIHJldHVybiAnPHRoZWFkPjx0cj4nICsgKG9wdHMuaXNSVEwgPyBhcnIucmV2ZXJzZSgpIDogYXJyKS5qb2luKCcnKSArICc8L3RyPjwvdGhlYWQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyVGl0bGUgPSAoaW5zdGFuY2UsIGMsIHllYXIsIG1vbnRoLCByZWZZZWFyLCByYW5kSWQpID0+IHtcbiAgICBsZXQgaVxuICAgIGxldCBqXG4gICAgbGV0IGFyclxuICAgIGNvbnN0IG9wdHMgPSBpbnN0YW5jZS5fb1xuICAgIGNvbnN0IGlzTWluWWVhciA9IHllYXIgPT09IG9wdHMubWluWWVhclxuICAgIGNvbnN0IGlzTWF4WWVhciA9IHllYXIgPT09IG9wdHMubWF4WWVhclxuICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCInICsgcmFuZElkICsgJ1wiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGl0bGVcIiByb2xlPVwiaGVhZGluZ1wiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPidcblxuICAgIGxldCBwcmV2ID0gdHJ1ZVxuICAgIGxldCBuZXh0ID0gdHJ1ZVxuXG4gICAgZm9yIChhcnIgPSBbXSwgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBhcnIucHVzaChcbiAgICAgICAgJzxvcHRpb24gdmFsdWU9XCInICtcbiAgICAgICAgICAoeWVhciA9PT0gcmVmWWVhciA/IGkgLSBjIDogMTIgKyBpIC0gYykgK1xuICAgICAgICAgICdcIicgK1xuICAgICAgICAgIChpID09PSBtb250aCA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArXG4gICAgICAgICAgKChpc01pblllYXIgJiYgaSA8IG9wdHMubWluTW9udGgpIHx8IChpc01heFllYXIgJiYgaSA+IG9wdHMubWF4TW9udGgpID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJykgK1xuICAgICAgICAgICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArXG4gICAgICAgICAgJzwvb3B0aW9uPidcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBtb250aEh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgYXJyLmpvaW4oJycpICtcbiAgICAgICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIGkgKyAnPC9vcHRpb24+JylcbiAgICB9XG4gICAgY29uc3QgeWVhckh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgeWVhciArXG4gICAgICBvcHRzLnllYXJTdWZmaXggK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICBhcnIuam9pbignJykgK1xuICAgICAgJzwvc2VsZWN0PjwvZGl2PidcblxuICAgIGlmIChvcHRzLnNob3dNb250aEFmdGVyWWVhcikge1xuICAgICAgaHRtbCArPSB5ZWFySHRtbCArIG1vbnRoSHRtbFxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9IG1vbnRoSHRtbCArIHllYXJIdG1sXG4gICAgfVxuXG4gICAgaWYgKGlzTWluWWVhciAmJiAobW9udGggPT09IDAgfHwgb3B0cy5taW5Nb250aCA+PSBtb250aCkpIHByZXYgPSBmYWxzZVxuXG4gICAgaWYgKGlzTWF4WWVhciAmJiAobW9udGggPT09IDExIHx8IG9wdHMubWF4TW9udGggPD0gbW9udGgpKSBuZXh0ID0gZmFsc2VcblxuICAgIGlmIChjID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcHJldicgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLnByZXZpb3VzTW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cbiAgICBpZiAoYyA9PT0gaW5zdGFuY2UuX28ubnVtYmVyT2ZNb250aHMgLSAxKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fbmV4dCcgKyAobmV4dCA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLm5leHRNb250aCArICc8L2J1dHRvbj4nXG4gICAgfVxuXG4gICAgaHRtbCArPSAnPC9kaXY+J1xuXG4gICAgcmV0dXJuIGh0bWxcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRhYmxlID0gKG9wdHMsIGRhdGEsIHJhbmRJZCkgPT5cbiAgICAnPHRhYmxlIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGFibGVcIiByb2xlPVwiZ3JpZFwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgIHJhbmRJZCArXG4gICAgJ1wiPicgK1xuICAgIHJlbmRlckhlYWQob3B0cykgK1xuICAgIHJlbmRlckJvZHkoZGF0YSkgK1xuICAgICc8L3RhYmxlPidcblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuXG4gICAgY29uc3QgZGVmT3B0c01pbkRhdGUgPSBvcHRzLm1pbkRhdGVcbiAgICBzZWxmLmRhdGVSYW5nZUFyciA9IFtdXG4gICAgc2VsZi5kYXRlUmFuZ2VTZWxlY3RlZEFyciA9IFtdXG5cbiAgICBzZWxmLl9vbk1vdXNlRG93biA9IGUgPT4ge1xuICAgICAgaWYgKCFzZWxmLl92KSByZXR1cm5cblxuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSByZXR1cm5cblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAob3B0cy5yYW5nZVNlbGVjdCkgeyAvLyBzZWxlY3RhYmxlIGRhdGUgcmFuZ2Ugb24gc2luZ2xlIGNhbGVuZGFyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSxcbiAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpXG4gICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uLS1zdGFydGVkJylcblxuICAgICAgICAgICAgICAgIHNlbGYuc2V0TWluRGF0ZShzZWxlY3RlZERhdGUpXG5cbiAgICAgICAgICAgICAgICAvLyDpgbjmip7lj6/og73jga/kuozjgaTjgb7jgafjgILjgajjgorjgYLjgYjjgZpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIgPSBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmRhdGVSYW5nZUFyci5wdXNoKHNlbGVjdGVkRGF0ZSlcblxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGYuZGF0ZVJhbmdlQXJyKVxuXG4gICAgICAgICAgICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZXREYXRlKGUpXG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlKVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgLy8gc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2V0TWluRGF0ZShkZWZPcHRzTWluRGF0ZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMuYmx1ckZpZWxkT25TZWxlY3QgJiYgb3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXREYXRlKFxuICAgICAgICAgICAgICAgICAgbmV3IERhdGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci15ZWFyJyksXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItZGF5JylcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ibHVyRmllbGRPblNlbGVjdCAmJiBvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25Nb3VzZU92ZXIgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uJykgJiYgIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWVtcHR5JykgJiYgIWhhc0NsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnaXMtZGlzYWJsZWQnKSAmJiBzZWxmLmRhdGVSYW5nZUFyci5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGFkZENsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnZGF0ZXBpY2tlcl9faGlnaGxpZ2h0ZWQnKVxuICAgICAgICB9LCAyMDApXG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA8c2VsZWN0PlxuICAgIHNlbGYuX29uQ2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHJldHVyblxuXG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoJykpIHtcbiAgICAgICAgc2VsZi5nb3RvTW9udGgodGFyZ2V0LnZhbHVlKVxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QteWVhcicpKSB7XG4gICAgICAgIHNlbGYuZ290b1llYXIodGFyZ2V0LnZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uS2V5Q2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcblxuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ3N1YnRyYWN0JywgMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDaGFuZ2UgPSBlID0+IHtcbiAgICAgIGxldCBkYXRlXG5cbiAgICAgIGlmIChlLmZpcmVkQnkgPT09IHNlbGYpIHJldHVyblxuXG4gICAgICBpZiAob3B0cy5wYXJzZSkge1xuICAgICAgICBkYXRlID0gb3B0cy5wYXJzZShvcHRzLmZpZWxkLnZhbHVlLCBvcHRzLmZvcm1hdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKG9wdHMuZmllbGQudmFsdWUpKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSBzZWxmLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICghc2VsZi5fdikgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Rm9jdXMgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDbGljayA9ICgpID0+IHtcbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEJsdXIgPSAoKSA9PiB7XG4gICAgICBsZXQgcEVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKChwRWwgPSBwRWwucGFyZW50Tm9kZSkpXG5cbiAgICAgIGlmICghc2VsZi5fYykge1xuICAgICAgICBzZWxmLl9iID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgLy8gc2VsZi5oaWRlKClcbiAgICAgICAgfSwgNTApXG4gICAgICB9XG4gICAgICBzZWxmLl9jID0gZmFsc2VcbiAgICB9XG5cbiAgICBzZWxmLl9vbkNsaWNrID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgbGV0IHBFbCA9IHRhcmdldFxuXG4gICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcbiAgICAgIGlmIChzZWxmLl92ICYmIHRhcmdldCAhPT0gb3B0cy50cmlnZ2VyICYmIHBFbCAhPT0gb3B0cy50cmlnZ2VyKSBzZWxmLmhpZGUoKVxuICAgIH1cblxuICAgIHNlbGYuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gJ2RhdGVwaWNrZXInICsgKG9wdHMuaXNSVEwgPyAnIGlzLXJ0bCcgOiAnJykgKyAob3B0cy50aGVtZSA/ICcgJyArIG9wdHMudGhlbWUgOiAnJylcblxuICAgIGFkZEV2ZW50KHNlbGYuZWwsICdtb3VzZWRvd24nLCBzZWxmLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2VvdmVyJywgc2VsZi5fb25Nb3VzZU92ZXIsIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmRGF0ZSA9IG9wdHMuZGVmYXVsdERhdGVcblxuICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkZWZEYXRlLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnY2xpY2snLCBzZWxmLl9vbklucHV0Q2xpY2spXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cbiAgUGxhaW5QaWNrZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIGNvbmZpZ3VyZSBmdW5jdGlvbmFsaXR5XG4gICAgICovXG4gICAgY29uZmlnOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKCF0aGlzLl9vKSB0aGlzLl9vID0gZXh0ZW5kKHt9LCBkZWZhdWx0cywgdHJ1ZSlcblxuICAgICAgY29uc3Qgb3B0cyA9IGV4dGVuZCh0aGlzLl9vLCBvcHRpb25zLCB0cnVlKVxuXG4gICAgICBvcHRzLmlzUlRMID0gISFvcHRzLmlzUlRMXG5cbiAgICAgIG9wdHMuZmllbGQgPSBvcHRzLmZpZWxkICYmIG9wdHMuZmllbGQubm9kZU5hbWUgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gdHlwZW9mIG9wdHMudGhlbWUgPT09ICdzdHJpbmcnICYmIG9wdHMudGhlbWUgPyBvcHRzLnRoZW1lIDogbnVsbFxuXG4gICAgICBvcHRzLmJvdW5kID0gISEob3B0cy5ib3VuZCAhPT0gdW5kZWZpbmVkID8gb3B0cy5maWVsZCAmJiBvcHRzLmJvdW5kIDogb3B0cy5maWVsZClcblxuICAgICAgb3B0cy50cmlnZ2VyID0gb3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSA/IG9wdHMudHJpZ2dlciA6IG9wdHMuZmllbGRcblxuICAgICAgb3B0cy5kaXNhYmxlV2Vla2VuZHMgPSAhIW9wdHMuZGlzYWJsZVdlZWtlbmRzXG5cbiAgICAgIG9wdHMuZGlzYWJsZURheUZuID0gdHlwZW9mIG9wdHMuZGlzYWJsZURheUZuID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkgb3B0cy5taW5EYXRlID0gZmFsc2VcblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkgb3B0cy5tYXhEYXRlID0gZmFsc2VcblxuICAgICAgaWYgKG9wdHMubWluRGF0ZSAmJiBvcHRzLm1heERhdGUgJiYgb3B0cy5tYXhEYXRlIDwgb3B0cy5taW5EYXRlKSBvcHRzLm1heERhdGUgPSBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAob3B0cy5taW5EYXRlKSB0aGlzLnNldE1pbkRhdGUob3B0cy5taW5EYXRlKVxuXG4gICAgICBpZiAob3B0cy5tYXhEYXRlKSB0aGlzLnNldE1heERhdGUob3B0cy5tYXhEYXRlKVxuXG4gICAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgICAgY29uc3QgZmFsbGJhY2sgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgLSAxMFxuICAgICAgICBvcHRzLnllYXJSYW5nZVswXSA9IHBhcnNlSW50KG9wdHMueWVhclJhbmdlWzBdLCAxMCkgfHwgZmFsbGJhY2tcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMV0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVsxXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRzLnllYXJSYW5nZSA9IE1hdGguYWJzKHBhcnNlSW50KG9wdHMueWVhclJhbmdlLCAxMCkpIHx8IGRlZmF1bHRzLnllYXJSYW5nZVxuICAgICAgICBpZiAob3B0cy55ZWFyUmFuZ2UgPiAxMDApIHtcbiAgICAgICAgICBvcHRzLnllYXJSYW5nZSA9IDEwMFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcHRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uICh1c2luZyBNb21lbnQuanMgaWYgYXZhaWxhYmxlKVxuICAgICAqL1xuICAgIC8vIHRvU3RyaW5nOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgLy8gICBmb3JtYXQgPSBmb3JtYXQgfHwgdGhpcy5fby5mb3JtYXRcbiAgICAvLyAgIGlmICghaXNEYXRlKHRoaXMuX2QpKSB7XG4gICAgLy8gICAgIHJldHVybiAnJ1xuICAgIC8vICAgfVxuXG4gICAgLy8gICBpZiAodGhpcy5fby50b1N0cmluZykge1xuICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLl9vKVxuICAgIC8vICAgICByZXR1cm4gdGhpcy5fby50b1N0cmluZyh0aGlzLl9kLCBmb3JtYXQpXG4gICAgLy8gICB9XG5cbiAgICAvLyAgIHJldHVybiB0aGlzLl9kLnRvRGF0ZVN0cmluZygpXG4gICAgLy8gfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbiAoZGF0ZSwgcHJldmVudE9uU2VsZWN0KSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgc2VsZi5fZCA9IG51bGxcblxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSAnJ1xuICAgICAgICAgIGZpcmVFdmVudChzZWxmLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgICAgZmlyZWRCeTogc2VsZlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZi5kcmF3KClcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2UoZGF0ZSkpXG5cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSByZXR1cm5cblxuICAgICAgY29uc3QgbWluID0gc2VsZi5fby5taW5EYXRlXG4gICAgICBjb25zdCBtYXggPSBzZWxmLl9vLm1heERhdGVcblxuICAgICAgaWYgKGlzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcbiAgICAgICAgZGF0ZSA9IG1pblxuICAgICAgfSBlbHNlIGlmIChpc0RhdGUobWF4KSAmJiBkYXRlID4gbWF4KSB7XG4gICAgICAgIGRhdGUgPSBtYXhcbiAgICAgIH1cblxuICAgICAgc2VsZi5fZCA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKVxuICAgICAgc2V0VG9TdGFydE9mRGF5KHNlbGYuX2QpXG4gICAgICBzZWxmLmdvdG9EYXRlKHNlbGYuX2QpXG5cbiAgICAgIGxldCBzdXBlckFyciA9IFtdXG5cbiAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgbGV0IHl5eXkgPSBlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgbGV0IG1tID0gemVyb1BhZGRpbmcoZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGV0IGRkID0gemVyb1BhZGRpbmcoZS5nZXREYXRlKCkpXG4gICAgICAgIGxldCB5eXl5bW1kZCA9IHl5eXkgKyAnLycgKyBtbSArICcvJyArIGRkXG4gICAgICAgIHN1cGVyQXJyLnB1c2goeXl5eW1tZGQpXG4gICAgICB9KVxuICAgICAgY29uc29sZS5sb2coc3VwZXJBcnIpXG5cbiAgICAgIGlmIChzZWxmLl9vLmZpZWxkKSB7XG4gICAgICAgIGlmIChzZWxmLl9vLnJhbmdlU2VsZWN0KSB7XG4gICAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9IHN1cGVyQXJyLmpvaW4oJyAtICcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9IHNlbGYudG9TdHJpbmcoKVxuICAgICAgICAgIGZpcmVFdmVudChzZWxmLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgICAgZmlyZWRCeTogc2VsZlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFwcmV2ZW50T25TZWxlY3QgJiYgdHlwZW9mIHNlbGYuX28ub25TZWxlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2VsZi5fby5vblNlbGVjdC5jYWxsKHNlbGYsIHNlbGYuZ2V0RGF0ZSgpKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGRhdGVcbiAgICAgKi9cbiAgICBnb3RvRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIGxldCBuZXdDYWxlbmRhciA9IHRydWVcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHJldHVyblxuXG4gICAgICBpZiAodGhpcy5jYWxlbmRhcnMpIHtcbiAgICAgICAgY29uc3QgZmlyc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzWzBdLnllYXIsIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCBsYXN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1t0aGlzLmNhbGVuZGFycy5sZW5ndGggLSAxXS5tb250aCwgMSlcbiAgICAgICAgY29uc3QgdmlzaWJsZURhdGUgPSBkYXRlLmdldFRpbWUoKVxuICAgICAgICAvLyBnZXQgdGhlIGVuZCBvZiB0aGUgbW9udGhcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldE1vbnRoKGxhc3RWaXNpYmxlRGF0ZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpXG4gICAgICAgIG5ld0NhbGVuZGFyID0gdmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0NhbGVuZGFyKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgICAgaWYgKHRoaXMuX28ubWFpbkNhbGVuZGFyID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKz0gMSAtIHRoaXMuX28ubnVtYmVyT2ZNb250aHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIGFkanVzdERhdGU6IGZ1bmN0aW9uIChzaWduLCBkYXlzKSB7XG4gICAgICBjb25zdCBkYXkgPSB0aGlzLmdldERhdGUoKSB8fCBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gcGFyc2VJbnQoZGF5cykgKiAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAgIGxldCBuZXdEYXlcblxuICAgICAgaWYgKHNpZ24gPT09ICdhZGQnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgKyBkaWZmZXJlbmNlKVxuICAgICAgfSBlbHNlIGlmIChzaWduID09PSAnc3VidHJhY3QnKSB7XG4gICAgICAgIG5ld0RheSA9IG5ldyBEYXRlKGRheS52YWx1ZU9mKCkgLSBkaWZmZXJlbmNlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldERhdGUobmV3RGF5KVxuICAgIH0sXG5cbiAgICBhZGp1c3RDYWxlbmRhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBjXG5cbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdID0gYWRqdXN0Q2FsZW5kYXIodGhpcy5jYWxlbmRhcnNbMF0pXG4gICAgICBmb3IgKGMgPSAxOyBjIDwgdGhpcy5fby5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzW2NdID0gYWRqdXN0Q2FsZW5kYXIoe1xuICAgICAgICAgIG1vbnRoOiB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArIGMsXG4gICAgICAgICAgeWVhcjogdGhpcy5jYWxlbmRhcnNbMF0ueWVhclxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgZ290b1RvZGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgbW9udGggKHplcm8taW5kZXgsIGUuZy4gMDogSmFudWFyeSlcbiAgICAgKi9cbiAgICBnb3RvTW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xuICAgICAgaWYgKCFpc05hTihtb250aCkpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbmV4dE1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCsrXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIHByZXZNb250aDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgtLVxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGZ1bGwgeWVhciAoZS5nLiBcIjIwMTJcIilcbiAgICAgKi9cbiAgICBnb3RvWWVhcjogZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWluRGF0ZVxuICAgICAqL1xuICAgIHNldE1pbkRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWluRGF0ZSA9IGRlZmF1bHRzLm1pbkRhdGVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gZGVmYXVsdHMubWluWWVhclxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gZGVmYXVsdHMubWluTW9udGhcbiAgICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gZGVmYXVsdHMuc3RhcnRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdGhlIG1heERhdGVcbiAgICAgKi9cbiAgICBzZXRNYXhEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgc2V0VG9TdGFydE9mRGF5KHZhbHVlKVxuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSB2YWx1ZVxuICAgICAgICB0aGlzLl9vLm1heFllYXIgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuX28ubWF4TW9udGggPSB2YWx1ZS5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1heERhdGUgPSBkZWZhdWx0cy5tYXhEYXRlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IGRlZmF1bHRzLm1heFllYXJcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IGRlZmF1bHRzLm1heE1vbnRoXG4gICAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSBkZWZhdWx0cy5lbmRSYW5nZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBzZXRTdGFydFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uc3RhcnRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIHNldEVuZFJhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX28uZW5kUmFuZ2UgPSB2YWx1ZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWZyZXNoIHRoZSBIVE1MXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24gKGZvcmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3YgJiYgIWZvcmNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3QgbWluWWVhciA9IG9wdHMubWluWWVhclxuICAgICAgY29uc3QgbWF4WWVhciA9IG9wdHMubWF4WWVhclxuICAgICAgY29uc3QgbWluTW9udGggPSBvcHRzLm1pbk1vbnRoXG4gICAgICBjb25zdCBtYXhNb250aCA9IG9wdHMubWF4TW9udGhcbiAgICAgIGxldCBodG1sID0gJydcbiAgICAgIGxldCByYW5kSWRcblxuICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWluWWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3kgPj0gbWF4WWVhcikge1xuICAgICAgICB0aGlzLl95ID0gbWF4WWVhclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcbiAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlcl9fdGl0bGUtJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgJycpLnN1YnN0cigwLCAyKVxuXG4gICAgICBsZXQgY1xuICAgICAgZm9yIChjID0gMDsgYyA8IG9wdHMubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICBodG1sICs9XG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sZW5kYXJcIj4nICtcbiAgICAgICAgICByZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArXG4gICAgICAgICAgdGhpcy5yZW5kZXIodGhpcy5jYWxlbmRhcnNbY10ueWVhciwgdGhpcy5jYWxlbmRhcnNbY10ubW9udGgsIHJhbmRJZCkgK1xuICAgICAgICAgICc8L2Rpdj4nXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICBpZiAob3B0cy5maWVsZC50eXBlICE9PSAnaGlkZGVuJykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgb3B0cy50cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICB9LCAxKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fby5vbkRyYXcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fby5vbkRyYXcodGhpcylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgLy8gbGV0IHRoZSBzY3JlZW4gcmVhZGVyIHVzZXIga25vdyB0byB1c2UgYXJyb3cga2V5c1xuICAgICAgICBvcHRzLmZpZWxkLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdVc2UgdGhlIGFycm93IGtleXMgdG8gcGljayBhIGRhdGUnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX28uY29udGFpbmVyKSByZXR1cm5cblxuICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLl9vLnRyaWdnZXJcbiAgICAgIGxldCBwRWwgPSBmaWVsZFxuICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmVsLm9mZnNldEhlaWdodFxuICAgICAgY29uc3Qgdmlld3BvcnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgICAgY29uc3Qgdmlld3BvcnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICAgIGxldCBsZWZ0XG4gICAgICBsZXQgdG9wXG5cbiAgICAgIGlmICh0eXBlb2YgZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudFJlY3QgPSBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBsZWZ0ID0gY2xpZW50UmVjdC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0XG4gICAgICAgIHRvcCA9IGNsaWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZWZ0ID0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgdG9wID0gcEVsLm9mZnNldFRvcCArIHBFbC5vZmZzZXRIZWlnaHRcbiAgICAgICAgd2hpbGUgKChwRWwgPSBwRWwub2Zmc2V0UGFyZW50KSkge1xuICAgICAgICAgIGxlZnQgKz0gcEVsLm9mZnNldExlZnRcbiAgICAgICAgICB0b3AgKz0gcEVsLm9mZnNldFRvcFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgYm90dG9tICYgbGVmdFxuICAgICAgaWYgKFxuICAgICAgICAodGhpcy5fby5yZXBvc2l0aW9uICYmIGxlZnQgKyB3aWR0aCA+IHZpZXdwb3J0V2lkdGgpIHx8XG4gICAgICAgICh0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSAmJiBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aCA+IDApXG4gICAgICApIHtcbiAgICAgICAgbGVmdCA9IGxlZnQgLSB3aWR0aCArIGZpZWxkLm9mZnNldFdpZHRoXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgICh0aGlzLl9vLnJlcG9zaXRpb24gJiYgdG9wICsgaGVpZ2h0ID4gdmlld3BvcnRIZWlnaHQgKyBzY3JvbGxUb3ApIHx8XG4gICAgICAgICh0aGlzLl9vLnBvc2l0aW9uLmluZGV4T2YoJ3RvcCcpID4gLTEgJiYgdG9wIC0gaGVpZ2h0IC0gZmllbGQub2Zmc2V0SGVpZ2h0ID4gMClcbiAgICAgICkge1xuICAgICAgICB0b3AgPSB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHRcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCdcbiAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW5kZXIgSFRNTCBmb3IgYSBwYXJ0aWN1bGFyIG1vbnRoXG4gICAgICovXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoeWVhciwgbW9udGgsIHJhbmRJZCkge1xuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICAgIGNvbnN0IGRheXMgPSBnZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aClcbiAgICAgIGxldCBiZWZvcmUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KClcbiAgICAgIGxldCBkYXRhID0gW11cbiAgICAgIGxldCByb3cgPSBbXVxuXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkobm93KVxuXG4gICAgICBpZiAob3B0cy5maXJzdERheSA+IDApIHtcbiAgICAgICAgYmVmb3JlIC09IG9wdHMuZmlyc3REYXlcbiAgICAgICAgaWYgKGJlZm9yZSA8IDApIHtcbiAgICAgICAgICBiZWZvcmUgKz0gN1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IDExIDogbW9udGggLSAxXG4gICAgICBjb25zdCBuZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyAwIDogbW9udGggKyAxXG4gICAgICBjb25zdCB5ZWFyT2ZQcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyB5ZWFyIC0gMSA6IHllYXJcbiAgICAgIGNvbnN0IHllYXJPZk5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IHllYXIgKyAxIDogeWVhclxuICAgICAgY29uc3QgZGF5c0luUHJldmlvdXNNb250aCA9IGdldERheXNJbk1vbnRoKHllYXJPZlByZXZpb3VzTW9udGgsIHByZXZpb3VzTW9udGgpXG4gICAgICBsZXQgY2VsbHMgPSBkYXlzICsgYmVmb3JlXG4gICAgICBsZXQgYWZ0ZXIgPSBjZWxsc1xuXG4gICAgICB3aGlsZSAoYWZ0ZXIgPiA3KSB7XG4gICAgICAgIGFmdGVyIC09IDdcbiAgICAgIH1cblxuICAgICAgY2VsbHMgKz0gNyAtIGFmdGVyXG4gICAgICBsZXQgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgbGV0IGksIHJcblxuICAgICAgZm9yIChpID0gMCwgciA9IDA7IGkgPCBjZWxsczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxICsgKGkgLSBiZWZvcmUpKVxuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gaXNEYXRlKHRoaXMuX2QpID8gY29tcGFyZURhdGVzKGRheSwgdGhpcy5fZCkgOiBmYWxzZVxuICAgICAgICBjb25zdCBpc1RvZGF5ID0gY29tcGFyZURhdGVzKGRheSwgbm93KVxuICAgICAgICBjb25zdCBoYXNFdmVudCA9IG9wdHMuZXZlbnRzLmluZGV4T2YoZGF5LnRvRGF0ZVN0cmluZygpKSAhPT0gLTFcbiAgICAgICAgY29uc3QgaXNFbXB0eSA9IGkgPCBiZWZvcmUgfHwgaSA+PSBkYXlzICsgYmVmb3JlXG4gICAgICAgIGxldCBkYXlOdW1iZXIgPSAxICsgKGkgLSBiZWZvcmUpXG4gICAgICAgIGxldCBtb250aE51bWJlciA9IG1vbnRoXG4gICAgICAgIGxldCB5ZWFyTnVtYmVyID0geWVhclxuICAgICAgICBjb25zdCBpc1N0YXJ0UmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgY29tcGFyZURhdGVzKG9wdHMuc3RhcnRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0VuZFJhbmdlID0gb3B0cy5lbmRSYW5nZSAmJiBjb21wYXJlRGF0ZXMob3B0cy5lbmRSYW5nZSwgZGF5KVxuICAgICAgICBjb25zdCBpc0luUmFuZ2UgPSBvcHRzLnN0YXJ0UmFuZ2UgJiYgb3B0cy5lbmRSYW5nZSAmJiBvcHRzLnN0YXJ0UmFuZ2UgPCBkYXkgJiYgZGF5IDwgb3B0cy5lbmRSYW5nZVxuICAgICAgICBjb25zdCBpc0Rpc2FibGVkID1cbiAgICAgICAgICAob3B0cy5taW5EYXRlICYmIGRheSA8IG9wdHMubWluRGF0ZSkgfHxcbiAgICAgICAgICAob3B0cy5tYXhEYXRlICYmIGRheSA+IG9wdHMubWF4RGF0ZSkgfHxcbiAgICAgICAgICAob3B0cy5kaXNhYmxlV2Vla2VuZHMgJiYgaXNXZWVrZW5kKGRheSkpIHx8XG4gICAgICAgICAgKG9wdHMuZGlzYWJsZURheUZuICYmIG9wdHMuZGlzYWJsZURheUZuKGRheSkpXG5cbiAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICBpZiAoaSA8IGJlZm9yZSkge1xuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5c0luUHJldmlvdXNNb250aCArIGRheU51bWJlclxuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBwcmV2aW91c01vbnRoXG4gICAgICAgICAgICB5ZWFyTnVtYmVyID0geWVhck9mUHJldmlvdXNNb250aFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlOdW1iZXIgLSBkYXlzXG4gICAgICAgICAgICBtb250aE51bWJlciA9IG5leHRNb250aFxuICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZk5leHRNb250aFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRheUNvbmZpZyA9IHtcbiAgICAgICAgICBkYXk6IGRheU51bWJlcixcbiAgICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXG4gICAgICAgICAgeWVhcjogeWVhck51bWJlcixcbiAgICAgICAgICBoYXNFdmVudDogaGFzRXZlbnQsXG4gICAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5LFxuICAgICAgICAgIGlzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcbiAgICAgICAgICBpc1N0YXJ0UmFuZ2U6IGlzU3RhcnRSYW5nZSxcbiAgICAgICAgICBpc0VuZFJhbmdlOiBpc0VuZFJhbmdlLFxuICAgICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxuICAgICAgICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyxcbiAgICAgICAgICBlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IG9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy5waWNrV2hvbGVXZWVrICYmIGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBpc1dlZWtTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIHJvdy5wdXNoKHJlbmRlckRheShkYXlDb25maWcpKVxuXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcbiAgICAgICAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgICAgICAgcm93LnVuc2hpZnQocmVuZGVyV2VlayhpIC0gYmVmb3JlLCBtb250aCwgeWVhcikpXG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEucHVzaChyZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMLCBvcHRzLnBpY2tXaG9sZVdlZWssIGlzV2Vla1NlbGVjdGVkKSlcbiAgICAgICAgICByb3cgPSBbXVxuICAgICAgICAgIHIgPSAwXG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyVGFibGUob3B0cywgZGF0YSwgcmFuZElkKVxuICAgIH0sXG5cbiAgICBpc1Zpc2libGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl92XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICB0aGlzLl92ID0gdHJ1ZVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICBhZGRFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICAgICAgICB0aGlzLmFkanVzdFBvc2l0aW9uKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fby5vbk9wZW4uY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLl92XG4gICAgICBpZiAodiAhPT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICByZW1vdmVFdmVudChkb2N1bWVudCwgJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ3N0YXRpYycgLy8gcmVzZXRcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5sZWZ0ID0gJ2F1dG8nXG4gICAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gJ2F1dG8nXG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWwsICdpcy1oaWRkZW4nKVxuICAgICAgICB0aGlzLl92ID0gZmFsc2VcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5fby5vbkNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fby5vbkNsb3NlLmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ3RvdWNoZW5kJywgdGhpcy5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLmZpZWxkLCAnY2hhbmdlJywgdGhpcy5fb25JbnB1dENoYW5nZSlcbiAgICAgICAgaWYgKHRoaXMuX28uYm91bmQpIHtcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdjbGljaycsIHRoaXMuX29uSW5wdXRDbGljaylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdmb2N1cycsIHRoaXMuX29uSW5wdXRGb2N1cylcbiAgICAgICAgICByZW1vdmVFdmVudCh0aGlzLl9vLnRyaWdnZXIsICdibHVyJywgdGhpcy5fb25JbnB1dEJsdXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgdGhpcy5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWwpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHdpbmRvdy5QbGFpblBpY2tlciA9IFBsYWluUGlja2VyXG59KSgpXG4iXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJ3aW5kb3ciLCJhZGRFdmVudCIsImVsIiwiZSIsImNhbGxiYWNrIiwiY2FwdHVyZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0cmltIiwic3RyIiwicmVwbGFjZSIsImhhc0NsYXNzIiwiY24iLCJjbGFzc05hbWUiLCJpbmRleE9mIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImlzQXJyYXkiLCJ0ZXN0IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwib2JqIiwiaXNEYXRlIiwiaXNOYU4iLCJnZXRUaW1lIiwiemVyb1BhZGRpbmciLCJudW0iLCJzbGljZSIsImlzV2Vla2VuZCIsImRheSIsImRhdGUiLCJnZXREYXkiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImNvbXBhcmVEYXRlcyIsImEiLCJiIiwiZXh0ZW5kIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJmaXJlRXZlbnQiLCJldmVudE5hbWUiLCJkYXRhIiwiZXYiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJjcmVhdGVFdmVudE9iamVjdCIsImFkanVzdENhbGVuZGFyIiwiY2FsZW5kYXIiLCJNYXRoIiwiY2VpbCIsImFicyIsImZsb29yIiwiZGVmYXVsdHMiLCJyZW5kZXJEYXlOYW1lIiwib3B0cyIsImFiYnIiLCJmaXJzdERheSIsImkxOG4iLCJ3ZWVrZGF5c1Nob3J0Iiwid2Vla2RheXMiLCJyZW5kZXJEYXkiLCJhcnIiLCJhcmlhU2VsZWN0ZWQiLCJpc0VtcHR5Iiwic2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsInB1c2giLCJlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMiLCJpc0Rpc2FibGVkIiwiaXNUb2RheSIsImlzU2VsZWN0ZWQiLCJoYXNFdmVudCIsImlzSW5SYW5nZSIsImlzU3RhcnRSYW5nZSIsImlzRW5kUmFuZ2UiLCJqb2luIiwicmVuZGVyV2VlayIsImQiLCJtIiwieSIsIm9uZWphbiIsIndlZWtOdW0iLCJyZW5kZXJSb3ciLCJkYXlzIiwiaXNSVEwiLCJwaWNrV2hvbGVXZWVrIiwiaXNSb3dTZWxlY3RlZCIsInJldmVyc2UiLCJyZW5kZXJCb2R5Iiwicm93cyIsInJlbmRlckhlYWQiLCJpIiwic2hvd1dlZWtOdW1iZXIiLCJyZW5kZXJUaXRsZSIsImluc3RhbmNlIiwiYyIsInJlZlllYXIiLCJyYW5kSWQiLCJqIiwiX28iLCJpc01pblllYXIiLCJtaW5ZZWFyIiwiaXNNYXhZZWFyIiwibWF4WWVhciIsImh0bWwiLCJwcmV2IiwibmV4dCIsIm1pbk1vbnRoIiwibWF4TW9udGgiLCJtb250aHMiLCJtb250aEh0bWwiLCJ5ZWFyUmFuZ2UiLCJ5ZWFySHRtbCIsInllYXJTdWZmaXgiLCJzaG93TW9udGhBZnRlclllYXIiLCJwcmV2aW91c01vbnRoIiwibnVtYmVyT2ZNb250aHMiLCJuZXh0TW9udGgiLCJyZW5kZXJUYWJsZSIsIlBsYWluUGlja2VyIiwib3B0aW9ucyIsInNlbGYiLCJjb25maWciLCJkZWZPcHRzTWluRGF0ZSIsIm1pbkRhdGUiLCJkYXRlUmFuZ2VBcnIiLCJkYXRlUmFuZ2VTZWxlY3RlZEFyciIsIl9vbk1vdXNlRG93biIsIl92IiwiZXZlbnQiLCJ0YXJnZXQiLCJzcmNFbGVtZW50IiwicGFyZW50Tm9kZSIsImJvdW5kIiwicmFuZ2VTZWxlY3QiLCJzZWxlY3RlZERhdGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRNaW5EYXRlIiwibGVuZ3RoIiwiZm9yRWFjaCIsInNldERhdGUiLCJibHVyRmllbGRPblNlbGVjdCIsImZpZWxkIiwiYmx1ciIsImhpZGUiLCJwcmV2TW9udGgiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwiX2MiLCJfb25Nb3VzZU92ZXIiLCJfb25DaGFuZ2UiLCJnb3RvTW9udGgiLCJ2YWx1ZSIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiaXNWaXNpYmxlIiwia2V5Q29kZSIsImFkanVzdERhdGUiLCJfb25JbnB1dENoYW5nZSIsImZpcmVkQnkiLCJwYXJzZSIsImZvcm1hdCIsInNob3ciLCJfb25JbnB1dEZvY3VzIiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfYiIsInNldFRpbWVvdXQiLCJfb25DbGljayIsInRyaWdnZXIiLCJjcmVhdGVFbGVtZW50IiwidGhlbWUiLCJjb250YWluZXIiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJpbnNlcnRCZWZvcmUiLCJuZXh0U2libGluZyIsImRlZmF1bHREYXRlIiwic2V0RGVmYXVsdERhdGUiLCJkZWZEYXRlIiwiZ290b0RhdGUiLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJub20iLCJwYXJzZUludCIsIm1heERhdGUiLCJzZXRNYXhEYXRlIiwiZmFsbGJhY2siLCJnZXRGdWxsWWVhciIsIl9kIiwicHJldmVudE9uU2VsZWN0IiwiZHJhdyIsIm1pbiIsIm1heCIsInN1cGVyQXJyIiwieXl5eSIsIm1tIiwiZ2V0TW9udGgiLCJkZCIsImdldERhdGUiLCJ5eXl5bW1kZCIsImxvZyIsIm9uU2VsZWN0IiwibmV3Q2FsZW5kYXIiLCJjYWxlbmRhcnMiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsIm1haW5DYWxlbmRhciIsImFkanVzdENhbGVuZGFycyIsInNpZ24iLCJkaWZmZXJlbmNlIiwibmV3RGF5IiwidmFsdWVPZiIsInN0YXJ0UmFuZ2UiLCJlbmRSYW5nZSIsImZvcmNlIiwiX3kiLCJfbSIsInJhbmRvbSIsInN1YnN0ciIsInJlbmRlciIsImlubmVySFRNTCIsInR5cGUiLCJmb2N1cyIsIm9uRHJhdyIsInNldEF0dHJpYnV0ZSIsInN0eWxlIiwicG9zaXRpb24iLCJ3aWR0aCIsIm9mZnNldFdpZHRoIiwiaGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0Iiwidmlld3BvcnRXaWR0aCIsImlubmVyV2lkdGgiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsInZpZXdwb3J0SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJzY3JvbGxUb3AiLCJwYWdlWU9mZnNldCIsImxlZnQiLCJ0b3AiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjbGllbnRSZWN0IiwicGFnZVhPZmZzZXQiLCJib3R0b20iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwib2Zmc2V0UGFyZW50IiwicmVwb3NpdGlvbiIsIm5vdyIsImJlZm9yZSIsInJvdyIsInllYXJPZlByZXZpb3VzTW9udGgiLCJ5ZWFyT2ZOZXh0TW9udGgiLCJkYXlzSW5QcmV2aW91c01vbnRoIiwiY2VsbHMiLCJhZnRlciIsImlzV2Vla1NlbGVjdGVkIiwiciIsImV2ZW50cyIsInRvRGF0ZVN0cmluZyIsImRheU51bWJlciIsIm1vbnRoTnVtYmVyIiwieWVhck51bWJlciIsImRheUNvbmZpZyIsInVuc2hpZnQiLCJhZGp1c3RQb3NpdGlvbiIsIm9uT3BlbiIsInYiLCJvbkNsb3NlIiwicmVtb3ZlQ2hpbGQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxBQUFDLENBQUMsWUFBWTs7OztNQUlOQSxXQUFXQyxPQUFPRCxRQUF4QjtNQUNNRSxXQUFXLFNBQVhBLFFBQVcsQ0FBQ0MsRUFBRCxFQUFLQyxDQUFMLEVBQVFDLFFBQVIsRUFBa0JDLE9BQWxCO1dBQThCSCxHQUFHSSxnQkFBSCxDQUFvQkgsQ0FBcEIsRUFBdUJDLFFBQXZCLEVBQWlDLENBQUMsQ0FBQ0MsT0FBbkMsQ0FBOUI7R0FBakI7O01BRU1FLGNBQWMsU0FBZEEsV0FBYyxDQUFDTCxFQUFELEVBQUtDLENBQUwsRUFBUUMsUUFBUixFQUFrQkMsT0FBbEI7V0FBOEJILEdBQUdNLG1CQUFILENBQXVCTCxDQUF2QixFQUEwQkMsUUFBMUIsRUFBb0MsQ0FBQyxDQUFDQyxPQUF0QyxDQUE5QjtHQUFwQjs7TUFFTUksT0FBTyxTQUFQQSxJQUFPO1dBQVFDLElBQUlELElBQUosR0FBV0MsSUFBSUQsSUFBSixFQUFYLEdBQXdCQyxJQUFJQyxPQUFKLENBQVksWUFBWixFQUEwQixFQUExQixDQUFoQztHQUFiOztNQUVNQyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ1YsRUFBRCxFQUFLVyxFQUFMO1dBQVksQ0FBQyxNQUFNWCxHQUFHWSxTQUFULEdBQXFCLEdBQXRCLEVBQTJCQyxPQUEzQixDQUFtQyxNQUFNRixFQUFOLEdBQVcsR0FBOUMsTUFBdUQsQ0FBQyxDQUFwRTtHQUFqQjs7TUFFTUcsV0FBVyxTQUFYQSxRQUFXLENBQUNkLEVBQUQsRUFBS1csRUFBTCxFQUFZO1FBQ3ZCLENBQUNELFNBQVNWLEVBQVQsRUFBYVcsRUFBYixDQUFMLEVBQXVCWCxHQUFHWSxTQUFILEdBQWVaLEdBQUdZLFNBQUgsS0FBaUIs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
