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

                console.log(selectedDate);

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
          case 9:
            // tab
            if (self.hasKey && self._o.trigger) {
              self._o.trigger.focus();
              self.hasKey = false;
            }
            break;
          case 32: // space
          case 13:
            // enter

            // 矢印で選択候補を上書きし続けて setDate で表示
            // Enter で候補を Array に push

            if (opts.rangeSelect) {
              // selectable date range on single calendar
              var selectedDate = self._d;

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
              if (self.hasKey && !opts.container) {
                stopEvent();
                if (self._o.trigger) {
                  self._o.trigger.focus();
                  try {
                    self._o.trigger.select();
                  } catch (e) {} // trigger could be a button
                }
                console.log('Hiding because enter or space pressed');
                self.hide();
              }
            }
            break;
          case 27:
            // esc
            if (!opts.container) {
              stopEvent();
              console.log('Cancel because escape pressed');
              self.cancel();
            }
            break;
          case 37:
            // ←
            captureKey();
            self.adjustDate('subtract', 1);

            console.log(self._d);
            break;
          case 38:
            // ↑
            captureKey();
            self.adjustDate('subtract', 7);

            console.log(self._d);
            break;
          case 39:
            // →
            captureKey();
            self.adjustDate('add', 1);

            console.log(self._d);
            break;
          case 40:
            // ↓
            captureKey();
            self.adjustDate('add', 7);

            console.log(self._d);
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

      if (self._o.field) {
        if (self._o.rangeSelect) {
          var superArr = [];

          self.dateRangeArr.forEach(function (e) {
            var yyyy = e.getFullYear();
            var mm = zeroPadding(e.getMonth() + 1);
            var dd = zeroPadding(e.getDate());
            var yyyymmdd = yyyy + '/' + mm + '/' + dd;
            superArr.push(yyyymmdd);
          });

          self._o.field.value = superArr.join(' - ');
        } else {
          var yyyy = self._d.getFullYear();
          var mm = zeroPadding(self._d.getMonth() + 1);
          var dd = zeroPadding(self._d.getDate());
          var yyyymmdd = yyyy + '/' + mm + '/' + dd;
          self._o.field.value = yyyymmdd;
        }
        fireEvent(self._o.field, 'change', {
          firedBy: self
        });
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
//# sourceMappingURL=bundle.js.map
