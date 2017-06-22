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

  var getParents = function getParents(el, parentSelector) {
    if (parentSelector === undefined) {
      parentSelector = document;
    }

    var parents = [];
    var p = el.parentNode;

    while (p !== parentSelector) {
      var o = p;
      parents.push(o);
      p = o.parentNode;
    }

    parents.push(parentSelector);

    return parents;
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

      if (!target || !opts.rangeSelect) return;

      if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled') && self.dateRangeArr.length > 0) {
        addClass(target.parentNode.parentNode, 'hoveredWeek');

        Array.prototype.forEach.call(document.getElementsByClassName('hoveredWeek'), function (node) {
          var parent = node.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.datepicker__lendar');

          console.log(parent);
          console.log(getParents(target));

          var tableOfLast = parent[parent.length - 1];
          var TRF = tableOfLast.parentNode.querySelector('.datepicker__lendar').querySelectorAll('tr');
          var TRFOfLast = TRF[TRF.length - 1];
          addClass(TRFOfLast, 'hoveredOtherTable');

          Array.prototype.forEach.call(prevAll(node), function (prevAllTr) {
            Array.prototype.forEach.call(prevAllTr.querySelectorAll('td:not(is-disabled)'), function (tds) {
              addClass(tds, 'in-range');
            });
          });
        });

        Array.prototype.forEach.call(document.getElementsByClassName('hoveredOtherTable'), function (node) {
          var enableTd = node.querySelectorAll('td:not(.is-disabled)');
          Array.prototype.forEach.call(enableTd, function (node) {
            addClass(node, 'in-range');
          });

          Array.prototype.forEach.call(prevAll(node), function (prevTr) {
            Array.prototype.forEach.call(prevTr.querySelectorAll('td:not(.is-disabled)'), function (tds) {
              addClass(tds, 'in-range');
            });
          });
        });

        Array.prototype.forEach.call(prevAll(target), function (prevTr) {
          Array.prototype.forEach.call(prevTr.querySelectorAll('td:not(.is-disabled)'), function (tds) {
            addClass(tds, 'in-range');
          });
        });
      }
    };

    self._onMouseLeave = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target || !opts.rangeSelect) return;

      if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled') && self.dateRangeArr.length > 0) {
        removeClass(target.parentNode.parentNode, 'hoveredWeek');
        removeClass(target.parentNode, 'in-range');
        Array.prototype.forEach.call(document.getElementsByClassName('hoveredOtherTable'), function (node) {
          removeClass(node, 'hoveredOtherTable'
          // console.log(node.querySelectorAll('.in-range'))
          );
        }
        // $('.hoverdOtherTable').removeClass('hoverdOtherTable').find('.in-range').removeClass('in-range');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogZmVhdHVyZSBkZXRlY3Rpb24gYW5kIGhlbHBlciBmdW5jdGlvbnNcbiAgICovXG4gIGNvbnN0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50XG4gIGNvbnN0IGFkZEV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHJlbW92ZUV2ZW50ID0gKGVsLCBlLCBjYWxsYmFjaywgY2FwdHVyZSkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBjYWxsYmFjaywgISFjYXB0dXJlKVxuXG4gIGNvbnN0IHRyaW0gPSBzdHIgPT4gKHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykpXG5cbiAgY29uc3QgaGFzQ2xhc3MgPSAoZWwsIGNuKSA9PiAoJyAnICsgZWwuY2xhc3NOYW1lICsgJyAnKS5pbmRleE9mKCcgJyArIGNuICsgJyAnKSAhPT0gLTFcblxuICBjb25zdCBhZGRDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBpZiAoIWhhc0NsYXNzKGVsLCBjbikpIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZSA9PT0gJycgPyBjbiA6IGVsLmNsYXNzTmFtZSArICcgJyArIGNuXG4gIH1cblxuICBjb25zdCByZW1vdmVDbGFzcyA9IChlbCwgY24pID0+IHtcbiAgICBlbC5jbGFzc05hbWUgPSB0cmltKCgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLnJlcGxhY2UoJyAnICsgY24gKyAnICcsICcgJykpXG4gIH1cblxuICBjb25zdCBpc0FycmF5ID0gb2JqID0+IC9BcnJheS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSlcblxuICBjb25zdCBpc0RhdGUgPSBvYmogPT4gL0RhdGUvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKVxuXG4gIGNvbnN0IHplcm9QYWRkaW5nID0gbnVtID0+ICgnMCcgKyBudW0pLnNsaWNlKC0yKVxuXG4gIGNvbnN0IGlzV2Vla2VuZCA9IGRhdGUgPT4ge1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF5KClcbiAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNlxuICB9XG5cbiAgY29uc3QgcHJldkFsbCA9IGVsZW1lbnQgPT4ge1xuICAgIGxldCByZXN1bHQgPSBbXVxuICAgIHdoaWxlICgoZWxlbWVudCA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZykgIT09IG51bGwpIHJlc3VsdC5wdXNoKGVsZW1lbnQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgY29uc3QgZ2V0UGFyZW50cyA9IChlbCwgcGFyZW50U2VsZWN0b3IpID0+IHtcbiAgICBpZiAocGFyZW50U2VsZWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFyZW50U2VsZWN0b3IgPSBkb2N1bWVudFxuICAgIH1cblxuICAgIGxldCBwYXJlbnRzID0gW11cbiAgICBsZXQgcCA9IGVsLnBhcmVudE5vZGVcblxuICAgIHdoaWxlIChwICE9PSBwYXJlbnRTZWxlY3Rvcikge1xuICAgICAgbGV0IG8gPSBwXG4gICAgICBwYXJlbnRzLnB1c2gobylcbiAgICAgIHAgPSBvLnBhcmVudE5vZGVcbiAgICB9XG5cbiAgICBwYXJlbnRzLnB1c2gocGFyZW50U2VsZWN0b3IpXG5cbiAgICByZXR1cm4gcGFyZW50c1xuICB9XG5cbiAgY29uc3QgaXNMZWFwWWVhciA9IHllYXIgPT4gKHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDApIHx8IHllYXIgJSA0MDAgPT09IDBcblxuICBjb25zdCBnZXREYXlzSW5Nb250aCA9ICh5ZWFyLCBtb250aCkgPT4gWzMxLCBpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdW21vbnRoXVxuXG4gIGNvbnN0IHNldFRvU3RhcnRPZkRheSA9IGRhdGUgPT4ge1xuICAgIGlmIChpc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgfVxuXG4gIGNvbnN0IGNvbXBhcmVEYXRlcyA9IChhLCBiKSA9PiBhLmdldFRpbWUoKSA9PT0gYi5nZXRUaW1lKClcblxuICBjb25zdCBleHRlbmQgPSAodG8sIGZyb20sIG92ZXJ3cml0ZSkgPT4ge1xuICAgIGxldCBwcm9wXG4gICAgbGV0IGhhc1Byb3BcblxuICAgIGZvciAocHJvcCBpbiBmcm9tKSB7XG4gICAgICBoYXNQcm9wID0gdG9bcHJvcF0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKGhhc1Byb3AgJiYgdHlwZW9mIGZyb21bcHJvcF0gPT09ICdvYmplY3QnICYmIGZyb21bcHJvcF0gIT09IG51bGwgJiYgZnJvbVtwcm9wXS5ub2RlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChpc0RhdGUoZnJvbVtwcm9wXSkpIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgICAgICB0b1twcm9wXSA9IG5ldyBEYXRlKGZyb21bcHJvcF0uZ2V0VGltZSgpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGZyb21bcHJvcF0pKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgdG9bcHJvcF0gPSBmcm9tW3Byb3BdLnNsaWNlKDApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvW3Byb3BdID0gZXh0ZW5kKHt9LCBmcm9tW3Byb3BdLCBvdmVyd3JpdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3ZlcndyaXRlIHx8ICFoYXNQcm9wKSB7XG4gICAgICAgIHRvW3Byb3BdID0gZnJvbVtwcm9wXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9cbiAgfVxuXG4gIGNvbnN0IGZpcmVFdmVudCA9IChlbCwgZXZlbnROYW1lLCBkYXRhKSA9PiB7XG4gICAgbGV0IGV2XG5cbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKVxuICAgICAgZXYuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQoZXYpXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpXG4gICAgICBldiA9IGV4dGVuZChldiwgZGF0YSlcbiAgICAgIGVsLmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBldilcbiAgICB9XG4gIH1cblxuICBjb25zdCBhZGp1c3RDYWxlbmRhciA9IGNhbGVuZGFyID0+IHtcbiAgICBpZiAoY2FsZW5kYXIubW9udGggPCAwKSB7XG4gICAgICBjYWxlbmRhci55ZWFyIC09IE1hdGguY2VpbChNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMilcbiAgICAgIGNhbGVuZGFyLm1vbnRoICs9IDEyXG4gICAgfVxuICAgIGlmIChjYWxlbmRhci5tb250aCA+IDExKSB7XG4gICAgICBjYWxlbmRhci55ZWFyICs9IE1hdGguZmxvb3IoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpXG4gICAgICBjYWxlbmRhci5tb250aCAtPSAxMlxuICAgIH1cbiAgICByZXR1cm4gY2FsZW5kYXJcbiAgfVxuXG4gIC8qKlxuICAgKiBkZWZhdWx0cyBhbmQgbG9jYWxpc2F0aW9uXG4gICAqL1xuICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAvLyBiaW5kIHRoZSBwaWNrZXIgdG8gYSBmb3JtIGZpZWxkXG4gICAgZmllbGQ6IG51bGwsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNob3cvaGlkZSB0aGUgcGlja2VyIG9uIGBmaWVsZGAgZm9jdXMgKGRlZmF1bHQgYHRydWVgIGlmIGBmaWVsZGAgaXMgc2V0KVxuICAgIGJvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZGF0ZXBpY2tlciwgcmVsYXRpdmUgdG8gdGhlIGZpZWxkIChkZWZhdWx0IHRvIGJvdHRvbSAmIGxlZnQpXG4gICAgLy8gKCdib3R0b20nICYgJ2xlZnQnIGtleXdvcmRzIGFyZSBub3QgdXNlZCwgJ3RvcCcgJiAncmlnaHQnIGFyZSBtb2RpZmllciBvbiB0aGUgYm90dG9tL2xlZnQgcG9zaXRpb24pXG4gICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGZpdCBpbiB0aGUgdmlld3BvcnQgZXZlbiBpZiBpdCBtZWFucyByZXBvc2l0aW9uaW5nIGZyb20gdGhlIHBvc2l0aW9uIG9wdGlvblxuICAgIHJlcG9zaXRpb246IHRydWUsXG5cbiAgICAvLyB0aGUgZGVmYXVsdCBvdXRwdXQgZm9ybWF0IGZvciBgLnRvU3RyaW5nKClgIGFuZCBgZmllbGRgIHZhbHVlXG4gICAgLy8gZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cbiAgICAvLyB0aGUgdG9TdHJpbmcgZnVuY3Rpb24gd2hpY2ggZ2V0cyBwYXNzZWQgYSBjdXJyZW50IGRhdGUgb2JqZWN0IGFuZCBmb3JtYXRcbiAgICAvLyBhbmQgcmV0dXJucyBhIHN0cmluZ1xuICAgIC8vIHRvU3RyaW5nOiBudWxsLFxuXG4gICAgLy8gdXNlZCB0byBjcmVhdGUgZGF0ZSBvYmplY3QgZnJvbSBjdXJyZW50IGlucHV0IHN0cmluZ1xuICAgIHBhcnNlOiBudWxsLFxuXG4gICAgLy8gdGhlIGluaXRpYWwgZGF0ZSB0byB2aWV3IHdoZW4gZmlyc3Qgb3BlbmVkXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXG5cbiAgICAvLyBtYWtlIHRoZSBgZGVmYXVsdERhdGVgIHRoZSBpbml0aWFsIHNlbGVjdGVkIHZhbHVlXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxuXG4gICAgLy8gZmlyc3QgZGF5IG9mIHdlZWsgKDA6IFN1bmRheSwgMTogTW9uZGF5IGV0YylcbiAgICBmaXJzdERheTogMCxcblxuICAgIC8vIHRoZSBkZWZhdWx0IGZsYWcgZm9yIG1vbWVudCdzIHN0cmljdCBkYXRlIHBhcnNpbmdcbiAgICBmb3JtYXRTdHJpY3Q6IGZhbHNlLFxuXG4gICAgLy8gdGhlIG1pbmltdW0vZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgIG1pbkRhdGU6IG51bGwsXG4gICAgLy8gdGhlIG1heGltdW0vbGF0ZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICBtYXhEYXRlOiBudWxsLFxuXG4gICAgLy8gbnVtYmVyIG9mIHllYXJzIGVpdGhlciBzaWRlLCBvciBhcnJheSBvZiB1cHBlci9sb3dlciByYW5nZVxuICAgIHllYXJSYW5nZTogMTAsXG5cbiAgICAvLyBzaG93IHdlZWsgbnVtYmVycyBhdCBoZWFkIG9mIHJvd1xuICAgIHNob3dXZWVrTnVtYmVyOiBmYWxzZSxcblxuICAgIC8vIFdlZWsgcGlja2VyIG1vZGVcbiAgICBwaWNrV2hvbGVXZWVrOiBmYWxzZSxcblxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXG4gICAgbWluWWVhcjogMCxcbiAgICBtYXhZZWFyOiA5OTk5LFxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXG4gICAgbWF4TW9udGg6IHVuZGVmaW5lZCxcblxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXG4gICAgZW5kUmFuZ2U6IG51bGwsXG5cbiAgICBpc1JUTDogZmFsc2UsXG5cbiAgICAvLyBBZGRpdGlvbmFsIHRleHQgdG8gYXBwZW5kIHRvIHRoZSB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHllYXJTdWZmaXg6ICcnLFxuXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxuICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG5cbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcbiAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBmYWxzZSxcblxuICAgIC8vIEFsbG93cyB1c2VyIHRvIHNlbGVjdCBkYXlzIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxuICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXG5cbiAgICAvLyBob3cgbWFueSBtb250aHMgYXJlIHZpc2libGVcbiAgICBudW1iZXJPZk1vbnRoczogMSxcblxuICAgIC8vIHdoZW4gbnVtYmVyT2ZNb250aHMgaXMgdXNlZCwgdGhpcyB3aWxsIGhlbHAgeW91IHRvIGNob29zZSB3aGVyZSB0aGUgbWFpbiBjYWxlbmRhciB3aWxsIGJlIChkZWZhdWx0IGBsZWZ0YCwgY2FuIGJlIHNldCB0byBgcmlnaHRgKVxuICAgIC8vIG9ubHkgdXNlZCBmb3IgdGhlIGZpcnN0IGRpc3BsYXkgb3Igd2hlbiBhIHNlbGVjdGVkIGRhdGUgaXMgbm90IHZpc2libGVcbiAgICBtYWluQ2FsZW5kYXI6ICdsZWZ0JyxcblxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBCbHVyIGZpZWxkIHdoZW4gZGF0ZSBpcyBzZWxlY3RlZFxuICAgIGJsdXJGaWVsZE9uU2VsZWN0OiB0cnVlLFxuXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cbiAgICBpMThuOiB7XG4gICAgICBwcmV2aW91c01vbnRoOiAnUHJldiBNb250aCcsXG4gICAgICBuZXh0TW9udGg6ICdOZXh0IE1vbnRoJyxcbiAgICAgIG1vbnRoczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11cbiAgICB9LFxuXG4gICAgLy8gVGhlbWUgQ2xhc3NuYW1lXG4gICAgdGhlbWU6IG51bGwsXG5cbiAgICAvLyBldmVudHMgYXJyYXlcbiAgICBldmVudHM6IFtdLFxuXG4gICAgcmFuZ2VTZWxlY3Q6IGZhbHNlLFxuXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBvblNlbGVjdDogbnVsbCxcbiAgICBvbk9wZW46IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkRyYXc6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiB0ZW1wbGF0aW5nIGZ1bmN0aW9ucyB0byBhYnN0cmFjdCBIVE1MIHJlbmRlcmluZ1xuICAgKi9cbiAgY29uc3QgcmVuZGVyRGF5TmFtZSA9IChvcHRzLCBkYXksIGFiYnIpID0+IHtcbiAgICBkYXkgKz0gb3B0cy5maXJzdERheVxuICAgIHdoaWxlIChkYXkgPj0gNykge1xuICAgICAgZGF5IC09IDdcbiAgICB9XG4gICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNTaG9ydFtkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV1cbiAgfVxuXG4gIGNvbnN0IHJlbmRlckRheSA9IG9wdHMgPT4ge1xuICAgIGxldCBhcnIgPSBbXVxuICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnXG4gICAgaWYgKG9wdHMuaXNFbXB0eSkge1xuICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xuICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJylcblxuICAgICAgICBpZiAoIW9wdHMuZW5hYmxlU2VsZWN0aW9uRGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzKSB7XG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdHMuaXNEaXNhYmxlZCkgYXJyLnB1c2goJ2lzLWRpc2FibGVkJylcblxuICAgIGlmIChvcHRzLmlzVG9kYXkpIGFyci5wdXNoKCdpcy10b2RheScpXG5cbiAgICBpZiAob3B0cy5pc1NlbGVjdGVkKSB7XG4gICAgICBhcnIucHVzaCgnaXMtc2VsZWN0ZWQnKVxuICAgICAgYXJpYVNlbGVjdGVkID0gJ3RydWUnXG4gICAgfVxuICAgIGlmIChvcHRzLmhhc0V2ZW50KSBhcnIucHVzaCgnaGFzLWV2ZW50JylcblxuICAgIGlmIChvcHRzLmlzSW5SYW5nZSkgYXJyLnB1c2goJ2lzLWlucmFuZ2UnKVxuXG4gICAgaWYgKG9wdHMuaXNTdGFydFJhbmdlKSBhcnIucHVzaCgnaXMtc3RhcnRyYW5nZScpXG5cbiAgICBpZiAob3B0cy5pc0VuZFJhbmdlKSBhcnIucHVzaCgnaXMtZW5kcmFuZ2UnKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICc8dGQgZGF0YS1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIiBjbGFzcz1cIicgK1xuICAgICAgYXJyLmpvaW4oJyAnKSArXG4gICAgICAnXCIgYXJpYS1zZWxlY3RlZD1cIicgK1xuICAgICAgYXJpYVNlbGVjdGVkICtcbiAgICAgICdcIj4nICtcbiAgICAgICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fYnV0dG9uIGRhdGVwaWNrZXJfX2RheVwiIHR5cGU9XCJidXR0b25cIiAnICtcbiAgICAgICdkYXRhLWRhdGVwaWNrZXIteWVhcj1cIicgK1xuICAgICAgb3B0cy55ZWFyICtcbiAgICAgICdcIiBkYXRhLWRhdGVwaWNrZXItbW9udGg9XCInICtcbiAgICAgIG9wdHMubW9udGggK1xuICAgICAgJ1wiIGRhdGEtZGF0ZXBpY2tlci1kYXk9XCInICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICdcIj4nICtcbiAgICAgIG9wdHMuZGF5ICtcbiAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICc8L3RkPidcbiAgICApXG4gIH1cblxuICBjb25zdCByZW5kZXJXZWVrID0gKGQsIG0sIHkpID0+IHtcbiAgICBjb25zdCBvbmVqYW4gPSBuZXcgRGF0ZSh5LCAwLCAxKVxuICAgIGNvbnN0IHdlZWtOdW0gPSBNYXRoLmNlaWwoKChuZXcgRGF0ZSh5LCBtLCBkKSAtIG9uZWphbikgLyA4NjQwMDAwMCArIG9uZWphbi5nZXREYXkoKSArIDEpIC8gNylcbiAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImRhdGVwaWNrZXJfX3dlZWtcIj4nICsgd2Vla051bSArICc8L3RkPidcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclJvdyA9IChkYXlzLCBpc1JUTCwgcGlja1dob2xlV2VlaywgaXNSb3dTZWxlY3RlZCkgPT5cbiAgICAnPHRyIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcm93JyArXG4gICAgKHBpY2tXaG9sZVdlZWsgPyAnIHBpY2std2hvbGUtd2VlaycgOiAnJykgK1xuICAgIChpc1Jvd1NlbGVjdGVkID8gJyBpcy1zZWxlY3RlZCcgOiAnJykgK1xuICAgICdcIj4nICtcbiAgICAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICtcbiAgICAnPC90cj4nXG5cbiAgY29uc3QgcmVuZGVyQm9keSA9IHJvd3MgPT4gJzx0Ym9keT4nICsgcm93cy5qb2luKCcnKSArICc8L3Rib2R5PidcblxuICBjb25zdCByZW5kZXJIZWFkID0gb3B0cyA9PiB7XG4gICAgbGV0IGlcbiAgICBsZXQgYXJyID0gW11cbiAgICBpZiAob3B0cy5zaG93V2Vla051bWJlcikge1xuICAgICAgYXJyLnB1c2goJzx0aD48L3RoPicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgIGFyci5wdXNoKCc8dGggc2NvcGU9XCJjb2xcIj48YWJiciB0aXRsZT1cIicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGkpICsgJ1wiPicgKyByZW5kZXJEYXlOYW1lKG9wdHMsIGksIHRydWUpICsgJzwvYWJicj48L3RoPicpXG4gICAgfVxuICAgIHJldHVybiAnPHRoZWFkPjx0cj4nICsgKG9wdHMuaXNSVEwgPyBhcnIucmV2ZXJzZSgpIDogYXJyKS5qb2luKCcnKSArICc8L3RyPjwvdGhlYWQ+J1xuICB9XG5cbiAgY29uc3QgcmVuZGVyVGl0bGUgPSAoaW5zdGFuY2UsIGMsIHllYXIsIG1vbnRoLCByZWZZZWFyLCByYW5kSWQpID0+IHtcbiAgICBsZXQgaVxuICAgIGxldCBqXG4gICAgbGV0IGFyclxuICAgIGNvbnN0IG9wdHMgPSBpbnN0YW5jZS5fb1xuICAgIGNvbnN0IGlzTWluWWVhciA9IHllYXIgPT09IG9wdHMubWluWWVhclxuICAgIGNvbnN0IGlzTWF4WWVhciA9IHllYXIgPT09IG9wdHMubWF4WWVhclxuICAgIGxldCBodG1sID0gJzxkaXYgaWQ9XCInICsgcmFuZElkICsgJ1wiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGl0bGVcIiByb2xlPVwiaGVhZGluZ1wiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiPidcblxuICAgIGxldCBwcmV2ID0gdHJ1ZVxuICAgIGxldCBuZXh0ID0gdHJ1ZVxuXG4gICAgZm9yIChhcnIgPSBbXSwgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBhcnIucHVzaChcbiAgICAgICAgJzxvcHRpb24gdmFsdWU9XCInICtcbiAgICAgICAgICAoeWVhciA9PT0gcmVmWWVhciA/IGkgLSBjIDogMTIgKyBpIC0gYykgK1xuICAgICAgICAgICdcIicgK1xuICAgICAgICAgIChpID09PSBtb250aCA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArXG4gICAgICAgICAgKChpc01pblllYXIgJiYgaSA8IG9wdHMubWluTW9udGgpIHx8IChpc01heFllYXIgJiYgaSA+IG9wdHMubWF4TW9udGgpID8gJ2Rpc2FibGVkPVwiZGlzYWJsZWRcIicgOiAnJykgK1xuICAgICAgICAgICc+JyArXG4gICAgICAgICAgb3B0cy5pMThuLm1vbnRoc1tpXSArXG4gICAgICAgICAgJzwvb3B0aW9uPidcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBtb250aEh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgb3B0cy5pMThuLm1vbnRoc1ttb250aF0gK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LW1vbnRoXCIgdGFiaW5kZXg9XCItMVwiPicgK1xuICAgICAgYXJyLmpvaW4oJycpICtcbiAgICAgICc8L3NlbGVjdD48L2Rpdj4nXG5cbiAgICBpZiAoaXNBcnJheShvcHRzLnllYXJSYW5nZSkpIHtcbiAgICAgIGkgPSBvcHRzLnllYXJSYW5nZVswXVxuICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICBpID0geWVhciAtIG9wdHMueWVhclJhbmdlXG4gICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZVxuICAgIH1cblxuICAgIGZvciAoYXJyID0gW107IGkgPCBqICYmIGkgPD0gb3B0cy5tYXhZZWFyOyBpKyspIHtcbiAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikgYXJyLnB1c2goJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIicgKyAoaSA9PT0geWVhciA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIGkgKyAnPC9vcHRpb24+JylcbiAgICB9XG4gICAgY29uc3QgeWVhckh0bWwgPVxuICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyX19sYWJlbFwiPicgK1xuICAgICAgeWVhciArXG4gICAgICBvcHRzLnllYXJTdWZmaXggK1xuICAgICAgJzxzZWxlY3QgY2xhc3M9XCJkYXRlcGlja2VyX19zZWxlY3QgZGF0ZXBpY2tlcl9fc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JyArXG4gICAgICBhcnIuam9pbignJykgK1xuICAgICAgJzwvc2VsZWN0PjwvZGl2PidcblxuICAgIGlmIChvcHRzLnNob3dNb250aEFmdGVyWWVhcikge1xuICAgICAgaHRtbCArPSB5ZWFySHRtbCArIG1vbnRoSHRtbFxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9IG1vbnRoSHRtbCArIHllYXJIdG1sXG4gICAgfVxuXG4gICAgaWYgKGlzTWluWWVhciAmJiAobW9udGggPT09IDAgfHwgb3B0cy5taW5Nb250aCA+PSBtb250aCkpIHByZXYgPSBmYWxzZVxuXG4gICAgaWYgKGlzTWF4WWVhciAmJiAobW9udGggPT09IDExIHx8IG9wdHMubWF4TW9udGggPD0gbW9udGgpKSBuZXh0ID0gZmFsc2VcblxuICAgIGlmIChjID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fcHJldicgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLnByZXZpb3VzTW9udGggKyAnPC9idXR0b24+J1xuICAgIH1cbiAgICBpZiAoYyA9PT0gaW5zdGFuY2UuX28ubnVtYmVyT2ZNb250aHMgLSAxKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGF0ZXBpY2tlcl9fbmV4dCcgKyAobmV4dCA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgJ1wiIHR5cGU9XCJidXR0b25cIj4nICsgb3B0cy5pMThuLm5leHRNb250aCArICc8L2J1dHRvbj4nXG4gICAgfVxuXG4gICAgaHRtbCArPSAnPC9kaXY+J1xuXG4gICAgcmV0dXJuIGh0bWxcbiAgfVxuXG4gIGNvbnN0IHJlbmRlclRhYmxlID0gKG9wdHMsIGRhdGEsIHJhbmRJZCkgPT5cbiAgICAnPHRhYmxlIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNsYXNzPVwiZGF0ZXBpY2tlcl9fdGFibGVcIiByb2xlPVwiZ3JpZFwiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgIHJhbmRJZCArXG4gICAgJ1wiPicgK1xuICAgIHJlbmRlckhlYWQob3B0cykgK1xuICAgIHJlbmRlckJvZHkoZGF0YSkgK1xuICAgICc8L3RhYmxlPidcblxuICAvKipcbiAgICogUGxhaW5QaWNrZXIgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0IFBsYWluUGlja2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IG9wdHMgPSBzZWxmLmNvbmZpZyhvcHRpb25zKVxuXG4gICAgY29uc3QgZGVmT3B0c01pbkRhdGUgPSBvcHRzLm1pbkRhdGVcbiAgICBzZWxmLmRhdGVSYW5nZUFyciA9IFtdXG4gICAgc2VsZi5kYXRlUmFuZ2VTZWxlY3RlZEFyciA9IFtdXG5cbiAgICBzZWxmLl9vbk1vdXNlRG93biA9IGUgPT4ge1xuICAgICAgaWYgKCFzZWxmLl92KSByZXR1cm5cblxuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0KSByZXR1cm5cblxuICAgICAgaWYgKCFoYXNDbGFzcyh0YXJnZXQsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19idXR0b24nKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LCAnaXMtZW1wdHknKSAmJiAhaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICdpcy1kaXNhYmxlZCcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAob3B0cy5yYW5nZVNlbGVjdCkgeyAvLyBzZWxlY3RhYmxlIGRhdGUgcmFuZ2Ugb24gc2luZ2xlIGNhbGVuZGFyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLXllYXInKSxcbiAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXRlcGlja2VyLWRheScpXG4gICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fYnV0dG9uLS1zdGFydGVkJylcblxuICAgICAgICAgICAgICAgIHNlbGYuc2V0TWluRGF0ZShzZWxlY3RlZERhdGUpXG5cbiAgICAgICAgICAgICAgICAvLyDpgbjmip7lj6/og73jga/kuozjgaTjgb7jgafjgILjgajjgorjgYLjgYjjgZpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIgPSBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmRhdGVSYW5nZUFyci5wdXNoKHNlbGVjdGVkRGF0ZSlcblxuICAgICAgICAgICAgICAgIHNlbGYuZGF0ZVJhbmdlQXJyLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2V0RGF0ZShlKVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgLy8gc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2V0TWluRGF0ZShkZWZPcHRzTWluRGF0ZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMuYmx1ckZpZWxkT25TZWxlY3QgJiYgb3B0cy5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgb3B0cy5maWVsZC5ibHVyKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXREYXRlKFxuICAgICAgICAgICAgICAgICAgbmV3IERhdGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci15ZWFyJyksXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZXBpY2tlci1tb250aCcpLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGVwaWNrZXItZGF5JylcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKClcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5ibHVyRmllbGRPblNlbGVjdCAmJiBvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICBvcHRzLmZpZWxkLmJsdXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19wcmV2JykpIHtcbiAgICAgICAgICBzZWxmLnByZXZNb250aCgpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAnZGF0ZXBpY2tlcl9fbmV4dCcpKSB7XG4gICAgICAgICAgc2VsZi5uZXh0TW9udGgoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdCcpKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX2MgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25Nb3VzZU92ZXIgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG5cbiAgICAgIGlmICghdGFyZ2V0IHx8ICFvcHRzLnJhbmdlU2VsZWN0KSByZXR1cm5cblxuICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX2J1dHRvbicpICYmICFoYXNDbGFzcyh0YXJnZXQsICdpcy1lbXB0eScpICYmICFoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2lzLWRpc2FibGVkJykgJiYgc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMCkge1xuICAgICAgICBhZGRDbGFzcyh0YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLCAnaG92ZXJlZFdlZWsnKVxuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaG92ZXJlZFdlZWsnKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICBsZXQgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXRlcGlja2VyX19sZW5kYXInKVxuXG4gICAgICAgICAgY29uc29sZS5sb2cocGFyZW50KVxuICAgICAgICAgIGNvbnNvbGUubG9nKGdldFBhcmVudHModGFyZ2V0KSlcblxuICAgICAgICAgIGxldCB0YWJsZU9mTGFzdCA9IHBhcmVudFtwYXJlbnQubGVuZ3RoIC0gMV1cbiAgICAgICAgICBsZXQgVFJGID0gdGFibGVPZkxhc3QucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlcl9fbGVuZGFyJykucXVlcnlTZWxlY3RvckFsbCgndHInKVxuICAgICAgICAgIGxldCBUUkZPZkxhc3QgPSBUUkZbVFJGLmxlbmd0aCAtIDFdXG4gICAgICAgICAgYWRkQ2xhc3MoVFJGT2ZMYXN0LCAnaG92ZXJlZE90aGVyVGFibGUnKVxuXG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChwcmV2QWxsKG5vZGUpLCBmdW5jdGlvbiAocHJldkFsbFRyKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHByZXZBbGxUci5xdWVyeVNlbGVjdG9yQWxsKCd0ZDpub3QoaXMtZGlzYWJsZWQpJyksIGZ1bmN0aW9uICh0ZHMpIHtcbiAgICAgICAgICAgICAgYWRkQ2xhc3ModGRzLCAnaW4tcmFuZ2UnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaG92ZXJlZE90aGVyVGFibGUnKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICBsZXQgZW5hYmxlVGQgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkOm5vdCguaXMtZGlzYWJsZWQpJylcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVuYWJsZVRkLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgYWRkQ2xhc3Mobm9kZSwgJ2luLXJhbmdlJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChwcmV2QWxsKG5vZGUpLCBmdW5jdGlvbiAocHJldlRyKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHByZXZUci5xdWVyeVNlbGVjdG9yQWxsKCd0ZDpub3QoLmlzLWRpc2FibGVkKScpLCBmdW5jdGlvbiAodGRzKSB7XG4gICAgICAgICAgICAgIGFkZENsYXNzKHRkcywgJ2luLXJhbmdlJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHByZXZBbGwodGFyZ2V0KSwgZnVuY3Rpb24gKHByZXZUcikge1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwocHJldlRyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkOm5vdCguaXMtZGlzYWJsZWQpJyksIGZ1bmN0aW9uICh0ZHMpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKHRkcywgJ2luLXJhbmdlJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX29uTW91c2VMZWF2ZSA9IGUgPT4ge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcbiAgICAgIGlmICghdGFyZ2V0IHx8ICFvcHRzLnJhbmdlU2VsZWN0KSByZXR1cm5cblxuICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX2J1dHRvbicpICYmICFoYXNDbGFzcyh0YXJnZXQsICdpcy1lbXB0eScpICYmICFoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2lzLWRpc2FibGVkJykgJiYgc2VsZi5kYXRlUmFuZ2VBcnIubGVuZ3RoID4gMCkge1xuICAgICAgICByZW1vdmVDbGFzcyh0YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLCAnaG92ZXJlZFdlZWsnKVxuICAgICAgICByZW1vdmVDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ2luLXJhbmdlJylcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdob3ZlcmVkT3RoZXJUYWJsZScpLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgIHJlbW92ZUNsYXNzKG5vZGUsICdob3ZlcmVkT3RoZXJUYWJsZScpXG4gICAgICAgICAgLy8gY29uc29sZS5sb2cobm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuaW4tcmFuZ2UnKSlcbiAgICAgICAgfSlcbiAgICAgICAgLy8gJCgnLmhvdmVyZE90aGVyVGFibGUnKS5yZW1vdmVDbGFzcygnaG92ZXJkT3RoZXJUYWJsZScpLmZpbmQoJy5pbi1yYW5nZScpLnJlbW92ZUNsYXNzKCdpbi1yYW5nZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDxzZWxlY3Q+XG4gICAgc2VsZi5fb25DaGFuZ2UgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG5cbiAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICdkYXRlcGlja2VyX19zZWxlY3QtbW9udGgnKSkge1xuICAgICAgICBzZWxmLmdvdG9Nb250aCh0YXJnZXQudmFsdWUpXG4gICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ2RhdGVwaWNrZXJfX3NlbGVjdC15ZWFyJykpIHtcbiAgICAgICAgc2VsZi5nb3RvWWVhcih0YXJnZXQudmFsdWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25LZXlDaGFuZ2UgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuXG4gICAgICBpZiAoc2VsZi5pc1Zpc2libGUoKSkge1xuICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgIGlmIChvcHRzLmZpZWxkKSB7XG4gICAgICAgICAgICAgIG9wdHMuZmllbGQuYmx1cigpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHNlbGYuYWRqdXN0RGF0ZSgnc3VidHJhY3QnLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgc2VsZi5hZGp1c3REYXRlKCdzdWJ0cmFjdCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICBzZWxmLmFkanVzdERhdGUoJ2FkZCcsIDcpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENoYW5nZSA9IGUgPT4ge1xuICAgICAgbGV0IGRhdGVcblxuICAgICAgaWYgKGUuZmlyZWRCeSA9PT0gc2VsZikgcmV0dXJuXG5cbiAgICAgIGlmIChvcHRzLnBhcnNlKSB7XG4gICAgICAgIGRhdGUgPSBvcHRzLnBhcnNlKG9wdHMuZmllbGQudmFsdWUsIG9wdHMuZm9ybWF0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUucGFyc2Uob3B0cy5maWVsZC52YWx1ZSkpXG4gICAgICB9XG5cbiAgICAgIGlmIChpc0RhdGUoZGF0ZSkpIHNlbGYuc2V0RGF0ZShkYXRlKVxuICAgICAgaWYgKCFzZWxmLl92KSBzZWxmLnNob3coKVxuICAgIH1cblxuICAgIHNlbGYuX29uSW5wdXRGb2N1cyA9ICgpID0+IHtcbiAgICAgIHNlbGYuc2hvdygpXG4gICAgfVxuXG4gICAgc2VsZi5fb25JbnB1dENsaWNrID0gKCkgPT4ge1xuICAgICAgc2VsZi5zaG93KClcbiAgICB9XG5cbiAgICBzZWxmLl9vbklucHV0Qmx1ciA9ICgpID0+IHtcbiAgICAgIGxldCBwRWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhwRWwsICdkYXRlcGlja2VyJykpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKHBFbCA9IHBFbC5wYXJlbnROb2RlKSlcblxuICAgICAgaWYgKCFzZWxmLl9jKSB7XG4gICAgICAgIHNlbGYuX2IgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyBzZWxmLmhpZGUoKVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICAgIHNlbGYuX2MgPSBmYWxzZVxuICAgIH1cblxuICAgIHNlbGYuX29uQ2xpY2sgPSBlID0+IHtcbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50XG4gICAgICBsZXQgcEVsID0gdGFyZ2V0XG5cbiAgICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKHBFbCwgJ2RhdGVwaWNrZXInKSB8fCBwRWwgPT09IG9wdHMudHJpZ2dlcikge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9IHdoaWxlICgocEVsID0gcEVsLnBhcmVudE5vZGUpKVxuICAgICAgaWYgKHNlbGYuX3YgJiYgdGFyZ2V0ICE9PSBvcHRzLnRyaWdnZXIgJiYgcEVsICE9PSBvcHRzLnRyaWdnZXIpIHNlbGYuaGlkZSgpXG4gICAgfVxuXG4gICAgc2VsZi5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc2VsZi5lbC5jbGFzc05hbWUgPSAnZGF0ZXBpY2tlcicgKyAob3B0cy5pc1JUTCA/ICcgaXMtcnRsJyA6ICcnKSArIChvcHRzLnRoZW1lID8gJyAnICsgb3B0cy50aGVtZSA6ICcnKVxuXG4gICAgYWRkRXZlbnQoc2VsZi5lbCwgJ21vdXNlZG93bicsIHNlbGYuX29uTW91c2VEb3duLCB0cnVlKVxuICAgIGFkZEV2ZW50KHNlbGYuZWwsICdtb3VzZW92ZXInLCBzZWxmLl9vbk1vdXNlT3ZlciwgdHJ1ZSlcbiAgICBhZGRFdmVudChzZWxmLmVsLCAnbW91c2VsZWF2ZScsIHNlbGYuX29uTW91c2VMZWF2ZSwgdHJ1ZSlcbiAgICBhZGRFdmVudChzZWxmLmVsLCAndG91Y2hlbmQnLCBzZWxmLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICBhZGRFdmVudChzZWxmLmVsLCAnY2hhbmdlJywgc2VsZi5fb25DaGFuZ2UpXG4gICAgYWRkRXZlbnQoZG9jdW1lbnQsICdrZXlkb3duJywgc2VsZi5fb25LZXlDaGFuZ2UpXG5cbiAgICBpZiAob3B0cy5maWVsZCkge1xuICAgICAgaWYgKG9wdHMuY29udGFpbmVyKSB7XG4gICAgICAgIG9wdHMuY29udGFpbmVyLmFwcGVuZENoaWxkKHNlbGYuZWwpXG4gICAgICB9IGVsc2UgaWYgKG9wdHMuYm91bmQpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzZWxmLmVsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0cy5maWVsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzZWxmLmVsLCBvcHRzLmZpZWxkLm5leHRTaWJsaW5nKVxuICAgICAgfVxuICAgICAgYWRkRXZlbnQob3B0cy5maWVsZCwgJ2NoYW5nZScsIHNlbGYuX29uSW5wdXRDaGFuZ2UpXG5cbiAgICAgIGlmICghb3B0cy5kZWZhdWx0RGF0ZSkge1xuICAgICAgICBvcHRzLmRlZmF1bHREYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShvcHRzLmZpZWxkLnZhbHVlKSlcbiAgICAgICAgb3B0cy5zZXREZWZhdWx0RGF0ZSA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkZWZEYXRlID0gb3B0cy5kZWZhdWx0RGF0ZVxuXG4gICAgaWYgKGlzRGF0ZShkZWZEYXRlKSkge1xuICAgICAgaWYgKG9wdHMuc2V0RGVmYXVsdERhdGUpIHtcbiAgICAgICAgc2VsZi5zZXREYXRlKGRlZkRhdGUsIHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmdvdG9EYXRlKGRlZkRhdGUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZ290b0RhdGUobmV3IERhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHNlbGYuZWwuY2xhc3NOYW1lICs9ICcgaXMtYm91bmQnXG4gICAgICBhZGRFdmVudChvcHRzLnRyaWdnZXIsICdjbGljaycsIHNlbGYuX29uSW5wdXRDbGljaylcbiAgICAgIGFkZEV2ZW50KG9wdHMudHJpZ2dlciwgJ2ZvY3VzJywgc2VsZi5fb25JbnB1dEZvY3VzKVxuICAgICAgYWRkRXZlbnQob3B0cy50cmlnZ2VyLCAnYmx1cicsIHNlbGYuX29uSW5wdXRCbHVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3coKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBwdWJsaWMgUGxhaW5QaWNrZXIgQVBJXG4gICAqL1xuICBQbGFpblBpY2tlci5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogY29uZmlndXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKi9cbiAgICBjb25maWc6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAoIXRoaXMuX28pIHRoaXMuX28gPSBleHRlbmQoe30sIGRlZmF1bHRzLCB0cnVlKVxuXG4gICAgICBjb25zdCBvcHRzID0gZXh0ZW5kKHRoaXMuX28sIG9wdGlvbnMsIHRydWUpXG5cbiAgICAgIG9wdHMuaXNSVEwgPSAhIW9wdHMuaXNSVExcblxuICAgICAgb3B0cy5maWVsZCA9IG9wdHMuZmllbGQgJiYgb3B0cy5maWVsZC5ub2RlTmFtZSA/IG9wdHMuZmllbGQgOiBudWxsXG5cbiAgICAgIG9wdHMudGhlbWUgPSB0eXBlb2Ygb3B0cy50aGVtZSA9PT0gJ3N0cmluZycgJiYgb3B0cy50aGVtZSA/IG9wdHMudGhlbWUgOiBudWxsXG5cbiAgICAgIG9wdHMuYm91bmQgPSAhIShvcHRzLmJvdW5kICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpZWxkICYmIG9wdHMuYm91bmQgOiBvcHRzLmZpZWxkKVxuXG4gICAgICBvcHRzLnRyaWdnZXIgPSBvcHRzLnRyaWdnZXIgJiYgb3B0cy50cmlnZ2VyLm5vZGVOYW1lID8gb3B0cy50cmlnZ2VyIDogb3B0cy5maWVsZFxuXG4gICAgICBvcHRzLmRpc2FibGVXZWVrZW5kcyA9ICEhb3B0cy5kaXNhYmxlV2Vla2VuZHNcblxuICAgICAgb3B0cy5kaXNhYmxlRGF5Rm4gPSB0eXBlb2Ygb3B0cy5kaXNhYmxlRGF5Rm4gPT09ICdmdW5jdGlvbicgPyBvcHRzLmRpc2FibGVEYXlGbiA6IG51bGxcblxuICAgICAgY29uc3Qgbm9tID0gcGFyc2VJbnQob3B0cy5udW1iZXJPZk1vbnRocywgMTApIHx8IDFcbiAgICAgIG9wdHMubnVtYmVyT2ZNb250aHMgPSBub20gPiA0ID8gNCA6IG5vbVxuXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1pbkRhdGUpKSBvcHRzLm1pbkRhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAoIWlzRGF0ZShvcHRzLm1heERhdGUpKSBvcHRzLm1heERhdGUgPSBmYWxzZVxuXG4gICAgICBpZiAob3B0cy5taW5EYXRlICYmIG9wdHMubWF4RGF0ZSAmJiBvcHRzLm1heERhdGUgPCBvcHRzLm1pbkRhdGUpIG9wdHMubWF4RGF0ZSA9IG9wdHMubWluRGF0ZSA9IGZhbHNlXG5cbiAgICAgIGlmIChvcHRzLm1pbkRhdGUpIHRoaXMuc2V0TWluRGF0ZShvcHRzLm1pbkRhdGUpXG5cbiAgICAgIGlmIChvcHRzLm1heERhdGUpIHRoaXMuc2V0TWF4RGF0ZShvcHRzLm1heERhdGUpXG5cbiAgICAgIGlmIChpc0FycmF5KG9wdHMueWVhclJhbmdlKSkge1xuICAgICAgICBjb25zdCBmYWxsYmFjayA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSAtIDEwXG4gICAgICAgIG9wdHMueWVhclJhbmdlWzBdID0gcGFyc2VJbnQob3B0cy55ZWFyUmFuZ2VbMF0sIDEwKSB8fCBmYWxsYmFja1xuICAgICAgICBvcHRzLnllYXJSYW5nZVsxXSA9IHBhcnNlSW50KG9wdHMueWVhclJhbmdlWzFdLCAxMCkgfHwgZmFsbGJhY2tcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdHMueWVhclJhbmdlID0gTWF0aC5hYnMocGFyc2VJbnQob3B0cy55ZWFyUmFuZ2UsIDEwKSkgfHwgZGVmYXVsdHMueWVhclJhbmdlXG4gICAgICAgIGlmIChvcHRzLnllYXJSYW5nZSA+IDEwMCkge1xuICAgICAgICAgIG9wdHMueWVhclJhbmdlID0gMTAwXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9wdHNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgZm9ybWF0dGVkIHN0cmluZyBvZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gKHVzaW5nIE1vbWVudC5qcyBpZiBhdmFpbGFibGUpXG4gICAgICovXG4gICAgLy8gdG9TdHJpbmc6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAvLyAgIGZvcm1hdCA9IGZvcm1hdCB8fCB0aGlzLl9vLmZvcm1hdFxuICAgIC8vICAgaWYgKCFpc0RhdGUodGhpcy5fZCkpIHtcbiAgICAvLyAgICAgcmV0dXJuICcnXG4gICAgLy8gICB9XG5cbiAgICAvLyAgIGlmICh0aGlzLl9vLnRvU3RyaW5nKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuX28pXG4gICAgLy8gICAgIHJldHVybiB0aGlzLl9vLnRvU3RyaW5nKHRoaXMuX2QsIGZvcm1hdClcbiAgICAvLyAgIH1cblxuICAgIC8vICAgcmV0dXJuIHRoaXMuX2QudG9EYXRlU3RyaW5nKClcbiAgICAvLyB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGEgRGF0ZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICovXG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzRGF0ZSh0aGlzLl9kKSA/IG5ldyBEYXRlKHRoaXMuX2QuZ2V0VGltZSgpKSA6IG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uIChkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG5cbiAgICAgIGlmICghZGF0ZSkge1xuICAgICAgICBzZWxmLl9kID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgICAgc2VsZi5fby5maWVsZC52YWx1ZSA9ICcnXG4gICAgICAgICAgZmlyZUV2ZW50KHNlbGYuX28uZmllbGQsICdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmLmRyYXcoKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGUgPT09ICdzdHJpbmcnKSBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSlcblxuICAgICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHJldHVyblxuXG4gICAgICBjb25zdCBtaW4gPSBzZWxmLl9vLm1pbkRhdGVcbiAgICAgIGNvbnN0IG1heCA9IHNlbGYuX28ubWF4RGF0ZVxuXG4gICAgICBpZiAoaXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xuICAgICAgICBkYXRlID0gbWluXG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcbiAgICAgICAgZGF0ZSA9IG1heFxuICAgICAgfVxuXG4gICAgICBzZWxmLl9kID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBzZXRUb1N0YXJ0T2ZEYXkoc2VsZi5fZClcbiAgICAgIHNlbGYuZ290b0RhdGUoc2VsZi5fZClcblxuICAgICAgbGV0IHN1cGVyQXJyID0gW11cblxuICAgICAgc2VsZi5kYXRlUmFuZ2VBcnIuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICBsZXQgeXl5eSA9IGUuZ2V0RnVsbFllYXIoKVxuICAgICAgICBsZXQgbW0gPSB6ZXJvUGFkZGluZyhlLmdldE1vbnRoKCkgKyAxKVxuICAgICAgICBsZXQgZGQgPSB6ZXJvUGFkZGluZyhlLmdldERhdGUoKSlcbiAgICAgICAgbGV0IHl5eXltbWRkID0geXl5eSArICcvJyArIG1tICsgJy8nICsgZGRcbiAgICAgICAgc3VwZXJBcnIucHVzaCh5eXl5bW1kZClcbiAgICAgIH0pXG4gICAgICBjb25zb2xlLmxvZyhzdXBlckFycilcblxuICAgICAgaWYgKHNlbGYuX28uZmllbGQpIHtcbiAgICAgICAgaWYgKHNlbGYuX28ucmFuZ2VTZWxlY3QpIHtcbiAgICAgICAgICBzZWxmLl9vLmZpZWxkLnZhbHVlID0gc3VwZXJBcnIuam9pbignIC0gJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLl9vLmZpZWxkLnZhbHVlID0gc2VsZi50b1N0cmluZygpXG4gICAgICAgICAgZmlyZUV2ZW50KHNlbGYuX28uZmllbGQsICdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBmaXJlZEJ5OiBzZWxmXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXByZXZlbnRPblNlbGVjdCAmJiB0eXBlb2Ygc2VsZi5fby5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzZWxmLl9vLm9uU2VsZWN0LmNhbGwoc2VsZiwgc2VsZi5nZXREYXRlKCkpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZGF0ZVxuICAgICAqL1xuICAgIGdvdG9EYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgbGV0IG5ld0NhbGVuZGFyID0gdHJ1ZVxuXG4gICAgICBpZiAoIWlzRGF0ZShkYXRlKSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpXG4gICAgICAgIGNvbnN0IGxhc3RWaXNpYmxlRGF0ZSA9IG5ldyBEYXRlKHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLCAxKVxuICAgICAgICBjb25zdCB2aXNpYmxlRGF0ZSA9IGRhdGUuZ2V0VGltZSgpXG4gICAgICAgIC8vIGdldCB0aGUgZW5kIG9mIHRoZSBtb250aFxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0TW9udGgobGFzdFZpc2libGVEYXRlLmdldE1vbnRoKCkgKyAxKVxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0RGF0ZShsYXN0VmlzaWJsZURhdGUuZ2V0RGF0ZSgpIC0gMSlcbiAgICAgICAgbmV3Q2FsZW5kYXIgPSB2aXNpYmxlRGF0ZSA8IGZpcnN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIHx8IGxhc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgPCB2aXNpYmxlRGF0ZVxuICAgICAgfVxuXG4gICAgICBpZiAobmV3Q2FsZW5kYXIpIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnMgPSBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbW9udGg6IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICAgIHllYXI6IGRhdGUuZ2V0RnVsbFllYXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgICBpZiAodGhpcy5fby5tYWluQ2FsZW5kYXIgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCArPSAxIC0gdGhpcy5fby5udW1iZXJPZk1vbnRoc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgYWRqdXN0RGF0ZTogZnVuY3Rpb24gKHNpZ24sIGRheXMpIHtcbiAgICAgIGNvbnN0IGRheSA9IHRoaXMuZ2V0RGF0ZSgpIHx8IG5ldyBEYXRlKClcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBwYXJzZUludChkYXlzKSAqIDI0ICogNjAgKiA2MCAqIDEwMDBcblxuICAgICAgbGV0IG5ld0RheVxuXG4gICAgICBpZiAoc2lnbiA9PT0gJ2FkZCcpIHtcbiAgICAgICAgbmV3RGF5ID0gbmV3IERhdGUoZGF5LnZhbHVlT2YoKSArIGRpZmZlcmVuY2UpXG4gICAgICB9IGVsc2UgaWYgKHNpZ24gPT09ICdzdWJ0cmFjdCcpIHtcbiAgICAgICAgbmV3RGF5ID0gbmV3IERhdGUoZGF5LnZhbHVlT2YoKSAtIGRpZmZlcmVuY2UpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0RGF0ZShuZXdEYXkpXG4gICAgfSxcblxuICAgIGFkanVzdENhbGVuZGFyczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGNcblxuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSBhZGp1c3RDYWxlbmRhcih0aGlzLmNhbGVuZGFyc1swXSlcbiAgICAgIGZvciAoYyA9IDE7IGMgPCB0aGlzLl9vLm51bWJlck9mTW9udGhzOyBjKyspIHtcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbY10gPSBhZGp1c3RDYWxlbmRhcih7XG4gICAgICAgICAgbW9udGg6IHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoICsgYyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmNhbGVuZGFyc1swXS55ZWFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBnb3RvVG9kYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuZ290b0RhdGUobmV3IERhdGUoKSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBtb250aCAoemVyby1pbmRleCwgZS5nLiAwOiBKYW51YXJ5KVxuICAgICAqL1xuICAgIGdvdG9Nb250aDogZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgICBpZiAoIWlzTmFOKG1vbnRoKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCA9IHBhcnNlSW50KG1vbnRoLCAxMClcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBuZXh0TW9udGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoKytcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICB9LFxuXG4gICAgcHJldk1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aC0tXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZnVsbCB5ZWFyIChlLmcuIFwiMjAxMlwiKVxuICAgICAqL1xuICAgIGdvdG9ZZWFyOiBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgaWYgKCFpc05hTih5ZWFyKSkge1xuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS55ZWFyID0gcGFyc2VJbnQoeWVhciwgMTApXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2hhbmdlIHRoZSBtaW5EYXRlXG4gICAgICovXG4gICAgc2V0TWluRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHNldFRvU3RhcnRPZkRheSh2YWx1ZSlcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5fby5taW5ZZWFyID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLl9vLm1pbk1vbnRoID0gdmFsdWUuZ2V0TW9udGgoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fby5taW5EYXRlID0gZGVmYXVsdHMubWluRGF0ZVxuICAgICAgICB0aGlzLl9vLm1pblllYXIgPSBkZWZhdWx0cy5taW5ZZWFyXG4gICAgICAgIHRoaXMuX28ubWluTW9udGggPSBkZWZhdWx0cy5taW5Nb250aFxuICAgICAgICB0aGlzLl9vLnN0YXJ0UmFuZ2UgPSBkZWZhdWx0cy5zdGFydFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZSB0aGUgbWF4RGF0ZVxuICAgICAqL1xuICAgIHNldE1heERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBzZXRUb1N0YXJ0T2ZEYXkodmFsdWUpXG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuX28ubWF4WWVhciA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgICAgICAgdGhpcy5fby5tYXhNb250aCA9IHZhbHVlLmdldE1vbnRoKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX28ubWF4RGF0ZSA9IGRlZmF1bHRzLm1heERhdGVcbiAgICAgICAgdGhpcy5fby5tYXhZZWFyID0gZGVmYXVsdHMubWF4WWVhclxuICAgICAgICB0aGlzLl9vLm1heE1vbnRoID0gZGVmYXVsdHMubWF4TW9udGhcbiAgICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IGRlZmF1bHRzLmVuZFJhbmdlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHNldFN0YXJ0UmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5zdGFydFJhbmdlID0gdmFsdWVcbiAgICB9LFxuXG4gICAgc2V0RW5kUmFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fby5lbmRSYW5nZSA9IHZhbHVlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlZnJlc2ggdGhlIEhUTUxcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbiAoZm9yY2UpIHtcbiAgICAgIGlmICghdGhpcy5fdiAmJiAhZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vXG4gICAgICBjb25zdCBtaW5ZZWFyID0gb3B0cy5taW5ZZWFyXG4gICAgICBjb25zdCBtYXhZZWFyID0gb3B0cy5tYXhZZWFyXG4gICAgICBjb25zdCBtaW5Nb250aCA9IG9wdHMubWluTW9udGhcbiAgICAgIGNvbnN0IG1heE1vbnRoID0gb3B0cy5tYXhNb250aFxuICAgICAgbGV0IGh0bWwgPSAnJ1xuICAgICAgbGV0IHJhbmRJZFxuXG4gICAgICBpZiAodGhpcy5feSA8PSBtaW5ZZWFyKSB7XG4gICAgICAgIHRoaXMuX3kgPSBtaW5ZZWFyXG4gICAgICAgIGlmICghaXNOYU4obWluTW9udGgpICYmIHRoaXMuX20gPCBtaW5Nb250aCkge1xuICAgICAgICAgIHRoaXMuX20gPSBtaW5Nb250aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5feSA+PSBtYXhZZWFyKSB7XG4gICAgICAgIHRoaXMuX3kgPSBtYXhZZWFyXG4gICAgICAgIGlmICghaXNOYU4obWF4TW9udGgpICYmIHRoaXMuX20gPiBtYXhNb250aCkge1xuICAgICAgICAgIHRoaXMuX20gPSBtYXhNb250aFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJhbmRJZCA9ICdkYXRlcGlja2VyX190aXRsZS0nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXpdKy9nLCAnJykuc3Vic3RyKDAsIDIpXG5cbiAgICAgIGxldCBjXG4gICAgICBmb3IgKGMgPSAwOyBjIDwgb3B0cy5udW1iZXJPZk1vbnRoczsgYysrKSB7XG4gICAgICAgIGh0bWwgKz1cbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJfX2xlbmRhclwiPicgK1xuICAgICAgICAgIHJlbmRlclRpdGxlKHRoaXMsIGMsIHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCB0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCByYW5kSWQpICtcbiAgICAgICAgICB0aGlzLnJlbmRlcih0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgcmFuZElkKSArXG4gICAgICAgICAgJzwvZGl2PidcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIGlmIChvcHRzLmJvdW5kKSB7XG4gICAgICAgIGlmIChvcHRzLmZpZWxkLnR5cGUgIT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBvcHRzLnRyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIH0sIDEpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vLm9uRHJhdyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vLm9uRHJhdyh0aGlzKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy5ib3VuZCkge1xuICAgICAgICAvLyBsZXQgdGhlIHNjcmVlbiByZWFkZXIgdXNlciBrbm93IHRvIHVzZSBhcnJvdyBrZXlzXG4gICAgICAgIG9wdHMuZmllbGQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ1VzZSB0aGUgYXJyb3cga2V5cyB0byBwaWNrIGEgZGF0ZScpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGFkanVzdFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5fby5jb250YWluZXIpIHJldHVyblxuXG4gICAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuX28udHJpZ2dlclxuICAgICAgbGV0IHBFbCA9IGZpZWxkXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZWwub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0XG4gICAgICBjb25zdCB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gICAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICBjb25zdCBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgbGV0IGxlZnRcbiAgICAgIGxldCB0b3BcblxuICAgICAgaWYgKHR5cGVvZiBmaWVsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3QgY2xpZW50UmVjdCA9IGZpZWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGxlZnQgPSBjbGllbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXRcbiAgICAgICAgdG9wID0gY2xpZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlZnQgPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICB0b3AgPSBwRWwub2Zmc2V0VG9wICsgcEVsLm9mZnNldEhlaWdodFxuICAgICAgICB3aGlsZSAoKHBFbCA9IHBFbC5vZmZzZXRQYXJlbnQpKSB7XG4gICAgICAgICAgbGVmdCArPSBwRWwub2Zmc2V0TGVmdFxuICAgICAgICAgIHRvcCArPSBwRWwub2Zmc2V0VG9wXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyBib3R0b20gJiBsZWZ0XG4gICAgICBpZiAoXG4gICAgICAgICh0aGlzLl9vLnJlcG9zaXRpb24gJiYgbGVmdCArIHdpZHRoID4gdmlld3BvcnRXaWR0aCkgfHxcbiAgICAgICAgKHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZigncmlnaHQnKSA+IC0xICYmIGxlZnQgLSB3aWR0aCArIGZpZWxkLm9mZnNldFdpZHRoID4gMClcbiAgICAgICkge1xuICAgICAgICBsZWZ0ID0gbGVmdCAtIHdpZHRoICsgZmllbGQub2Zmc2V0V2lkdGhcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgKHRoaXMuX28ucmVwb3NpdGlvbiAmJiB0b3AgKyBoZWlnaHQgPiB2aWV3cG9ydEhlaWdodCArIHNjcm9sbFRvcCkgfHxcbiAgICAgICAgKHRoaXMuX28ucG9zaXRpb24uaW5kZXhPZigndG9wJykgPiAtMSAmJiB0b3AgLSBoZWlnaHQgLSBmaWVsZC5vZmZzZXRIZWlnaHQgPiAwKVxuICAgICAgKSB7XG4gICAgICAgIHRvcCA9IHRvcCAtIGhlaWdodCAtIGZpZWxkLm9mZnNldEhlaWdodFxuICAgICAgfVxuXG4gICAgICB0aGlzLmVsLnN0eWxlLmxlZnQgPSBsZWZ0ICsgJ3B4J1xuICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSB0b3AgKyAncHgnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbmRlciBIVE1MIGZvciBhIHBhcnRpY3VsYXIgbW9udGhcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgcmFuZElkKSB7XG4gICAgICBjb25zdCBvcHRzID0gdGhpcy5fb1xuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgY29uc3QgZGF5cyA9IGdldERheXNJbk1vbnRoKHllYXIsIG1vbnRoKVxuICAgICAgbGV0IGJlZm9yZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKVxuICAgICAgbGV0IGRhdGEgPSBbXVxuICAgICAgbGV0IHJvdyA9IFtdXG5cbiAgICAgIHNldFRvU3RhcnRPZkRheShub3cpXG5cbiAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheVxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xuICAgICAgICAgIGJlZm9yZSArPSA3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJldmlvdXNNb250aCA9IG1vbnRoID09PSAwID8gMTEgOiBtb250aCAtIDFcbiAgICAgIGNvbnN0IG5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IDAgOiBtb250aCArIDFcbiAgICAgIGNvbnN0IHllYXJPZlByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IHllYXIgLSAxIDogeWVhclxuICAgICAgY29uc3QgeWVhck9mTmV4dE1vbnRoID0gbW9udGggPT09IDExID8geWVhciArIDEgOiB5ZWFyXG4gICAgICBjb25zdCBkYXlzSW5QcmV2aW91c01vbnRoID0gZ2V0RGF5c0luTW9udGgoeWVhck9mUHJldmlvdXNNb250aCwgcHJldmlvdXNNb250aClcbiAgICAgIGxldCBjZWxscyA9IGRheXMgKyBiZWZvcmVcbiAgICAgIGxldCBhZnRlciA9IGNlbGxzXG5cbiAgICAgIHdoaWxlIChhZnRlciA+IDcpIHtcbiAgICAgICAgYWZ0ZXIgLT0gN1xuICAgICAgfVxuXG4gICAgICBjZWxscyArPSA3IC0gYWZ0ZXJcbiAgICAgIGxldCBpc1dlZWtTZWxlY3RlZCA9IGZhbHNlXG4gICAgICBsZXQgaSwgclxuXG4gICAgICBmb3IgKGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEgKyAoaSAtIGJlZm9yZSkpXG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpc0RhdGUodGhpcy5fZCkgPyBjb21wYXJlRGF0ZXMoZGF5LCB0aGlzLl9kKSA6IGZhbHNlXG4gICAgICAgIGNvbnN0IGlzVG9kYXkgPSBjb21wYXJlRGF0ZXMoZGF5LCBub3cpXG4gICAgICAgIGNvbnN0IGhhc0V2ZW50ID0gb3B0cy5ldmVudHMuaW5kZXhPZihkYXkudG9EYXRlU3RyaW5nKCkpICE9PSAtMVxuICAgICAgICBjb25zdCBpc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IGRheXMgKyBiZWZvcmVcbiAgICAgICAgbGV0IGRheU51bWJlciA9IDEgKyAoaSAtIGJlZm9yZSlcbiAgICAgICAgbGV0IG1vbnRoTnVtYmVyID0gbW9udGhcbiAgICAgICAgbGV0IHllYXJOdW1iZXIgPSB5ZWFyXG4gICAgICAgIGNvbnN0IGlzU3RhcnRSYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBjb21wYXJlRGF0ZXMob3B0cy5zdGFydFJhbmdlLCBkYXkpXG4gICAgICAgIGNvbnN0IGlzRW5kUmFuZ2UgPSBvcHRzLmVuZFJhbmdlICYmIGNvbXBhcmVEYXRlcyhvcHRzLmVuZFJhbmdlLCBkYXkpXG4gICAgICAgIGNvbnN0IGlzSW5SYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBvcHRzLmVuZFJhbmdlICYmIG9wdHMuc3RhcnRSYW5nZSA8IGRheSAmJiBkYXkgPCBvcHRzLmVuZFJhbmdlXG4gICAgICAgIGNvbnN0IGlzRGlzYWJsZWQgPVxuICAgICAgICAgIChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxuICAgICAgICAgIChvcHRzLm1heERhdGUgJiYgZGF5ID4gb3B0cy5tYXhEYXRlKSB8fFxuICAgICAgICAgIChvcHRzLmRpc2FibGVXZWVrZW5kcyAmJiBpc1dlZWtlbmQoZGF5KSkgfHxcbiAgICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4oZGF5KSlcblxuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGlmIChpIDwgYmVmb3JlKSB7XG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlzSW5QcmV2aW91c01vbnRoICsgZGF5TnVtYmVyXG4gICAgICAgICAgICBtb250aE51bWJlciA9IHByZXZpb3VzTW9udGhcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZQcmV2aW91c01vbnRoXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRheU51bWJlciA9IGRheU51bWJlciAtIGRheXNcbiAgICAgICAgICAgIG1vbnRoTnVtYmVyID0gbmV4dE1vbnRoXG4gICAgICAgICAgICB5ZWFyTnVtYmVyID0geWVhck9mTmV4dE1vbnRoXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF5Q29uZmlnID0ge1xuICAgICAgICAgIGRheTogZGF5TnVtYmVyLFxuICAgICAgICAgIG1vbnRoOiBtb250aE51bWJlcixcbiAgICAgICAgICB5ZWFyOiB5ZWFyTnVtYmVyLFxuICAgICAgICAgIGhhc0V2ZW50OiBoYXNFdmVudCxcbiAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXksXG4gICAgICAgICAgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCxcbiAgICAgICAgICBpc0VtcHR5OiBpc0VtcHR5LFxuICAgICAgICAgIGlzU3RhcnRSYW5nZTogaXNTdGFydFJhbmdlLFxuICAgICAgICAgIGlzRW5kUmFuZ2U6IGlzRW5kUmFuZ2UsXG4gICAgICAgICAgaXNJblJhbmdlOiBpc0luUmFuZ2UsXG4gICAgICAgICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5zaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzLFxuICAgICAgICAgIGVuYWJsZVNlbGVjdGlvbkRheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5lbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHNcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRzLnBpY2tXaG9sZVdlZWsgJiYgaXNTZWxlY3RlZCkge1xuICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgcm93LnB1c2gocmVuZGVyRGF5KGRheUNvbmZpZykpXG5cbiAgICAgICAgaWYgKCsrciA9PT0gNykge1xuICAgICAgICAgIGlmIChvcHRzLnNob3dXZWVrTnVtYmVyKSB7XG4gICAgICAgICAgICByb3cudW5zaGlmdChyZW5kZXJXZWVrKGkgLSBiZWZvcmUsIG1vbnRoLCB5ZWFyKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgZGF0YS5wdXNoKHJlbmRlclJvdyhyb3csIG9wdHMuaXNSVEwsIG9wdHMucGlja1dob2xlV2VlaywgaXNXZWVrU2VsZWN0ZWQpKVxuICAgICAgICAgIHJvdyA9IFtdXG4gICAgICAgICAgciA9IDBcbiAgICAgICAgICBpc1dlZWtTZWxlY3RlZCA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJUYWJsZShvcHRzLCBkYXRhLCByYW5kSWQpXG4gICAgfSxcblxuICAgIGlzVmlzaWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHRoaXMuX3YgPSB0cnVlXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICAgIHJlbW92ZUNsYXNzKHRoaXMuZWwsICdpcy1oaWRkZW4nKVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIGFkZEV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fby5vbk9wZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9vLm9uT3Blbi5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdiA9IHRoaXMuX3ZcbiAgICAgIGlmICh2ICE9PSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWwuc3R5bGUucG9zaXRpb24gPSAnc3RhdGljJyAvLyByZXNldFxuICAgICAgICB0aGlzLmVsLnN0eWxlLmxlZnQgPSAnYXV0bydcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSAnYXV0bydcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5lbCwgJ2lzLWhpZGRlbicpXG4gICAgICAgIHRoaXMuX3YgPSBmYWxzZVxuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB0aGlzLl9vLm9uQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9vLm9uQ2xvc2UuY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24sIHRydWUpXG4gICAgICByZW1vdmVFdmVudCh0aGlzLmVsLCAndG91Y2hlbmQnLCB0aGlzLl9vbk1vdXNlRG93biwgdHJ1ZSlcbiAgICAgIHJlbW92ZUV2ZW50KHRoaXMuZWwsICdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgICAgIGlmICh0aGlzLl9vLmZpZWxkKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28uZmllbGQsICdjaGFuZ2UnLCB0aGlzLl9vbklucHV0Q2hhbmdlKVxuICAgICAgICBpZiAodGhpcy5fby5ib3VuZCkge1xuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2NsaWNrJywgdGhpcy5fb25JbnB1dENsaWNrKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2ZvY3VzJywgdGhpcy5fb25JbnB1dEZvY3VzKVxuICAgICAgICAgIHJlbW92ZUV2ZW50KHRoaXMuX28udHJpZ2dlciwgJ2JsdXInLCB0aGlzLl9vbklucHV0Qmx1cilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZWwucGFyZW50Tm9kZSkge1xuICAgICAgICB0aGlzLmVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgd2luZG93LlBsYWluUGlja2VyID0gUGxhaW5QaWNrZXJcbn0pKClcbiJdLCJuYW1lcyI6WyJkb2N1bWVudCIsIndpbmRvdyIsImFkZEV2ZW50IiwiZWwiLCJlIiwiY2FsbGJhY2siLCJjYXB0dXJlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInRyaW0iLCJzdHIiLCJyZXBsYWNlIiwiaGFzQ2xhc3MiLCJjbiIsImNsYXNzTmFtZSIsImluZGV4T2YiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaXNBcnJheSIsInRlc3QiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJvYmoiLCJpc0RhdGUiLCJpc05hTiIsImdldFRpbWUiLCJ6ZXJvUGFkZGluZyIsIm51bSIsInNsaWNlIiwiaXNXZWVrZW5kIiwiZGF5IiwiZGF0ZSIsImdldERheSIsInByZXZBbGwiLCJyZXN1bHQiLCJlbGVtZW50IiwicHJldmlvdXNFbGVtZW50U2libGluZyIsInB1c2giLCJnZXRQYXJlbnRzIiwicGFyZW50U2VsZWN0b3IiLCJ1bmRlZmluZWQiLCJwYXJlbnRzIiwicCIsInBhcmVudE5vZGUiLCJvIiwiaXNMZWFwWWVhciIsInllYXIiLCJnZXREYXlzSW5Nb250aCIsIm1vbnRoIiwic2V0VG9TdGFydE9mRGF5Iiwic2V0SG91cnMiLCJjb21wYXJlRGF0ZXMiLCJhIiwiYiIsImV4dGVuZCIsInRvIiwiZnJvbSIsIm92ZXJ3cml0ZSIsInByb3AiLCJoYXNQcm9wIiwibm9kZU5hbWUiLCJEYXRlIiwiZmlyZUV2ZW50IiwiZXZlbnROYW1lIiwiZGF0YSIsImV2IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiY3JlYXRlRXZlbnRPYmplY3QiLCJhZGp1c3RDYWxlbmRhciIsImNhbGVuZGFyIiwiTWF0aCIsImNlaWwiLCJhYnMiLCJmbG9vciIsImRlZmF1bHRzIiwicmVuZGVyRGF5TmFtZSIsIm9wdHMiLCJhYmJyIiwiZmlyc3REYXkiLCJpMThuIiwid2Vla2RheXNTaG9ydCIsIndlZWtkYXlzIiwicmVuZGVyRGF5IiwiYXJyIiwiYXJpYVNlbGVjdGVkIiwiaXNFbXB0eSIsInNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMiLCJlbmFibGVTZWxlY3Rpb25EYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHMiLCJpc0Rpc2FibGVkIiwiaXNUb2RheSIsImlzU2VsZWN0ZWQiLCJoYXNFdmVudCIsImlzSW5SYW5nZSIsImlzU3RhcnRSYW5nZSIsImlzRW5kUmFuZ2UiLCJqb2luIiwicmVuZGVyV2VlayIsImQiLCJtIiwieSIsIm9uZWphbiIsIndlZWtOdW0iLCJyZW5kZXJSb3ciLCJkYXlzIiwiaXNSVEwiLCJwaWNrV2hvbGVXZWVrIiwiaXNSb3dTZWxlY3RlZCIsInJldmVyc2UiLCJyZW5kZXJCb2R5Iiwicm93cyIsInJlbmRlckhlYWQiLCJpIiwic2hvd1dlZWtOdW1iZXIiLCJyZW5kZXJUaXRsZSIsImluc3RhbmNlIiwiYyIsInJlZlllYXIiLCJyYW5kSWQiLCJqIiwiX28iLCJpc01pblllYXIiLCJtaW5ZZWFyIiwiaXNNYXhZZWFyIiwibWF4WWVhciIsImh0bWwiLCJwcmV2IiwibmV4dCIsIm1pbk1vbnRoIiwibWF4TW9udGgiLCJtb250aHMiLCJtb250aEh0bWwiLCJ5ZWFyUmFuZ2UiLCJ5ZWFySHRtbCIsInllYXJTdWZmaXgiLCJzaG93TW9udGhBZnRlclllYXIiLCJwcmV2aW91c01vbnRoIiwibnVtYmVyT2ZNb250aHMiLCJuZXh0TW9udGgiLCJyZW5kZXJUYWJsZSIsIlBsYWluUGlja2VyIiwib3B0aW9ucyIsInNlbGYiLCJjb25maWciLCJkZWZPcHRzTWluRGF0ZSIsIm1pbkRhdGUiLCJkYXRlUmFuZ2VBcnIiLCJkYXRlUmFuZ2VTZWxlY3RlZEFyciIsIl9vbk1vdXNlRG93biIsIl92IiwiZXZlbnQiLCJ0YXJnZXQiLCJzcmNFbGVtZW50IiwiYm91bmQiLCJyYW5nZVNlbGVjdCIsInNlbGVjdGVkRGF0ZSIsImdldEF0dHJpYnV0ZSIsInNldE1pbkRhdGUiLCJsZW5ndGgiLCJmb3JFYWNoIiwic2V0RGF0ZSIsImJsdXJGaWVsZE9uU2VsZWN0IiwiZmllbGQiLCJibHVyIiwiaGlkZSIsInByZXZNb250aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJfYyIsIl9vbk1vdXNlT3ZlciIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJub2RlIiwicGFyZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImxvZyIsInRhYmxlT2ZMYXN0IiwiVFJGIiwicXVlcnlTZWxlY3RvciIsIlRSRk9mTGFzdCIsInByZXZBbGxUciIsInRkcyIsImVuYWJsZVRkIiwicHJldlRyIiwiX29uTW91c2VMZWF2ZSIsIl9vbkNoYW5nZSIsImdvdG9Nb250aCIsInZhbHVlIiwiZ290b1llYXIiLCJfb25LZXlDaGFuZ2UiLCJpc1Zpc2libGUiLCJrZXlDb2RlIiwiYWRqdXN0RGF0ZSIsIl9vbklucHV0Q2hhbmdlIiwiZmlyZWRCeSIsInBhcnNlIiwiZm9ybWF0Iiwic2hvdyIsIl9vbklucHV0Rm9jdXMiLCJfb25JbnB1dENsaWNrIiwiX29uSW5wdXRCbHVyIiwicEVsIiwiYWN0aXZlRWxlbWVudCIsIl9iIiwic2V0VGltZW91dCIsIl9vbkNsaWNrIiwidHJpZ2dlciIsImNyZWF0ZUVsZW1lbnQiLCJ0aGVtZSIsImNvbnRhaW5lciIsImFwcGVuZENoaWxkIiwiYm9keSIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiZGVmYXVsdERhdGUiLCJzZXREZWZhdWx0RGF0ZSIsImRlZkRhdGUiLCJnb3RvRGF0ZSIsImRpc2FibGVXZWVrZW5kcyIsImRpc2FibGVEYXlGbiIsIm5vbSIsInBhcnNlSW50IiwibWF4RGF0ZSIsInNldE1heERhdGUiLCJmYWxsYmFjayIsImdldEZ1bGxZZWFyIiwiX2QiLCJwcmV2ZW50T25TZWxlY3QiLCJkcmF3IiwibWluIiwibWF4Iiwic3VwZXJBcnIiLCJ5eXl5IiwibW0iLCJnZXRNb250aCIsImRkIiwiZ2V0RGF0ZSIsInl5eXltbWRkIiwib25TZWxlY3QiLCJuZXdDYWxlbmRhciIsImNhbGVuZGFycyIsImZpcnN0VmlzaWJsZURhdGUiLCJsYXN0VmlzaWJsZURhdGUiLCJ2aXNpYmxlRGF0ZSIsInNldE1vbnRoIiwibWFpbkNhbGVuZGFyIiwiYWRqdXN0Q2FsZW5kYXJzIiwic2lnbiIsImRpZmZlcmVuY2UiLCJuZXdEYXkiLCJ2YWx1ZU9mIiwic3RhcnRSYW5nZSIsImVuZFJhbmdlIiwiZm9yY2UiLCJfeSIsIl9tIiwicmFuZG9tIiwic3Vic3RyIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwidHlwZSIsImZvY3VzIiwib25EcmF3Iiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJwb3NpdGlvbiIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudCIsImNsaWVudFdpZHRoIiwidmlld3BvcnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsInNjcm9sbFRvcCIsInBhZ2VZT2Zmc2V0IiwibGVmdCIsInRvcCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJwYWdlWE9mZnNldCIsImJvdHRvbSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRQYXJlbnQiLCJyZXBvc2l0aW9uIiwibm93IiwiYmVmb3JlIiwicm93IiwieWVhck9mUHJldmlvdXNNb250aCIsInllYXJPZk5leHRNb250aCIsImRheXNJblByZXZpb3VzTW9udGgiLCJjZWxscyIsImFmdGVyIiwiaXNXZWVrU2VsZWN0ZWQiLCJyIiwiZXZlbnRzIiwidG9EYXRlU3RyaW5nIiwiZGF5TnVtYmVyIiwibW9udGhOdW1iZXIiLCJ5ZWFyTnVtYmVyIiwiZGF5Q29uZmlnIiwidW5zaGlmdCIsImFkanVzdFBvc2l0aW9uIiwib25PcGVuIiwidiIsIm9uQ2xvc2UiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLEFBQUMsQ0FBQyxZQUFZOzs7O01BSU5BLFdBQVdDLE9BQU9ELFFBQXhCO01BQ01FLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxFQUFELEVBQUtDLENBQUwsRUFBUUMsUUFBUixFQUFrQkMsT0FBbEI7V0FBOEJILEdBQUdJLGdCQUFILENBQW9CSCxDQUFwQixFQUF1QkMsUUFBdkIsRUFBaUMsQ0FBQyxDQUFDQyxPQUFuQyxDQUE5QjtHQUFqQjs7TUFFTUUsY0FBYyxTQUFkQSxXQUFjLENBQUNMLEVBQUQsRUFBS0MsQ0FBTCxFQUFRQyxRQUFSLEVBQWtCQyxPQUFsQjtXQUE4QkgsR0FBR00sbUJBQUgsQ0FBdUJMLENB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
