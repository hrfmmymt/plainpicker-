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

  var prevAll = function prevAll(element) {
    var result = [];
    while ((element = element.previousElementSibling) !== null) {
      result.push(element);
    }return result;
  };

  var getClosest = function getClosest(el, selector) {
    var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

    while (el) {
      if (matchesSelector.call(el, selector)) {
        break;
      }
      el = el.parentElement;
    }
    return el;
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
                self.dateRangeArr.push(selectedDate);

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

    self._onMouseOver = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      if (!target || !opts.rangeSelect) return;

      if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled') && self.dateRangeArr.length > 0) {
        var targetParentsTr = getClosest(target, 'tr');
        addClass(targetParentsTr, 'hoveredWeek');

        var lastTargetPicker = getClosest(targetParentsTr, '.datepicker__lendar__last');
        var parentDatePicker = void 0;

        if (lastTargetPicker !== null) {
          parentDatePicker = lastTargetPicker.parentNode;
          var tableOfFirst = parentDatePicker.children[0];
          var trsOfFirstTable = tableOfFirst.getElementsByTagName('tr');
          var lastTrOfFirstTable = trsOfFirstTable[trsOfFirstTable.length - 1];
          addClass(lastTrOfFirstTable, 'hoveredOtherTable');
        }

        var hoveredOtherTable = document.getElementsByClassName('hoveredOtherTable');

        Array.prototype.forEach.call(hoveredOtherTable, function (node) {
          var inRange = node.querySelectorAll('td:not(.is-disabled)');

          Array.prototype.forEach.call(inRange, function (nodeChildren) {
            addClass(nodeChildren, 'in-range');
          });

          Array.prototype.forEach.call(prevAll(node), function (nodeChildren) {
            var tdsPrevLastWeek = nodeChildren.querySelectorAll('td:not(.is-disabled)');
            Array.prototype.forEach.call(tdsPrevLastWeek, function (el) {
              addClass(el, 'in-range');
            });
          });
        });

        Array.prototype.forEach.call(prevAll(targetParentsTr), function (node) {
          var inRange = node.querySelectorAll('td:not(.is-disabled)');
          Array.prototype.forEach.call(inRange, function (nodeChildren) {
            addClass(nodeChildren, 'in-range');
          });
        });

        Array.prototype.forEach.call(prevAll(target.parentNode), function (node) {
          if (!hasClass(node, 'is-disabled')) addClass(node, 'in-range');
        });
      }
    };

    self._onMouseLeave = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target || !opts.rangeSelect) return;

      if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled') && self.dateRangeArr.length > 0) {
        var targetParentsTr = getClosest(target, 'tr');
        removeClass(targetParentsTr, 'hoveredWeek');

        var parentDatePicker = getClosest(target, '.datepicker');
        Array.prototype.forEach.call(parentDatePicker.getElementsByTagName('td'), function (node) {
          removeClass(node, 'in-range');
        });

        Array.prototype.forEach.call(document.getElementsByClassName('hoveredOtherTable'), function (node) {
          removeClass(node, 'hoveredOtherTable');
        });
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
    addEvent(self.el, 'mouseover', self._onMouseOver, true);
    addEvent(self.el, 'mouseleave', self._onMouseLeave, true);
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

      var c = void 0,
          positionStr = void 0;
      for (c = 0; c < opts.numberOfMonths; c++) {
        if (c === 0) {
          positionStr = ' datepicker__lendar__first';
        } else if (c === opts.numberOfMonths - 1) {
          positionStr = ' datepicker__lendar__last';
        } else {
          positionStr = '';
        }
        if (opts.numberOfMonths === 1) positionStr = '';

        html += '<div class="datepicker__lendar' + positionStr + '">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogZmVhdHVyZSBkZXRlY3Rpb24gYW5kIGhlbHBlciBmdW5jdGlvbnNcbiAgICovXG4gIGNvbnN0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50XG4gIGNvbnN0IGFkZEV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHJlbW92ZUV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHRyaW0gPSBzdHIgPT4gKHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cbiAgY29uc3QgaGFzQ2xhc3MgPSAoZWwsIGNuKSA9PiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcblxuICBjb25zdCBhZGRDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBpZiAoIWhhc0NsYXNzKGVsLCBjbikpIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSA9PT0gJycgPyBjbiA6IGVsLmNsYXNzTmFtZSArICcgJyArIGNuXG4gIH1cblxuICBjb25zdCByZW1vdmVDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBlbC5jbGFzc05hbWUgPSB0cmltKCgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLnJlcGxhY2UoJyAnICsgY24gKyAnICcsICcgJykpXG4gIH1cblxuICBjb25zdCBpc0FycmF5ID0gb2JqID0+IC9BcnJheS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcblxuICBjb25zdCBpc0RhdGUgPSBvYmogPT4gL0RhdGUvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuXG4gIGNvbnN0IHplcm9QYWRkaW5nID0gbnVtID0+ICgnMCcgKyBudW0pLnNsaWNlKC0yKVxuXG4gIGNvbnN0IGlzV2Vla2VuZCA9IGRhdGUgPT4ge1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgY29uc3QgcHJldkFsbCA9IGVsZW1lbnQgPT4ge1xuICAgIGxldCByZXN1bHQgPSBbXVxuICAgIHdoaWxlICgoZWxlbWVudCA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZykgIT09IG51bGwpIHJlc3VsdC5wdXNoKGVsZW1lbnQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgY29uc3QgZ2V0Q2xvc2VzdCA9IChlbCwgc2VsZWN0b3IpID0+IHtcbiAgICBjb25zdCBtYXRjaGVzU2VsZWN0b3IgPSBlbC5tYXRjaGVzIHx8IGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBlbC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZWwubXNNYXRjaGVzU2VsZWN0b3JcblxuICAgIHdoaWxlIChlbCkge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3Rvci5jYWxsKGVsLCBzZWxlY3RvcikpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudFxuICAgIH1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIGNvbnN0IGlzTGVhcFllYXIgPSB5ZWFyID0+ICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCB5ZWFyICUgNDAwID09PSAwXG5cbiAgY29uc3QgZ2V0RGF5c0luTW9udGggPSAoeWVhciwgbW9udGgpID0+IFszMSwgaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF1cblxuICBjb25zdCBzZXRUb1N0YXJ0T2ZEYXkgPSBkYXRlID0+IHtcbiAgICBpZiAoaXNEYXRlKGRhdGUpKSBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gIH1cblxuICBjb25zdCBjb21wYXJlRGF0ZXMgPSAoYSwgYikgPT4gYS5nZXRUaW1lKCkgPT09IGIuZ2V0VGltZSgpXG5cbiAgY29uc3QgZXh0ZW5kID0gKHRvLCBmcm9tLCBvdmVyd3JpdGUpID0+IHtcbiAgICBsZXQgcHJvcFxuICAgIGxldCBoYXNQcm9wXG5cbiAgICBmb3IgKHByb3AgaW4gZnJvbSkge1xuICAgICAgaGFzUHJvcCA9IHRvW3Byb3BdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmIChoYXNQcm9wICYmIHR5cGVvZiBmcm9tW3Byb3BdID09PSAnb2JqZWN0JyAmJiBmcm9tW3Byb3BdICE9PSBudWxsICYmIGZyb21bcHJvcF0ubm9kZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXNEYXRlKGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBuZXcgRGF0ZShmcm9tW3Byb3BdLmdldFRpbWUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmcm9tW3Byb3BdKSkge1xuICAgICAgICAgIGlmIChvdmVyd3JpdGUpIHtcbiAgICAgICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXS5zbGljZSgwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b1twcm9wXSA9IGV4dGVuZCh7fSwgZnJvbVtwcm9wXSwgb3ZlcndyaXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG92ZXJ3cml0ZSB8fCAhaGFzUHJvcCkge1xuICAgICAgICB0b1twcm9wXSA9IGZyb21bcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvXG4gIH1cblxuICBjb25zdCBmaXJlRXZlbnQgPSAoZWwsIGV2ZW50TmFtZSwgZGF0YSkgPT4ge1xuICAgIGxldCBldlxuXG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJylcbiAgICAgIGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKVxuICAgICAgZXYgPSBleHRlbmQoZXYsIGRhdGEpXG4gICAgICBlbC5maXJlRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgZXYpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYWRqdXN0Q2FsZW5kYXIgPSBjYWxlbmRhciA9PiB7XG4gICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xuICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCArPSAxMlxuICAgIH1cbiAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xuICAgICAgY2FsZW5kYXIueWVhciArPSBNYXRoLmZsb29yKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKVxuICAgICAgY2FsZW5kYXIubW9udGggLT0gMTJcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyXG4gIH1cblxuICAvKipcbiAgICogZGVmYXVsdHMgYW5kIGxvY2FsaXNhdGlvblxuICAgKi9cbiAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgLy8gYmluZCB0aGUgcGlja2VyIHRvIGEgZm9ybSBmaWVsZFxuICAgIGZpZWxkOiBudWxsLFxuXG4gICAgLy8gYXV0b21hdGljYWxseSBzaG93L2hpZGUgdGhlIHBpY2tlciBvbiBgZmllbGRgIGZvY3VzIChkZWZhdWx0IGB0cnVlYCBpZiBgZmllbGRgIGlzIHNldClcbiAgICBib3VuZDogdW5kZWZpbmVkLFxuXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIGRhdGVwaWNrZXIsIHJlbGF0aXZlIHRvIHRoZSBmaWVsZCAoZGVmYXVsdCB0byBib3R0b20gJiBsZWZ0KVxuICAgIC8vICgnYm90dG9tJyAmICdsZWZ0JyBrZXl3b3JkcyBhcmUgbm90IHVzZWQsICd0b3AnICYgJ3JpZ2h0JyBhcmUgbW9kaWZpZXIgb24gdGhlIGJvdHRvbS9sZWZ0IHBvc2l0aW9uKVxuICAgIHBvc2l0aW9uOiAnYm90dG9tIGxlZnQnLFxuXG4gICAgLy8gYXV0b21hdGljYWxseSBmaXQgaW4gdGhlIHZpZXdwb3J0IGV2ZW4gaWYgaXQgbWVhbnMgcmVwb3NpdGlvbmluZyBmcm9tIHRoZSBwb3NpdGlvbiBvcHRpb25cbiAgICByZXBvc2l0aW9uOiB0cnVlLFxuXG4gICAgLy8gdGhlIGRlZmF1bHQgb3V0cHV0IGZvcm1hdCBmb3IgYC50b1N0cmluZygpYCBhbmQgYGZpZWxkYCB2YWx1ZVxuICAgIC8vIGZvcm1hdDogJ1lZWVktTU0tREQnLFxuXG4gICAgLy8gdGhlIHRvU3RyaW5nIGZ1bmN0aW9uIHdoaWNoIGdldHMgcGFzc2VkIGEgY3VycmVudCBkYXRlIG9iamVjdCBhbmQgZm9ybWF0XG4gICAgLy8gYW5kIHJldHVybnMgYSBzdHJpbmdcbiAgICAvLyB0b1N0cmluZzogbnVsbCxcblxuICAgIC8vIHVzZWQgdG8gY3JlYXRlIGRhdGUgb2JqZWN0IGZyb20gY3VycmVudCBpbnB1dCBzdHJpbmdcbiAgICBwYXJzZTogbnVsbCxcblxuICAgIC8vIHRoZSBpbml0aWFsIGRhdGUgdG8gdmlldyB3aGVuIGZpcnN0IG9wZW5lZFxuICAgIGRlZmF1bHREYXRlOiBudWxsLFxuXG4gICAgLy8gbWFrZSB0aGUgYGRlZmF1bHREYXRlYCB0aGUgaW5pdGlhbCBzZWxlY3RlZCB2YWx1ZVxuICAgIHNldERlZmF1bHREYXRlOiBmYWxzZSxcblxuICAgIC8vIGZpcnN0IGRheSBvZiB3ZWVrICgwOiBTdW5kYXksIDE6IE1vbmRheSBldGMpXG4gICAgZmlyc3REYXk6IDAsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBmbGFnIGZvciBtb21lbnQncyBzdHJpY3QgZGF0ZSBwYXJzaW5nXG4gICAgZm9ybWF0U3RyaWN0OiBmYWxzZSxcblxuICAgIC8vIHRoZSBtaW5pbXVtL2VhcmxpZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtaW5EYXRlOiBudWxsLFxuICAgIC8vIHRoZSBtYXhpbXVtL2xhdGVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgbWF4RGF0ZTogbnVsbCxcblxuICAgIC8vIG51bWJlciBvZiB5ZWFycyBlaXRoZXIgc2lkZSwgb3IgYXJyYXkgb2YgdXBwZXIvbG93ZXIgcmFuZ2VcbiAgICB5ZWFyUmFuZ2U6IDEwLFxuXG4gICAgLy8gc2hvdyB3ZWVrIG51bWJlcnMgYXQgaGVhZCBvZiByb3dcbiAgICBzaG93V2Vla051bWJlcjogZmFsc2UsXG5cbiAgICAvLyBXZWVrIHBpY2tlciBtb2RlXG4gICAgcGlja1dob2xlV2VlazogZmFsc2UsXG5cbiAgICAvLyB1c2VkIGludGVybmFsbHkgKGRvbid0IGNvbmZpZyBvdXRzaWRlKVxuICAgIG1pblllYXI6IDAsXG4gICAgbWF4WWVhcjogOTk5OSxcbiAgICBtaW5Nb250aDogdW5kZWZpbmVkLFxuICAgIG1heE1vbnRoOiB1bmRlZmluZWQsXG5cbiAgICBzdGFydFJhbmdlOiBudWxsLFxuICAgIGVuZFJhbmdlOiBudWxsLFxuXG4gICAgaXNSVEw6IGZhbHNlLFxuXG4gICAgLy8gQWRkaXRpb25hbCB0ZXh0IHRvIGFwcGVuZCB0byB0aGUgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICB5ZWFyU3VmZml4OiAnJyxcblxuICAgIC8vIFJlbmRlciB0aGUgbW9udGggYWZ0ZXIgeWVhciBpbiB0aGUgY2FsZW5kYXIgdGl0bGVcbiAgICBzaG93TW9udGhBZnRlclllYXI6IGZhbHNlLFxuXG4gICAgLy8gUmVuZGVyIGRheXMgb2YgdGhlIGNhbGVuZGFyIGdyaWQgdGhhdCBmYWxsIGluIHRoZSBuZXh0IG9yIHByZXZpb3VzIG1vbnRoXG4gICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBBbGxvd3MgdXNlciB0byBzZWxlY3QgZGF5cyB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IGZhbHNlLFxuXG4gICAgLy8gaG93IG1hbnkgbW9udGhzIGFyZSB2aXNpYmxlXG4gICAgbnVtYmVyT2ZNb250aHM6IDEsXG5cbiAgICAvLyB3aGVuIG51bWJlck9mTW9udGhzIGlzIHVzZWQsIHRoaXMgd2lsbCBoZWxwIHlvdSB0byBjaG9vc2Ugd2hlcmUgdGhlIG1haW4gY2FsZW5kYXIgd2lsbCBiZSAoZGVmYXVsdCBgbGVmdGAsIGNhbiBiZSBzZXQgdG8gYHJpZ2h0YClcbiAgICAvLyBvbmx5IHVzZWQgZm9yIHRoZSBmaXJzdCBkaXNwbGF5IG9yIHdoZW4gYSBzZWxlY3RlZCBkYXRlIGlzIG5vdCB2aXNpYmxlXG4gICAgbWFpbkNhbGVuZGFyOiAnbGVmdCcsXG5cbiAgICAvLyBTcGVjaWZ5IGEgRE9NIGVsZW1lbnQgdG8gcmVuZGVyIHRoZSBjYWxlbmRhciBpblxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuXG4gICAgLy8gQmx1ciBmaWVsZCB3aGVuIGRhdGUgaXMgc2VsZWN0ZWRcbiAgICBibHVyRmllbGRPblNlbGVjdDogdHJ1ZSxcblxuICAgIC8vIGludGVybmF0aW9uYWxpemF0aW9uXG4gICAgaTE4bjoge1xuICAgICAgcHJldmlvdXNNb250aDogJ1ByZXYgTW9udGgnLFxuICAgICAgbmV4dE1vbnRoOiAnTmV4dCBNb250aCcsXG4gICAgICBtb250aHM6IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnMTAnLCAnMTEnLCAnMTInXSxcbiAgICAgIHdlZWtkYXlzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXG4gICAgICB3ZWVrZGF5c1Nob3J0OiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddXG4gICAgfSxcblxuICAgIC8vIFRoZW1lIENsYXNzbmFtZVxuICAgIHRoZW1lOiBudWxsLFxuXG4gICAgLy8gZXZlbnRzIGFycmF5XG4gICAgZXZlbnRzOiBbXSxcblxuICAgIHJhbmdlU2VsZWN0OiBmYWxzZSxcblxuICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgb25TZWxlY3Q6IG51bGwsXG4gICAgb25PcGVuOiBudWxsLFxuICAgIG9uQ2xvc2U6IG51bGwsXG4gICAgb25EcmF3OiBudWxsXG4gIH1cblxuICAvKipcbiAgICogdGVtcGxhdGluZyBmdW5jdGlvbnMgdG8gYWJzdHJhY3QgSFRNTCByZW5kZXJpbmdcbiAgICovXG4gIGNvbnN0IHJlbmRlckRheU5hbWUgPSAob3B0cywgZGF5LCBhYmJyKSA9PiB7XG4gICAgZGF5ICs9IG9wdHMuZmlyc3REYXlcbiAgICB3aGlsZSAoZGF5ID49IDcpIHtcbiAgICAgIGRheSAtPSA3XG4gICAgfVxuICAgIHJldHVybiBhYmJyID8gb3B0cy5pMThuLndlZWtkYXlzU2hvcnRbZGF5XSA6IG9wdHMuaTE4bi53ZWVrZGF5c1tkYXldXG4gIH1cblxuICBjb25zdCByZW5kZXJEYXkgPSBvcHRzID0+IHtcbiAgICBsZXQgYXJyID0gW11cbiAgICBsZXQgYXJpYVNlbGVjdGVkID0gJ2ZhbHNlJ1xuICAgIGlmIChvcHRzLmlzRW1wdHkpIHtcbiAgICAgIGlmIChvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMpIHtcbiAgICAgICAgYXJyLnB1c2goJ2lzLW91dHNpZGUtY3VycmVudC1tb250aCcpXG5cbiAgICAgICAgaWYgKCFvcHRzLmVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICAgIGFyci5wdXNoKCdpcy1zZWxlY3Rpb24tZGlzYWJsZWQnKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImlzLWVtcHR5XCI+PC90ZD4nXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRzLmlzRGlzYWJsZWQpIGFyci5wdXNoKCdpcy1kaXNhYmxlZCcpXG5cbiAgICBpZiAob3B0cy5pc1RvZGF5KSBhcnIucHVzaCgnaXMtdG9kYXknKVxuXG4gICAgaWYgKG9wdHMuaXNTZWxlY3RlZCkge1xuICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJylcbiAgICAgIGFyaWFTZWxlY3RlZCA9ICd0cnVlJ1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNFdmVudCkgYXJyLnB1c2goJ2hhcy1ldmVudCcpXG5cbiAgICBpZiAob3B0cy5pc0luUmFuZ2UpIGFyci5wdXNoKCdpcy1pbnJhbmdlJylcblxuICAgIGlmIChvcHRzLmlzU3RhcnRSYW5nZSkgYXJyLnB1c2goJ2lzLXN0YXJ0cmFuZ2UnKVxuXG4gICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJylcblxuICAgIHJldHVybiAoXG4gICAgICAnPHRkIGRhdGEtZGF5PVwiJyArXG4gICAgICBvcHRzLmRheSArXG4gICAgICAnXCIgY2xhc3M9XCInICtcbiAgICAgIGFyci5qb2luKCcgJykgK1xuICAgICAgJ1wiIGFyaWEtc2VsZWN0ZWQ9XCInICtcbiAgICAgIGFyaWFTZWxlY3RlZCArXG4gICAgICAnXCI+JyArXG4gICAgICAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX2J1dHRvbiBkYXRlcGlja2VyX19kYXlcIiB0eXBlPVwiYnV0dG9uXCIgJyArXG4gICAgICAnZGF0YS1kYXRlcGlja2VyLXllYXI9XCInICtcbiAgICAgIG9wdHMueWVhciArXG4gICAgICAnXCIgZGF0YS1kYXRlcGlja2VyLW1vbnRoPVwiJyArXG4gICAgICBvcHRzLm1vbnRoICtcbiAgICAgICdcIiBkYXRhLWRhdGVwaWNrZXItZGF5PVwiJyArXG4gICAgICBvcHRzLmRheSArXG4gICAgICAnXCI+JyArXG4gICAgICBvcHRzLmRheSArXG4gICAgICAnPC9idXR0b24+JyArXG4gICAgICAnPC90ZD4nXG4gICAgKVxuICB9XG5cbiAgY29uc3QgcmVuZGVyV2VlayA9IChkLCBtLCB5KSA9PiB7XG4gICAgY29uc3Qgb25lamFuID0gbmV3IERhdGUoeSwgMCwgMSlcbiAgICBjb25zdCB3ZWVrTnVtID0gTWF0aC5jZWlsKCgobmV3IERhdGUoeSwgbSwgZCkgLSBvbmVqYW4pIC8gODY0MDAwMDAgKyBvbmVqYW4uZ2V0RGF5KCkgKyAxKSAvIDcpXG4gICAgcmV0dXJuICc8dGQgY2xhc3M9XCJkYXRlcGlja2VyX193ZWVrXCI+JyArIHdlZWtOdW0gKyAnPC90ZD4nXG4gIH1cblxuICBjb25zdCByZW5kZXJSb3cgPSAoZGF5cywgaXNSVEwsIHBpY2tXaG9sZVdlZWssIGlzUm93U2VsZWN0ZWQpID0+XG4gICAgJzx0ciBjbGFzcz1cImRhdGVwaWNrZXJfX3JvdycgK1xuICAgIChwaWNrV2hvbGVXZWVrID8gJyBwaWNrLXdob2xlLXdlZWsnIDogJycpICtcbiAgICAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICtcbiAgICAnXCI+JyArXG4gICAgKGlzUlRMID8gZGF5cy5yZXZlcnNlKCkgOiBkYXlzKS5qb2luKCcnKSArXG4gICAgJzwvdHI+J1xuXG4gIGNvbnN0IHJlbmRlckJvZHkgPSByb3dzID0+ICc8dGJvZHk+JyArIHJvd3Muam9pbignJykgKyAnPC90Ym9keT4nXG5cbiAgY29uc3QgcmVuZGVySGVhZCA9IG9wdHMgPT4ge1xuICAgIGxldCBpXG4gICAgbGV0IGFyciA9IFtdXG4gICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgIGFyci5wdXNoKCc8dGg+PC90aD4nKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICBhcnIucHVzaCgnPHRoIHNjb3BlPVwiY29sXCI+PGFiYnIgdGl0bGU9XCInICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpKSArICdcIj4nICsgcmVuZGVyRGF5TmFtZShvcHRzLCBpLCB0cnVlKSArICc8L2FiYnI+PC90aD4nKVxuICAgIH1cbiAgICByZXR1cm4gJzx0aGVhZD48dHI+JyArIChvcHRzLmlzUlRMID8gYXJyLnJldmVyc2UoKSA6IGFycikuam9pbignJykgKyAnPC90cj48L3RoZWFkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRpdGxlID0gKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgalxuICAgIGxldCBhcnJcbiAgICBjb25zdCBvcHRzID0gaW5zdGFuY2UuX29cbiAgICBjb25zdCBpc01pblllYXIgPSB5ZWFyID09PSBvcHRzLm1pblllYXJcbiAgICBjb25zdCBpc01heFllYXIgPSB5ZWFyID09PSBvcHRzLm1heFllYXJcbiAgICBsZXQgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRJZCArICdcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RpdGxlXCIgcm9sZT1cImhlYWRpbmdcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj4nXG5cbiAgICBsZXQgcHJldiA9IHRydWVcbiAgICBsZXQgbmV4dCA9IHRydWVcblxuICAgIGZvciAoYXJyID0gW10sIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgYXJyLnB1c2goXG4gICAgICAgICc8b3B0aW9uIHZhbHVlPVwiJyArXG4gICAgICAgICAgKHllYXIgPT09IHJlZlllYXIgPyBpIC0gYyA6IDEyICsgaSAtIGMpICtcbiAgICAgICAgICAnXCInICtcbiAgICAgICAgICAoaSA9PT0gbW9udGggPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgK1xuICAgICAgICAgICgoaXNNaW5ZZWFyICYmIGkgPCBvcHRzLm1pbk1vbnRoKSB8fCAoaXNNYXhZZWFyICYmIGkgPiBvcHRzLm1heE1vbnRoKSA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpICtcbiAgICAgICAgICAnPicgK1xuICAgICAgICAgIG9wdHMuaTE4bi5tb250aHNbaV0gK1xuICAgICAgICAgICc8L29wdGlvbj4nXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgbW9udGhIdG1sID1cbiAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICtcbiAgICAgIG9wdHMuaTE4bi5tb250aHNbbW9udGhdICtcbiAgICAgICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC1tb250aFwiIHRhYmluZGV4PVwiLTFcIj4nICtcbiAgICAgIGFyci5qb2luKCcnKSArXG4gICAgICAnPC9zZWxlY3Q+PC9kaXY+J1xuXG4gICAgaWYgKGlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XG4gICAgICBpID0gb3B0cy55ZWFyUmFuZ2VbMF1cbiAgICAgIGogPSBvcHRzLnllYXJSYW5nZVsxXSArIDFcbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZVxuICAgICAgaiA9IDEgKyB5ZWFyICsgb3B0cy55ZWFyUmFuZ2VcbiAgICB9XG5cbiAgICBmb3IgKGFyciA9IFtdOyBpIDwgaiAmJiBpIDw9IG9wdHMubWF4WWVhcjsgaSsrKSB7XG4gICAgICBpZiAoaSA+PSBvcHRzLm1pblllYXIpIGFyci5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiJyArIGkgKyAnXCInICsgKGkgPT09IHllYXIgPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgKyAnPicgKyBpICsgJzwvb3B0aW9uPicpXG4gICAgfVxuICAgIGNvbnN0IHllYXJIdG1sID1cbiAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcl9fbGFiZWxcIj4nICtcbiAgICAgIHllYXIgK1xuICAgICAgb3B0cy55ZWFyU3VmZml4ICtcbiAgICAgICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlcl9fc2VsZWN0IGRhdGVwaWNrZXJfX3NlbGVjdC15ZWFyXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgYXJyLmpvaW4oJycpICtcbiAgICAgICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAob3B0cy5zaG93TW9udGhBZnRlclllYXIpIHtcbiAgICAgIGh0bWwgKz0geWVhckh0bWwgKyBtb250aEh0bWxcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSBtb250aEh0bWwgKyB5ZWFySHRtbFxuICAgIH1cblxuICAgIGlmIChpc01pblllYXIgJiYgKG1vbnRoID09PSAwIHx8IG9wdHMubWluTW9udGggPj0gbW9udGgpKSBwcmV2ID0gZmFsc2VcblxuICAgIGlmIChpc01heFllYXIgJiYgKG1vbnRoID09PSAxMSB8fCBvcHRzLm1heE1vbnRoIDw9IG1vbnRoKSkgbmV4dCA9IGZhbHNlXG5cbiAgICBpZiAoYyA9PT0gMCkge1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX3ByZXYnICsgKHByZXYgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArICdcIiB0eXBlPVwiYnV0dG9uXCI+JyArIG9wdHMuaTE4bi5wcmV2aW91c01vbnRoICsgJzwvYnV0dG9uPidcbiAgICB9XG4gICAgaWYgKGMgPT09IGluc3RhbmNlLl9vLm51bWJlck9mTW9udGhzIC0gMSkge1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRhdGVwaWNrZXJfX25leHQnICsgKG5leHQgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArICdcIiB0eXBlPVwiYnV0dG9uXCI+JyArIG9wdHMuaTE4bi5uZXh0TW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cblxuICAgIGh0bWwgKz0gJzwvZGl2PidcblxuICAgIHJldHVybiBodG1sXG4gIH1cblxuICBjb25zdCByZW5kZXJUYWJsZSA9IChvcHRzLCBkYXRhLCByYW5kSWQpID0+XG4gICAgJzx0YWJsZSBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIiBjbGFzcz1cImRhdGVwaWNrZXJfX3RhYmxlXCIgcm9sZT1cImdyaWRcIiBhcmlhLWxhYmVsbGVkYnk9XCInICtcbiAgICByYW5kSWQgK1xuICAgICdcIj4nICtcbiAgICByZW5kZXJIZWFkKG9wdHMpICtcbiAgICByZW5kZXJCb2R5KGRhdGEpICtcbiAgICAnPC90YWJsZT4nXG5cbiAgLyoqXG4gICAqIFBsYWluUGlja2VyIGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdCBQbGFpblBpY2tlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICBjb25zdCBvcHRzID0gc2VsZi5jb25maWcob3B0aW9ucylcblxuICAgIGNvbnN0IGRlZk9wdHNNaW5EYXRlID0gb3B0cy5taW5EYXRlXG4gICAgc2VsZi5kYXRlUmFuZ2VBcnIgPSBbXVxuICAgIHNlbGYuZGF0ZVJhbmdlU2VsZWN0ZWRBcnIgPSBbXVxuXG4gICAgc2VsZi5fb25Nb3VzZURvd24gPSBlID0+IHtcbiAgICAgIGlmICghc2VsZi5fdikgcmV0dXJuXG5cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG5cbiAgICAgIGlmICghaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uJykgJiYgIWhhc0NsYXNzKHRhcmdldCwgJ2lzLWVtcHR5JykgJiYgIWhhc0NsYXNzKHRhcmdldC5wYXJlbnROb2RlLCAnaXMtZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2VTZWxlY3QpIHsgLy8gc2VsZWN0YWJsZSBkYXRlIHJhbmdlIG9uIHNpbmdsZSBjYWxlbmRhclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZShcbiAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci15ZWFyJyksXG4gICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItbW9udGgnKSxcbiAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1kYXknKVxuICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgIGFkZENsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX2J1dHRvbi0tc3RhcnRlZCcpXG5cbiAgICAgICAgICAgICAgICBzZWxmLnNldE1pbkRhdGUoc2VsZWN0ZWREYXRlKVxuXG4gICAgICAgICAgICAgICAgLy8g6YG45oqe5Y+v6IO944Gv5LqM44Gk44G+44Gn44CC44Go44KK44GC44GI44GaXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZGF0ZVJhbmdlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyID0gW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIucHVzaChzZWxlY3RlZERhdGUpXG5cbiAgICAgICAgICAgICAgICBzZWxmLmRhdGVSYW5nZUFyci5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNldERhdGUoZSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZGF0ZVJhbmdlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgICAgICAgICAgICBzZWxmLnNldE1pbkRhdGUoZGVmT3B0c01pbkRhdGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcHRzLmJsdXJGaWVsZE9uU2VsZWN0ICYmIG9wdHMuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgIG9wdHMuZmllbGQuYmx1cigpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0RGF0ZShcbiAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXIteWVhcicpLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItbW9udGgnKSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpXG4gICAgICAgICAgICAgICAgaWYgKG9wdHMuYmx1ckZpZWxkT25TZWxlY3QgJiYgb3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fcHJldicpKSB7XG4gICAgICAgICAgc2VsZi5wcmV2TW9udGgoKVxuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX25leHQnKSkge1xuICAgICAgICAgIHNlbGYubmV4dE1vbnRoKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QnKSkge1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLl9jID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uTW91c2VPdmVyID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuXG4gICAgICBpZiAoIXRhcmdldCB8fCAhb3B0cy5yYW5nZVNlbGVjdCkgcmV0dXJuXG5cbiAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpICYmIHNlbGYuZGF0ZVJhbmdlQXJyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IHRhcmdldFBhcmVudHNUciA9IGdldENsb3Nlc3QodGFyZ2V0LCAndHInKVxuICAgICAgICBhZGRDbGFzcyh0YXJnZXRQYXJlbnRzVHIsICdob3ZlcmVkV2VlaycpXG5cbiAgICAgICAgbGV0IGxhc3RUYXJnZXRQaWNrZXIgPSBnZXRDbG9zZXN0KHRhcmdldFBhcmVudHNUciwgJy5kYXRlcGlja2VyX19sZW5kYXJfX2xhc3QnKVxuICAgICAgICBsZXQgcGFyZW50RGF0ZVBpY2tlclxuXG4gICAgICAgIGlmIChsYXN0VGFyZ2V0UGlja2VyICE9PSBudWxsKSB7XG4gICAgICAgICAgcGFyZW50RGF0ZVBpY2tlciA9IGxhc3RUYXJnZXRQaWNrZXIucGFyZW50Tm9kZVxuICAgICAgICAgIGxldCB0YWJsZU9mRmlyc3QgPSBwYXJlbnREYXRlUGlja2VyLmNoaWxkcmVuWzBdXG4gICAgICAgICAgbGV0IHRyc09mRmlyc3RUYWJsZSA9IHRhYmxlT2ZGaXJzdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndHInKVxuICAgICAgICAgIGxldCBsYXN0VHJPZkZpcnN0VGFibGUgPSB0cnNPZkZpcnN0VGFibGVbdHJzT2ZGaXJzdFRhYmxlLmxlbmd0aCAtIDFdXG4gICAgICAgICAgYWRkQ2xhc3MobGFzdFRyT2ZGaXJzdFRhYmxlLCAnaG92ZXJlZE90aGVyVGFibGUnKVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhvdmVyZWRPdGhlclRhYmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaG92ZXJlZE90aGVyVGFibGUnKVxuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoaG92ZXJlZE90aGVyVGFibGUsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgbGV0IGluUmFuZ2UgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkOm5vdCguaXMtZGlzYWJsZWQpJylcblxuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoaW5SYW5nZSwgZnVuY3Rpb24gKG5vZGVDaGlsZHJlbikge1xuICAgICAgICAgICAgYWRkQ2xhc3Mobm9kZUNoaWxkcmVuLCAnaW4tcmFuZ2UnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHByZXZBbGwobm9kZSksIGZ1bmN0aW9uIChub2RlQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGxldCB0ZHNQcmV2TGFzdFdlZWsgPSBub2RlQ2hpbGRyZW4ucXVlcnlTZWxlY3RvckFsbCgndGQ6bm90KC5pcy1kaXNhYmxlZCknKVxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0ZHNQcmV2TGFzdFdlZWssIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICBhZGRDbGFzcyhlbCwgJ2luLXJhbmdlJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHByZXZBbGwodGFyZ2V0UGFyZW50c1RyKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICBsZXQgaW5SYW5nZSA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGQ6bm90KC5pcy1kaXNhYmxlZCknKVxuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoaW5SYW5nZSwgZnVuY3Rpb24gKG5vZGVDaGlsZHJlbikge1xuICAgICAgICAgICAgYWRkQ2xhc3Mobm9kZUNoaWxkcmVuLCAnaW4tcmFuZ2UnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChwcmV2QWxsKHRhcmdldC5wYXJlbnROb2RlKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICBpZiAoIWhhc0NsYXNzKG5vZGUsICdpcy1kaXNhYmxlZCcpKSBhZGRDbGFzcyhub2RlLCAnaW4tcmFuZ2UnKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uTW91c2VMZWF2ZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0IHx8ICFvcHRzLnJhbmdlU2VsZWN0KSByZXR1cm5cblxuICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX2J1dHRvbicpICYmICFoYXNDbGFzcyh0YXJnZXQsICdpcy1lbXB0eScpICYmICFoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2lzLWRpc2FibGVkJykgJiYgc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgdGFyZ2V0UGFyZW50c1RyID0gZ2V0Q2xvc2VzdCh0YXJnZXQsICd0cicpXG4gICAgICAgIHJlbW92ZUNsYXNzKHRhcmdldFBhcmVudHNUciwgJ2hvdmVyZWRXZWVrJylcblxuICAgICAgICBsZXQgcGFyZW50RGF0ZVBpY2tlciA9IGdldENsb3Nlc3QodGFyZ2V0LCAnLmRhdGVwaWNrZXInKVxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHBhcmVudERhdGVQaWNrZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RkJyksIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3Mobm9kZSwgJ2luLXJhbmdlJylcbiAgICAgICAgfSlcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2hvdmVyZWRPdGhlclRhYmxlJyksIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3Mobm9kZSwgJ2hvdmVyZWRPdGhlclRhYmxlJylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA8c2VsZWN0PlxuICAgIHNlbGYuX29uQ2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgaWYgKCF0YXJnZXQpIHJldHVyblxuXG4gICAgICBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoJykpIHtcbiAgICAgICAgc2VsZi5nb3RvTW9udGgodGFyZ2V0LnZhbHVlKVxuICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QteWVhcicpKSB7XG4gICAgICAgIHNlbGYuZ290b1llYXIodGFyZ2V0LnZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uS2V5Q2hhbmdlID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcblxuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ3N1YnRyYWN0JywgMSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdhZGQnLCA3KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDaGFuZ2UgPSBlID0+IHtcbiAgICAgIGxldCBkYXRlXG5cbiAgICAgIGlmIChlLmZpcmVkQnkgPT09IHNlbGYpIHJldHVyblxuXG4gICAgICBpZiAob3B0cy5wYXJzZSkge1xuICAgICAgICBkYXRlID0gb3B0cy5wYXJzZShvcHRzLmZpZWxkLnZhbHVlLCBvcHRzLmZvcm1hdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKG9wdHMuZmllbGQudmFsdWUpKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNEYXRlKGRhdGUpKSBzZWxmLnNldERhdGUoZGF0ZSlcbiAgICAgIGlmICghc2VsZi5fdikgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Rm9jdXMgPSAoKSA9PiB7XG4gICAgICBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRDbGljayA9ICgpID0+IHtcbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dEJsdXIgPSAoKSA9PiB7XG4gICAgICBsZXQgcEVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgICAgZG8ge1xuICAgICAgICBpZiAoaGFzQ2xhc3MocEVsLCAnZGF0ZXBpY2tlcicpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKChwRWwgPSBwRWwucGFyZW50Tm9kZSkpXG5cbiAgICAgIGlmICghc2VsZi5fYykge1xuICAgICAgICBzZWxmLl9iID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgfSwgNTApXG4gICAgICB9XG4gICAgICBzZWxmLl9jID0gZmFsc2VcbiAgICB9XG5cbiAgICBzZWxmLl9vbkNsaWNrID0gZSA9PiB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxuICAgICAgbGV0IHBFbCA9IHRhcmdldFxuXG4gICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykgfHwgcEVsID09PSBvcHRzLnRyaWdnZXIpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcbiAgICAgIGlmIChzZWxmLl92ICYmIHRhcmdldCAhPT0gb3B0cy50cmlnZ2VyICYmIHBFbCAhPT0gb3B0cy50cmlnZ2VyKSBzZWxmLmhpZGUoKVxuICAgIH1cblxuICAgIHNlbGYuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNlbGYuZWwuY2xhc3NOYW1lID0gJ2RhdGVwaWNrZXInICsgKG9wdHMuaXNSVEwgPyAnIGlzLXJ0bCcgOiAnJykgKyAob3B0cy50aGVtZSA/ICcgJyArIG9wdHMudGhlbWUgOiAnJylcblxuICAgIGFkZEV2ZW50KHNlbGYuZWwsICdtb3VzZWRvd24nLCBzZWxmLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2VvdmVyJywgc2VsZi5fb25Nb3VzZU92ZXIsIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ21vdXNlbGVhdmUnLCBzZWxmLl9vbk1vdXNlTGVhdmUsIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ3RvdWNoZW5kJywgc2VsZi5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ2NoYW5nZScsIHNlbGYuX29uQ2hhbmdlKVxuICAgIGFkZEV2ZW50KGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYuX29uS2V5Q2hhbmdlKVxuXG4gICAgaWYgKG9wdHMuZmllbGQpIHtcbiAgICAgIGlmIChvcHRzLmNvbnRhaW5lcikge1xuICAgICAgICBvcHRzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2VsZi5lbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMuZmllbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2VsZi5lbCwgb3B0cy5maWVsZC5uZXh0U2libGluZylcbiAgICAgIH1cbiAgICAgIGFkZEV2ZW50KG9wdHMuZmllbGQsICdjaGFuZ2UnLCBzZWxmLl9vbklucHV0Q2hhbmdlKVxuXG4gICAgICBpZiAoIW9wdHMuZGVmYXVsdERhdGUpIHtcbiAgICAgICAgb3B0cy5kZWZhdWx0RGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICAgIG9wdHMuc2V0RGVmYXVsdERhdGUgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmRGF0ZSA9IG9wdHMuZGVmYXVsdERhdGVcblxuICAgIGlmIChpc0RhdGUoZGVmRGF0ZSkpIHtcbiAgICAgIGlmIChvcHRzLnNldERlZmF1bHREYXRlKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0ZShkZWZEYXRlLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nb3RvRGF0ZShkZWZEYXRlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmdvdG9EYXRlKG5ldyBEYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICBzZWxmLmVsLmNsYXNzTmFtZSArPSAnIGlzLWJvdW5kJ1xuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnY2xpY2snLCBzZWxmLl9vbklucHV0Q2xpY2spXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdmb2N1cycsIHNlbGYuX29uSW5wdXRGb2N1cylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2JsdXInLCBzZWxmLl9vbklucHV0Qmx1cilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIFBsYWluUGlja2VyIEFQSVxuICAgKi9cbiAgUGxhaW5QaWNrZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIGNvbmZpZ3VyZSBmdW5jdGlvbmFsaXR5XG4gICAgICovXG4gICAgY29uZmlnOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKCF0aGlzLl9vKSB0aGlzLl9vID0gZXh0ZW5kKHt9LCBkZWZhdWx0cywgdHJ1ZSlcblxuICAgICAgY29uc3Qgb3B0cyA9IGV4dGVuZCh0aGlzLl9vLCBvcHRpb25zLCB0cnVlKVxuXG4gICAgICBvcHRzLmlzUlRMID0gISFvcHRzLmlzUlRMXG5cbiAgICAgIG9wdHMuZmllbGQgPSBvcHRzLmZpZWxkICYmIG9wdHMuZmllbGQubm9kZU5hbWUgPyBvcHRzLmZpZWxkIDogbnVsbFxuXG4gICAgICBvcHRzLnRoZW1lID0gdHlwZW9mIG9wdHMudGhlbWUgPT09ICdzdHJpbmcnICYmIG9wdHMudGhlbWUgPyBvcHRzLnRoZW1lIDogbnVsbFxuXG4gICAgICBvcHRzLmJvdW5kID0gISEob3B0cy5ib3VuZCAhPT0gdW5kZWZpbmVkID8gb3B0cy5maWVsZCAmJiBvcHRzLmJvdW5kIDogb3B0cy5maWVsZClcblxuICAgICAgb3B0cy50cmlnZ2VyID0gb3B0cy50cmlnZ2VyICYmIG9wdHMudHJpZ2dlci5ub2RlTmFtZSA/IG9wdHMudHJpZ2dlciA6IG9wdHMuZmllbGRcblxuICAgICAgb3B0cy5kaXNhYmxlV2Vla2VuZHMgPSAhIW9wdHMuZGlzYWJsZVdlZWtlbmRzXG5cbiAgICAgIG9wdHMuZGlzYWJsZURheUZuID0gdHlwZW9mIG9wdHMuZGlzYWJsZURheUZuID09PSAnZnVuY3Rpb24nID8gb3B0cy5kaXNhYmxlRGF5Rm4gOiBudWxsXG5cbiAgICAgIGNvbnN0IG5vbSA9IHBhcnNlSW50KG9wdHMubnVtYmVyT2ZNb250aHMsIDEwKSB8fCAxXG4gICAgICBvcHRzLm51bWJlck9mTW9udGhzID0gbm9tID4gNCA/IDQgOiBub21cblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5taW5EYXRlKSkgb3B0cy5taW5EYXRlID0gZmFsc2VcblxuICAgICAgaWYgKCFpc0RhdGUob3B0cy5tYXhEYXRlKSkgb3B0cy5tYXhEYXRlID0gZmFsc2VcblxuICAgICAgaWYgKG9wdHMubWluRGF0ZSAmJiBvcHRzLm1heERhdGUgJiYgb3B0cy5tYXhEYXRlIDwgb3B0cy5taW5EYXRlKSBvcHRzLm1heERhdGUgPSBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAob3B0cy5taW5EYXRlKSB0aGlzLnNldE1pbkRhdGUob3B0cy5taW5EYXRlKVxuXG4gICAgICBpZiAob3B0cy5tYXhEYXRlKSB0aGlzLnNldE1heERhdGUob3B0cy5tYXhEYXRlKVxuXG4gICAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgICAgY29uc3QgZmFsbGJhY2sgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgLSAxMFxuICAgICAgICBvcHRzLnllYXJSYW5nZVswXSA9IHBhcnNlSW50KG9wdHMueWVhclJhbmdlWzBdLCAxMCkgfHwgZmFsbGJhY2tcbiAgICAgICAgb3B0cy55ZWFyUmFuZ2VbMV0gPSBwYXJzZUludChvcHRzLnllYXJSYW5nZVsxXSwgMTApIHx8IGZhbGxiYWNrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRzLnllYXJSYW5nZSA9IE1hdGguYWJzKHBhcnNlSW50KG9wdHMueWVhclJhbmdlLCAxMCkpIHx8IGRlZmF1bHRzLnllYXJSYW5nZVxuICAgICAgICBpZiAob3B0cy55ZWFyUmFuZ2UgPiAxMDApIHtcbiAgICAgICAgICBvcHRzLnllYXJSYW5nZSA9IDEwMFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcHRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBhIERhdGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIGdldERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpc0RhdGUodGhpcy5fZCkgPyBuZXcgRGF0ZSh0aGlzLl9kLmdldFRpbWUoKSkgOiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbiAoZGF0ZSwgcHJldmVudE9uU2VsZWN0KSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuXG4gICAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgc2VsZi5fZCA9IG51bGxcblxuICAgICAgICBpZiAodGhpcy5fby5maWVsZCkge1xuICAgICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSAnJ1xuICAgICAgICAgIGZpcmVFdmVudChzZWxmLl9vLmZpZWxkLCAnY2hhbmdlJywge1xuICAgICAgICAgICAgZmlyZWRCeTogc2VsZlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZi5kcmF3KClcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2UoZGF0ZSkpXG5cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSByZXR1cm5cblxuICAgICAgY29uc3QgbWluID0gc2VsZi5fby5taW5EYXRlXG4gICAgICBjb25zdCBtYXggPSBzZWxmLl9vLm1heERhdGVcblxuICAgICAgaWYgKGlzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcbiAgICAgICAgZGF0ZSA9IG1pblxuICAgICAgfSBlbHNlIGlmIChpc0RhdGUobWF4KSAmJiBkYXRlID4gbWF4KSB7XG4gICAgICAgIGRhdGUgPSBtYXhcbiAgICAgIH1cblxuICAgICAgc2VsZi5fZCA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKVxuICAgICAgc2V0VG9TdGFydE9mRGF5KHNlbGYuX2QpXG4gICAgICBzZWxmLmdvdG9EYXRlKHNlbGYuX2QpXG5cbiAgICAgIGxldCBzdXBlckFyciA9IFtdXG5cbiAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgbGV0IHl5eXkgPSBlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgbGV0IG1tID0gemVyb1BhZGRpbmcoZS5nZXRNb250aCgpICsgMSlcbiAgICAgICAgbGV0IGRkID0gemVyb1BhZGRpbmcoZS5nZXREYXRlKCkpXG4gICAgICAgIGxldCB5eXl5bW1kZCA9IHl5eXkgKyAnLycgKyBtbSArICcvJyArIGRkXG4gICAgICAgIHN1cGVyQXJyLnB1c2goeXl5eW1tZGQpXG4gICAgICB9KVxuXG4gICAgICBpZiAoc2VsZi5fby5maWVsZCkge1xuICAgICAgICBpZiAoc2VsZi5fby5yYW5nZVNlbGVjdCkge1xuICAgICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSBzdXBlckFyci5qb2luKCcgLSAnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuX28uZmllbGQudmFsdWUgPSBzZWxmLnRvU3RyaW5nKClcbiAgICAgICAgICBmaXJlRXZlbnQoc2VsZi5fby5maWVsZCwgJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGZpcmVkQnk6IHNlbGZcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghcHJldmVudE9uU2VsZWN0ICYmIHR5cGVvZiBzZWxmLl9vLm9uU2VsZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNlbGYuX28ub25TZWxlY3QuY2FsbChzZWxmLCBzZWxmLmdldERhdGUoKSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXG4gICAgICovXG4gICAgZ290b0RhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICBsZXQgbmV3Q2FsZW5kYXIgPSB0cnVlXG5cbiAgICAgIGlmICghaXNEYXRlKGRhdGUpKSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMuY2FsZW5kYXJzKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1swXS5tb250aCwgMSlcbiAgICAgICAgY29uc3QgbGFzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ueWVhciwgdGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IHZpc2libGVEYXRlID0gZGF0ZS5nZXRUaW1lKClcbiAgICAgICAgLy8gZ2V0IHRoZSBlbmQgb2YgdGhlIG1vbnRoXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXRNb250aChsYXN0VmlzaWJsZURhdGUuZ2V0TW9udGgoKSArIDEpXG4gICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXREYXRlKGxhc3RWaXNpYmxlRGF0ZS5nZXREYXRlKCkgLSAxKVxuICAgICAgICBuZXdDYWxlbmRhciA9IHZpc2libGVEYXRlIDwgZmlyc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgfHwgbGFzdFZpc2libGVEYXRlLmdldFRpbWUoKSA8IHZpc2libGVEYXRlXG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdDYWxlbmRhcikge1xuICAgICAgICB0aGlzLmNhbGVuZGFycyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxuICAgICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICAgIGlmICh0aGlzLl9vLm1haW5DYWxlbmRhciA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICs9IDEgLSB0aGlzLl9vLm51bWJlck9mTW9udGhzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICBhZGp1c3REYXRlOiBmdW5jdGlvbiAoc2lnbiwgZGF5cykge1xuICAgICAgY29uc3QgZGF5ID0gdGhpcy5nZXREYXRlKCkgfHwgbmV3IERhdGUoKVxuICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IHBhcnNlSW50KGRheXMpICogMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgICBsZXQgbmV3RGF5XG5cbiAgICAgIGlmIChzaWduID09PSAnYWRkJykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpICsgZGlmZmVyZW5jZSlcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PT0gJ3N1YnRyYWN0Jykge1xuICAgICAgICBuZXdEYXkgPSBuZXcgRGF0ZShkYXkudmFsdWVPZigpIC0gZGlmZmVyZW5jZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXREYXRlKG5ld0RheSlcbiAgICB9LFxuXG4gICAgYWRqdXN0Q2FsZW5kYXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgY1xuXG4gICAgICB0aGlzLmNhbGVuZGFyc1swXSA9IGFkanVzdENhbGVuZGFyKHRoaXMuY2FsZW5kYXJzWzBdKVxuICAgICAgZm9yIChjID0gMTsgYyA8IHRoaXMuX28ubnVtYmVyT2ZNb250aHM7IGMrKykge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1tjXSA9IGFkanVzdENhbGVuZGFyKHtcbiAgICAgICAgICBtb250aDogdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggKyBjLFxuICAgICAgICAgIHllYXI6IHRoaXMuY2FsZW5kYXJzWzBdLnllYXJcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIGdvdG9Ub2RheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5nb3RvRGF0ZShuZXcgRGF0ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIG1vbnRoICh6ZXJvLWluZGV4LCBlLmcuIDA6IEphbnVhcnkpXG4gICAgICovXG4gICAgZ290b01vbnRoOiBmdW5jdGlvbiAobW9udGgpIHtcbiAgICAgIGlmICghaXNOYU4obW9udGgpKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoID0gcGFyc2VJbnQobW9udGgsIDEwKVxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIG5leHRNb250aDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgrK1xuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgIH0sXG5cbiAgICBwcmV2TW9udGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS1cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBmdWxsIHllYXIgKGUuZy4gXCIyMDEyXCIpXG4gICAgICovXG4gICAgZ290b1llYXI6IGZ1bmN0aW9uICh5ZWFyKSB7XG4gICAgICBpZiAoIWlzTmFOKHllYXIpKSB7XG4gICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLnllYXIgPSBwYXJzZUludCh5ZWFyLCAxMClcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2UgdGhlIG1pbkRhdGVcbiAgICAgKi9cbiAgICBzZXRNaW5EYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgc2V0VG9TdGFydE9mRGF5KHZhbHVlKVxuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSB2YWx1ZVxuICAgICAgICB0aGlzLl9vLm1pblllYXIgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuX28ubWluTW9udGggPSB2YWx1ZS5nZXRNb250aCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vLm1pbkRhdGUgPSBkZWZhdWx0cy5taW5EYXRlXG4gICAgICAgIHRoaXMuX28ubWluWWVhciA9IGRlZmF1bHRzLm1pblllYXJcbiAgICAgICAgdGhpcy5fby5taW5Nb250aCA9IGRlZmF1bHRzLm1pbk1vbnRoXG4gICAgICAgIHRoaXMuX28uc3RhcnRSYW5nZSA9IGRlZmF1bHRzLnN0YXJ0UmFuZ2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHRoZSBtYXhEYXRlXG4gICAgICovXG4gICAgc2V0TWF4RGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheSh2YWx1ZSlcbiAgICAgICAgdGhpcy5fby5tYXhEYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5fby5tYXhZZWFyID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gdmFsdWUuZ2V0TW9udGgoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fby5tYXhEYXRlID0gZGVmYXVsdHMubWF4RGF0ZVxuICAgICAgICB0aGlzLl9vLm1heFllYXIgPSBkZWZhdWx0cy5tYXhZZWFyXG4gICAgICAgIHRoaXMuX28ubWF4TW9udGggPSBkZWZhdWx0cy5tYXhNb250aFxuICAgICAgICB0aGlzLl9vLmVuZFJhbmdlID0gZGVmYXVsdHMuZW5kUmFuZ2VcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgc2V0U3RhcnRSYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLl9vLnN0YXJ0UmFuZ2UgPSB2YWx1ZVxuICAgIH0sXG5cbiAgICBzZXRFbmRSYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLl9vLmVuZFJhbmdlID0gdmFsdWVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVmcmVzaCB0aGUgSFRNTFxuICAgICAqL1xuICAgIGRyYXc6IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgICAgaWYgKCF0aGlzLl92ICYmICFmb3JjZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0cyA9IHRoaXMuX29cbiAgICAgIGNvbnN0IG1pblllYXIgPSBvcHRzLm1pblllYXJcbiAgICAgIGNvbnN0IG1heFllYXIgPSBvcHRzLm1heFllYXJcbiAgICAgIGNvbnN0IG1pbk1vbnRoID0gb3B0cy5taW5Nb250aFxuICAgICAgY29uc3QgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoXG4gICAgICBsZXQgaHRtbCA9ICcnXG4gICAgICBsZXQgcmFuZElkXG5cbiAgICAgIGlmICh0aGlzLl95IDw9IG1pblllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1pblllYXJcbiAgICAgICAgaWYgKCFpc05hTihtaW5Nb250aCkgJiYgdGhpcy5fbSA8IG1pbk1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1pbk1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl95ID49IG1heFllYXIpIHtcbiAgICAgICAgdGhpcy5feSA9IG1heFllYXJcbiAgICAgICAgaWYgKCFpc05hTihtYXhNb250aCkgJiYgdGhpcy5fbSA+IG1heE1vbnRoKSB7XG4gICAgICAgICAgdGhpcy5fbSA9IG1heE1vbnRoXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmFuZElkID0gJ2RhdGVwaWNrZXJfX3RpdGxlLScgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKC9bXmEtel0rL2csICcnKS5zdWJzdHIoMCwgMilcblxuICAgICAgbGV0IGMsIHBvc2l0aW9uU3RyXG4gICAgICBmb3IgKGMgPSAwOyBjIDwgb3B0cy5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIGlmIChjID09PSAwKSB7XG4gICAgICAgICAgcG9zaXRpb25TdHIgPSAnIGRhdGVwaWNrZXJfX2xlbmRhcl9fZmlyc3QnXG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gb3B0cy5udW1iZXJPZk1vbnRocyAtIDEpIHtcbiAgICAgICAgICBwb3NpdGlvblN0ciA9ICcgZGF0ZXBpY2tlcl9fbGVuZGFyX19sYXN0J1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvc2l0aW9uU3RyID0gJydcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5udW1iZXJPZk1vbnRocyA9PT0gMSkgcG9zaXRpb25TdHIgPSAnJ1xuXG4gICAgICAgIGh0bWwgKz1cbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xlbmRhcicgKyBwb3NpdGlvblN0ciArICdcIj4nICtcbiAgICAgICAgICAgIHJlbmRlclRpdGxlKHRoaXMsIGMsIHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCB0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCByYW5kSWQpICtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCByYW5kSWQpICtcbiAgICAgICAgICAnPC9kaXY+J1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgaWYgKG9wdHMuZmllbGQudHlwZSAhPT0gJ2hpZGRlbicpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIG9wdHMudHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgfSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX28ub25EcmF3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX28ub25EcmF3KHRoaXMpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIC8vIGxldCB0aGUgc2NyZWVuIHJlYWRlciB1c2VyIGtub3cgdG8gdXNlIGFycm93IGtleXNcbiAgICAgICAgb3B0cy5maWVsZC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnVXNlIHRoZSBhcnJvdyBrZXlzIHRvIHBpY2sgYSBkYXRlJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9vLmNvbnRhaW5lcikgcmV0dXJuXG5cbiAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5fby50cmlnZ2VyXG4gICAgICBsZXQgcEVsID0gZmllbGRcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5lbC5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5lbC5vZmZzZXRIZWlnaHRcbiAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICBsZXQgbGVmdFxuICAgICAgbGV0IHRvcFxuXG4gICAgICBpZiAodHlwZW9mIGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBjbGllbnRSZWN0ID0gZmllbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgbGVmdCA9IGNsaWVudFJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldFxuICAgICAgICB0b3AgPSBjbGllbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVmdCA9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgIHRvcCA9IHBFbC5vZmZzZXRUb3AgKyBwRWwub2Zmc2V0SGVpZ2h0XG4gICAgICAgIHdoaWxlICgocEVsID0gcEVsLm9mZnNldFBhcmVudCkpIHtcbiAgICAgICAgICBsZWZ0ICs9IHBFbC5vZmZzZXRMZWZ0XG4gICAgICAgICAgdG9wICs9IHBFbC5vZmZzZXRUb3BcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbSAmIGxlZnRcbiAgICAgIGlmIChcbiAgICAgICAgKHRoaXMuX28ucmVwb3NpdGlvbiAmJiBsZWZ0ICsgd2lkdGggPiB2aWV3cG9ydFdpZHRoKSB8fFxuICAgICAgICAodGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCdyaWdodCcpID4gLTEgJiYgbGVmdCAtIHdpZHRoICsgZmllbGQub2Zmc2V0V2lkdGggPiAwKVxuICAgICAgKSB7XG4gICAgICAgIGxlZnQgPSBsZWZ0IC0gd2lkdGggKyBmaWVsZC5vZmZzZXRXaWR0aFxuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICAodGhpcy5fby5yZXBvc2l0aW9uICYmIHRvcCArIGhlaWdodCA+IHZpZXdwb3J0SGVpZ2h0ICsgc2Nyb2xsVG9wKSB8fFxuICAgICAgICAodGhpcy5fby5wb3NpdGlvbi5pbmRleE9mKCd0b3AnKSA+IC0xICYmIHRvcCAtIGhlaWdodCAtIGZpZWxkLm9mZnNldEhlaWdodCA+IDApXG4gICAgICApIHtcbiAgICAgICAgdG9wID0gdG9wIC0gaGVpZ2h0IC0gZmllbGQub2Zmc2V0SGVpZ2h0XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnXG4gICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVuZGVyIEhUTUwgZm9yIGEgcGFydGljdWxhciBtb250aFxuICAgICAqL1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gICAgICBjb25zdCBkYXlzID0gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpXG4gICAgICBsZXQgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpXG4gICAgICBsZXQgZGF0YSA9IFtdXG4gICAgICBsZXQgcm93ID0gW11cblxuICAgICAgc2V0VG9TdGFydE9mRGF5KG5vdylcblxuICAgICAgaWYgKG9wdHMuZmlyc3REYXkgPiAwKSB7XG4gICAgICAgIGJlZm9yZSAtPSBvcHRzLmZpcnN0RGF5XG4gICAgICAgIGlmIChiZWZvcmUgPCAwKSB7XG4gICAgICAgICAgYmVmb3JlICs9IDdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyAxMSA6IG1vbnRoIC0gMVxuICAgICAgY29uc3QgbmV4dE1vbnRoID0gbW9udGggPT09IDExID8gMCA6IG1vbnRoICsgMVxuICAgICAgY29uc3QgeWVhck9mUHJldmlvdXNNb250aCA9IG1vbnRoID09PSAwID8geWVhciAtIDEgOiB5ZWFyXG4gICAgICBjb25zdCB5ZWFyT2ZOZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXJcbiAgICAgIGNvbnN0IGRheXNJblByZXZpb3VzTW9udGggPSBnZXREYXlzSW5Nb250aCh5ZWFyT2ZQcmV2aW91c01vbnRoLCBwcmV2aW91c01vbnRoKVxuICAgICAgbGV0IGNlbGxzID0gZGF5cyArIGJlZm9yZVxuICAgICAgbGV0IGFmdGVyID0gY2VsbHNcblxuICAgICAgd2hpbGUgKGFmdGVyID4gNykge1xuICAgICAgICBhZnRlciAtPSA3XG4gICAgICB9XG5cbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlclxuICAgICAgbGV0IGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgIGxldCBpLCByXG5cbiAgICAgIGZvciAoaSA9IDAsIHIgPSAwOyBpIDwgY2VsbHM7IGkrKykge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSlcbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGlzRGF0ZSh0aGlzLl9kKSA/IGNvbXBhcmVEYXRlcyhkYXksIHRoaXMuX2QpIDogZmFsc2VcbiAgICAgICAgY29uc3QgaXNUb2RheSA9IGNvbXBhcmVEYXRlcyhkYXksIG5vdylcbiAgICAgICAgY29uc3QgaGFzRXZlbnQgPSBvcHRzLmV2ZW50cy5pbmRleE9mKGRheS50b0RhdGVTdHJpbmcoKSkgIT09IC0xXG4gICAgICAgIGNvbnN0IGlzRW1wdHkgPSBpIDwgYmVmb3JlIHx8IGkgPj0gZGF5cyArIGJlZm9yZVxuICAgICAgICBsZXQgZGF5TnVtYmVyID0gMSArIChpIC0gYmVmb3JlKVxuICAgICAgICBsZXQgbW9udGhOdW1iZXIgPSBtb250aFxuICAgICAgICBsZXQgeWVhck51bWJlciA9IHllYXJcbiAgICAgICAgY29uc3QgaXNTdGFydFJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLnN0YXJ0UmFuZ2UsIGRheSlcbiAgICAgICAgY29uc3QgaXNFbmRSYW5nZSA9IG9wdHMuZW5kUmFuZ2UgJiYgY29tcGFyZURhdGVzKG9wdHMuZW5kUmFuZ2UsIGRheSlcbiAgICAgICAgY29uc3QgaXNJblJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIG9wdHMuZW5kUmFuZ2UgJiYgb3B0cy5zdGFydFJhbmdlIDwgZGF5ICYmIGRheSA8IG9wdHMuZW5kUmFuZ2VcbiAgICAgICAgY29uc3QgaXNEaXNhYmxlZCA9XG4gICAgICAgICAgKG9wdHMubWluRGF0ZSAmJiBkYXkgPCBvcHRzLm1pbkRhdGUpIHx8XG4gICAgICAgICAgKG9wdHMubWF4RGF0ZSAmJiBkYXkgPiBvcHRzLm1heERhdGUpIHx8XG4gICAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIGlzV2Vla2VuZChkYXkpKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVEYXlGbiAmJiBvcHRzLmRpc2FibGVEYXlGbihkYXkpKVxuXG4gICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgaWYgKGkgPCBiZWZvcmUpIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheXNJblByZXZpb3VzTW9udGggKyBkYXlOdW1iZXJcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gcHJldmlvdXNNb250aFxuICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZlByZXZpb3VzTW9udGhcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5TnVtYmVyIC0gZGF5c1xuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBuZXh0TW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZOZXh0TW9udGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXlDb25maWcgPSB7XG4gICAgICAgICAgZGF5OiBkYXlOdW1iZXIsXG4gICAgICAgICAgbW9udGg6IG1vbnRoTnVtYmVyLFxuICAgICAgICAgIHllYXI6IHllYXJOdW1iZXIsXG4gICAgICAgICAgaGFzRXZlbnQ6IGhhc0V2ZW50LFxuICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWQsXG4gICAgICAgICAgaXNUb2RheTogaXNUb2RheSxcbiAgICAgICAgICBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLFxuICAgICAgICAgIGlzRW1wdHk6IGlzRW1wdHksXG4gICAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXG4gICAgICAgICAgaXNFbmRSYW5nZTogaXNFbmRSYW5nZSxcbiAgICAgICAgICBpc0luUmFuZ2U6IGlzSW5SYW5nZSxcbiAgICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMsXG4gICAgICAgICAgZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLmVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdHMucGlja1dob2xlV2VlayAmJiBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICByb3cucHVzaChyZW5kZXJEYXkoZGF5Q29uZmlnKSlcblxuICAgICAgICBpZiAoKytyID09PSA3KSB7XG4gICAgICAgICAgaWYgKG9wdHMuc2hvd1dlZWtOdW1iZXIpIHtcbiAgICAgICAgICAgIHJvdy51bnNoaWZ0KHJlbmRlcldlZWsoaSAtIGJlZm9yZSwgbW9udGgsIHllYXIpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhLnB1c2gocmVuZGVyUm93KHJvdywgb3B0cy5pc1JUTCwgb3B0cy5waWNrV2hvbGVXZWVrLCBpc1dlZWtTZWxlY3RlZCkpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICByID0gMFxuICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZClcbiAgICB9LFxuXG4gICAgaXNWaXNpYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdlxuICAgIH0sXG5cbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgdGhpcy5fdiA9IHRydWVcbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgYWRkRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgICAgdGhpcy5hZGp1c3RQb3NpdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uT3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25PcGVuLmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB2ID0gdGhpcy5fdlxuICAgICAgaWYgKHYgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9ICdzdGF0aWMnIC8vIHJlc2V0XG4gICAgICAgIHRoaXMuZWwuc3R5bGUubGVmdCA9ICdhdXRvJ1xuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9ICdhdXRvJ1xuICAgICAgICBhZGRDbGFzcyh0aGlzLmVsLCAnaXMtaGlkZGVuJylcbiAgICAgICAgdGhpcy5fdiA9IGZhbHNlXG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHRoaXMuX28ub25DbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX28ub25DbG9zZS5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICd0b3VjaGVuZCcsIHRoaXMuX29uTW91c2VEb3duLCB0cnVlKVxuICAgICAgcmVtb3ZlRXZlbnQodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgICAgaWYgKHRoaXMuX28uZmllbGQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby5maWVsZCwgJ2NoYW5nZScsIHRoaXMuX29uSW5wdXRDaGFuZ2UpXG4gICAgICAgIGlmICh0aGlzLl9vLmJvdW5kKSB7XG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2spXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnZm9jdXMnLCB0aGlzLl9vbklucHV0Rm9jdXMpXG4gICAgICAgICAgcmVtb3ZlRXZlbnQodGhpcy5fby50cmlnZ2VyLCAnYmx1cicsIHRoaXMuX29uSW5wdXRCbHVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aW5kb3cuUGxhaW5QaWNrZXIgPSBQbGFpblBpY2tlclxufSkoKVxuIl0sIm5hbWVzIjpbImRvY3VtZW50Iiwid2luZG93IiwiYWRkRXZlbnQiLCJlbCIsImUiLCJjYWxsYmFjayIsImNhcHR1cmUiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidHJpbSIsInN0ciIsInJlcGxhY2UiLCJoYXNDbGFzcyIsImNuIiwiY2xhc3NOYW1lIiwiaW5kZXhPZiIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0FycmF5IiwidGVzdCIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsIm9iaiIsImlzRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsInplcm9QYWRkaW5nIiwibnVtIiwic2xpY2UiLCJpc1dlZWtlbmQiLCJkYXkiLCJkYXRlIiwiZ2V0RGF5IiwicHJldkFsbCIsInJlc3VsdCIsImVsZW1lbnQiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwicHVzaCIsImdldENsb3Nlc3QiLCJzZWxlY3RvciIsIm1hdGNoZXNTZWxlY3RvciIsIm1hdGNoZXMiLCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3IiLCJtb3pNYXRjaGVzU2VsZWN0b3IiLCJtc01hdGNoZXNTZWxlY3RvciIsInBhcmVudEVsZW1lbnQiLCJpc0xlYXBZZWFyIiwieWVhciIsImdldERheXNJbk1vbnRoIiwibW9udGgiLCJzZXRUb1N0YXJ0T2ZEYXkiLCJzZXRIb3VycyIsImNvbXBhcmVEYXRlcyIsImEiLCJiIiwiZXh0ZW5kIiwidG8iLCJmcm9tIiwib3ZlcndyaXRlIiwicHJvcCIsImhhc1Byb3AiLCJ1bmRlZmluZWQiLCJub2RlTmFtZSIsIkRhdGUiLCJmaXJlRXZlbnQiLCJldmVudE5hbWUiLCJkYXRhIiwiZXYiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJjcmVhdGVFdmVudE9iamVjdCIsImFkanVzdENhbGVuZGFyIiwiY2FsZW5kYXIiLCJNYXRoIiwiY2VpbCIsImFicyIsImZsb29yIiwiZGVmYXVsdHMiLCJyZW5kZXJEYXlOYW1lIiwib3B0cyIsImFiYnIiLCJmaXJzdERheSIsImkxOG4iLCJ3ZWVrZGF5c1Nob3J0Iiwid2Vla2RheXMiLCJyZW5kZXJEYXkiLCJhcnIiLCJhcmlhU2VsZWN0ZWQiLCJpc0VtcHR5Iiwic2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsImVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRocyIsImlzRGlzYWJsZWQiLCJpc1RvZGF5IiwiaXNTZWxlY3RlZCIsImhhc0V2ZW50IiwiaXNJblJhbmdlIiwiaXNTdGFydFJhbmdlIiwiaXNFbmRSYW5nZSIsImpvaW4iLCJyZW5kZXJXZWVrIiwiZCIsIm0iLCJ5Iiwib25lamFuIiwid2Vla051bSIsInJlbmRlclJvdyIsImRheXMiLCJpc1JUTCIsInBpY2tXaG9sZVdlZWsiLCJpc1Jvd1NlbGVjdGVkIiwicmV2ZXJzZSIsInJlbmRlckJvZHkiLCJyb3dzIiwicmVuZGVySGVhZCIsImkiLCJzaG93V2Vla051bWJlciIsInJlbmRlclRpdGxlIiwiaW5zdGFuY2UiLCJjIiwicmVmWWVhciIsInJhbmRJZCIsImoiLCJfbyIsImlzTWluWWVhciIsIm1pblllYXIiLCJpc01heFllYXIiLCJtYXhZZWFyIiwiaHRtbCIsInByZXYiLCJuZXh0IiwibWluTW9udGgiLCJtYXhNb250aCIsIm1vbnRocyIsIm1vbnRoSHRtbCIsInllYXJSYW5nZSIsInllYXJIdG1sIiwieWVhclN1ZmZpeCIsInNob3dNb250aEFmdGVyWWVhciIsInByZXZpb3VzTW9udGgiLCJudW1iZXJPZk1vbnRocyIsIm5leHRNb250aCIsInJlbmRlclRhYmxlIiwiUGxhaW5QaWNrZXIiLCJvcHRpb25zIiwic2VsZiIsImNvbmZpZyIsImRlZk9wdHNNaW5EYXRlIiwibWluRGF0ZSIsImRhdGVSYW5nZUFyciIsImRhdGVSYW5nZVNlbGVjdGVkQXJyIiwiX29uTW91c2VEb3duIiwiX3YiLCJldmVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJwYXJlbnROb2RlIiwiYm91bmQiLCJyYW5nZVNlbGVjdCIsInNlbGVjdGVkRGF0ZSIsImdldEF0dHJpYnV0ZSIsInNldE1pbkRhdGUiLCJsZW5ndGgiLCJmb3JFYWNoIiwic2V0RGF0ZSIsImhpZGUiLCJibHVyRmllbGRPblNlbGVjdCIsImZpZWxkIiwiYmx1ciIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbk1vdXNlT3ZlciIsInRhcmdldFBhcmVudHNUciIsImxhc3RUYXJnZXRQaWNrZXIiLCJwYXJlbnREYXRlUGlja2VyIiwidGFibGVPZkZpcnN0IiwiY2hpbGRyZW4iLCJ0cnNPZkZpcnN0VGFibGUiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxhc3RUck9mRmlyc3RUYWJsZSIsImhvdmVyZWRPdGhlclRhYmxlIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsIm5vZGUiLCJpblJhbmdlIiwicXVlcnlTZWxlY3RvckFsbCIsIm5vZGVDaGlsZHJlbiIsInRkc1ByZXZMYXN0V2VlayIsIl9vbk1vdXNlTGVhdmUiLCJfb25DaGFuZ2UiLCJnb3RvTW9udGgiLCJ2YWx1ZSIsImdvdG9ZZWFyIiwiX29uS2V5Q2hhbmdlIiwiaXNWaXNpYmxlIiwia2V5Q29kZSIsImFkanVzdERhdGUiLCJfb25JbnB1dENoYW5nZSIsImZpcmVkQnkiLCJwYXJzZSIsImZvcm1hdCIsInNob3ciLCJfb25JbnB1dEZvY3VzIiwiX29uSW5wdXRDbGljayIsIl9vbklucHV0Qmx1ciIsInBFbCIsImFjdGl2ZUVsZW1lbnQiLCJfYiIsInNldFRpbWVvdXQiLCJfb25DbGljayIsInRyaWdnZXIiLCJjcmVhdGVFbGVtZW50IiwidGhlbWUiLCJjb250YWluZXIiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJpbnNlcnRCZWZvcmUiLCJuZXh0U2libGluZyIsImRlZmF1bHREYXRlIiwic2V0RGVmYXVsdERhdGUiLCJkZWZEYXRlIiwiZ290b0RhdGUiLCJkaXNhYmxlV2Vla2VuZHMiLCJkaXNhYmxlRGF5Rm4iLCJub20iLCJwYXJzZUludCIsIm1heERhdGUiLCJzZXRNYXhEYXRlIiwiZmFsbGJhY2siLCJnZXRGdWxsWWVhciIsIl9kIiwicHJldmVudE9uU2VsZWN0IiwiZHJhdyIsIm1pbiIsIm1heCIsInN1cGVyQXJyIiwieXl5eSIsIm1tIiwiZ2V0TW9udGgiLCJkZCIsImdldERhdGUiLCJ5eXl5bW1kZCIsIm9uU2VsZWN0IiwibmV3Q2FsZW5kYXIiLCJjYWxlbmRhcnMiLCJmaXJzdFZpc2libGVEYXRlIiwibGFzdFZpc2libGVEYXRlIiwidmlzaWJsZURhdGUiLCJzZXRNb250aCIsIm1haW5DYWxlbmRhciIsImFkanVzdENhbGVuZGFycyIsInNpZ24iLCJkaWZmZXJlbmNlIiwibmV3RGF5IiwidmFsdWVPZiIsInN0YXJ0UmFuZ2UiLCJlbmRSYW5nZSIsImZvcmNlIiwiX3kiLCJfbSIsInJhbmRvbSIsInN1YnN0ciIsInBvc2l0aW9uU3RyIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwidHlwZSIsImZvY3VzIiwib25EcmF3Iiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJwb3NpdGlvbiIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwibGVmdCIsInRvcCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJwYWdlWE9mZnNldCIsImJvdHRvbSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRQYXJlbnQiLCJyZXBvc2l0aW9uIiwibm93IiwiYmVmb3JlIiwicm93IiwieWVhck9mUHJldmlvdXNNb250aCIsInllYXJPZk5leHRNb250aCIsImRheXNJblByZXZpb3VzTW9udGgiLCJjZWxscyIsImFmdGVyIiwiaXNXZWVrU2VsZWN0ZWQiLCJyIiwiZXZlbnRzIiwidG9EYXRlU3RyaW5nIiwiZGF5TnVtYmVyIiwibW9udGhOdW1iZXIiLCJ5ZWFyTnVtYmVyIiwiZGF5Q29uZmlnIiwidW5zaGlmdCIsImFkanVzdFBvc2l0aW9uIiwib25PcGVuIiwidiIsIm9uQ2xvc2UiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLEFBQUMsQ0FBQyxZQUFZOzs7O01BSU5BLFdBQVdDLE9BQU9ELFFBQXhCO01BQ01FLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxFQUFELEVBQUtDLENBQUwsRUFBUUMsUUFBUixFQUFrQkMsT0FBbEI7V0FBOEJILEdBQUdJLGdCQUFILENBQW9CSCxDQUFwQixFQUF1QkMs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
