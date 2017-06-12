(function () {
  /**
   * feature detection and helper functions
   */
  const document = window.document
  const addEvent = (el, e, callback, capture) => {
    el.addEventListener(e, callback, !!capture)
  }

  const removeEvent = (el, e, callback, capture) => {
    el.removeEventListener(e, callback, !!capture)
  }

  const trim = str => {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
  }

  const hasClass = (el, cn) => {
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1
  }

  const addClass = (el, cn) => {
    if (!hasClass(el, cn)) {
      el.className = (el.className === '') ? cn : el.className + ' ' + cn
    }
  }

  const removeClass = (el, cn) => {
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '))
  }

  const isArray = obj => {
    return (/Array/).test(Object.prototype.toString.call(obj))
  }

  const isDate = obj => {
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
  }

  const isWeekend = date => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const isLeapYear = year => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  const getDaysInMonth = (year, month) => {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  }

  const setToStartOfDay = date => {
    if (isDate(date)) date.setHours(0, 0, 0, 0)
  }

  const compareDates = (a, b) => {
    return a.getTime() === b.getTime()
  }

  const extend = (to, from, overwrite) => {
    let prop
    let hasProp

    for (prop in from) {
      hasProp = to[prop] !== undefined
      if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
        if (isDate(from[prop])) {
          if (overwrite) {
            to[prop] = new Date(from[prop].getTime())
          }
        } else if (isArray(from[prop])) {
          if (overwrite) {
            to[prop] = from[prop].slice(0)
          }
        } else {
          to[prop] = extend({}, from[prop], overwrite)
        }
      } else if (overwrite || !hasProp) {
        to[prop] = from[prop]
      }
    }
    return to
  }

  const fireEvent = (el, eventName, data) => {
    let ev

    if (document.createEvent) {
      ev = document.createEvent('HTMLEvents')
      ev.initEvent(eventName, true, false)
      ev = extend(ev, data)
      el.dispatchEvent(ev)
    } else if (document.createEventObject) {
      ev = document.createEventObject()
      ev = extend(ev, data)
      el.fireEvent('on' + eventName, ev)
    }
  }

  const adjustCalendar = calendar => {
    if (calendar.month < 0) {
      calendar.year -= Math.ceil(Math.abs(calendar.month) / 12)
      calendar.month += 12
    }
    if (calendar.month > 11) {
      calendar.year += Math.floor(Math.abs(calendar.month) / 12)
      calendar.month -= 12
    }
    return calendar
  }

  /**
   * defaults and localisation
   */
  const defaults = {

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
  }

  /**
   * templating functions to abstract HTML rendering
   */
  const renderDayName = (opts, day, abbr) => {
    day += opts.firstDay
    while (day >= 7) {
      day -= 7
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day]
  }

  const renderDay = opts => {
    let arr = []
    let ariaSelected = 'false'
    if (opts.isEmpty) {
      if (opts.showDaysInNextAndPreviousMonths) {
        arr.push('is-outside-current-month')

        if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
          arr.push('is-selection-disabled')
        }
      } else {
        return '<td class="is-empty"></td>'
      }
    }
    if (opts.isDisabled) {
      arr.push('is-disabled')
    }
    if (opts.isToday) {
      arr.push('is-today')
    }
    if (opts.isSelected) {
      arr.push('is-selected')
      ariaSelected = 'true'
    }
    if (opts.hasEvent) {
      arr.push('has-event')
    }
    if (opts.isInRange) {
      arr.push('is-inrange')
    }
    if (opts.isStartRange) {
      arr.push('is-startrange')
    }
    if (opts.isEndRange) {
      arr.push('is-endrange')
    }
    return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
        '<button class="datepicker__button datepicker__day" type="button" ' +
        'data-datepicker-year="' + opts.year + '" data-datepicker-month="' + opts.month + '" data-datepicker-day="' + opts.day + '">' +
        opts.day +
        '</button>' +
        '</td>'
  }

  const renderWeek = (d, m, y) => {
    const onejan = new Date(y, 0, 1)
    const weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay() + 1) / 7)
    return '<td class="datepicker__week">' + weekNum + '</td>'
  }

  const renderRow = (days, isRTL, pickWholeWeek, isRowSelected) => {
    return '<tr class="datepicker__row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>'
  }

  const renderBody = rows => {
    return '<tbody>' + rows.join('') + '</tbody>'
  }

  const renderHead = opts => {
    let i
    let arr = []
    if (opts.showWeekNumber) {
      arr.push('<th></th>')
    }
    for (i = 0; i < 7; i++) {
      arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>')
    }
    return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>'
  }

  const renderTitle = (instance, c, year, month, refYear, randId) => {
    let i
    let j
    let arr
    const opts = instance._o
    const isMinYear = year === opts.minYear
    const isMaxYear = year === opts.maxYear
    let html = '<div id="' + randId + '" class="datepicker__title" role="heading" aria-live="assertive">'

    let prev = true
    let next = true

    for (arr = [], i = 0; i < 12; i++) {
      arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
          (i === month ? ' selected="selected"' : '') +
          ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled="disabled"' : '') + '>' +
          opts.i18n.months[i] + '</option>')
    }

    const monthHtml = '<div class="datepicker__label">' + opts.i18n.months[month] + '<select class="datepicker__select datepicker__select-month" tabindex="-1">' + arr.join('') + '</select></div>'

    if (isArray(opts.yearRange)) {
      i = opts.yearRange[0]
      j = opts.yearRange[1] + 1
    } else {
      i = year - opts.yearRange
      j = 1 + year + opts.yearRange
    }

    for (arr = []; i < j && i <= opts.maxYear; i++) {
      if (i >= opts.minYear) {
        arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + (i) + '</option>')
      }
    }
    const yearHtml = '<div class="datepicker__label">' + year + opts.yearSuffix + '<select class="datepicker__select datepicker__select-year" tabindex="-1">' + arr.join('') + '</select></div>'

    if (opts.showMonthAfterYear) {
      html += yearHtml + monthHtml
    } else {
      html += monthHtml + yearHtml
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) {
      prev = false
    }

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
      next = false
    }

    if (c === 0) {
      html += '<button class="datepicker__prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>'
    }
    if (c === (instance._o.numberOfMonths - 1)) {
      html += '<button class="datepicker__next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>'
    }

    html += '</div>'

    return html
  }

  const renderTable = (opts, data, randId) => {
    return '<table cellpadding="0" cellspacing="0" class="datepicker__table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>'
  }

  /**
   * PlainPicker constructor
   */
  const PlainPicker = function (options) {
    const self = this
    const opts = self.config(options)
    self.dateRangeArr = []
    self.dateRangeSelectedArr = []

    self._onMouseDown = e => {
      if (!self._v) {
        return
      }
      e = e || window.event
      const target = e.target || e.srcElement
      if (!target) {
        return
      }

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'datepicker__button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          if (opts.bound) {
            setTimeout(() => {
              // selectable date range on single calendar
              if (opts.rangeSelect) {
                let selectedDate = new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day'))
                self.dateRangeArr.push(selectedDate)
                if (self.dateRangeArr.length > 2) self.dateRangeArr.shift()
                console.log(self.dateRangeArr)
                self.dateRangeArr.forEach(function (e) {
                  self.setDate(e)
                })
              } else {
                self.setDate(new Date(target.getAttribute('data-datepicker-year'), target.getAttribute('data-datepicker-month'), target.getAttribute('data-datepicker-day')))
                self.hide()
                if (opts.blurFieldOnSelect && opts.field) {
                  opts.field.blur()
                }
              }
            }, 100)
          }
        } else if (hasClass(target, 'datepicker__prev')) {
          self.prevMonth()
        } else if (hasClass(target, 'datepicker__next')) {
          self.nextMonth()
        }
      }
      if (!hasClass(target, 'datepicker__select')) {
        if (e.preventDefault) {
          e.preventDefault()
        } else {
          e.returnValue = false
          return false
        }
      } else {
        self._c = true
      }
    }

    // <select>
    self._onChange = e => {
      e = e || window.event
      const target = e.target || e.srcElement
      if (!target) {
        return
      }
      if (hasClass(target, 'datepicker__select-month')) {
        self.gotoMonth(target.value)
      } else if (hasClass(target, 'datepicker__select-year')) {
        self.gotoYear(target.value)
      }
    }

    self._onKeyChange = e => {
      e = e || window.event

      if (self.isVisible()) {
        switch (e.keyCode) {
          case 13:
          case 27:
            if (opts.field) {
              if (opts.rangeSelect) {
                console.log('rangeSelectable')
              } else {
                opts.field.blur()
              }
            }
            break
          case 37:
            e.preventDefault()
            self.adjustDate('subtract', 1)
            break
          case 38:
            self.adjustDate('subtract', 7)
            break
          case 39:
            self.adjustDate('add', 1)
            break
          case 40:
            self.adjustDate('add', 7)
            break
        }
      }
    }

    self._onInputChange = e => {
      let date

      if (e.firedBy === self) {
        return
      }
      if (opts.parse) {
        date = opts.parse(opts.field.value, opts.format)
      } else {
        date = new Date(Date.parse(opts.field.value))
      }
      if (isDate(date)) {
        self.setDate(date)
      }
      if (!self._v) {
        self.show()
      }
    }

    self._onInputFocus = () => {
      self.show()
    }

    self._onInputClick = () => {
      self.show()
    }

    self._onInputBlur = () => {
      let pEl = document.activeElement
      do {
        if (hasClass(pEl, 'datepicker')) {
          return
        }
      }
      while ((pEl = pEl.parentNode))

      if (!self._c) {
        self._b = setTimeout(() => {
          self.hide()
        }, 50)
      }
      self._c = false
    }

    self._onClick = e => {
      e = e || window.event
      const target = e.target || e.srcElement
      let pEl = target

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
        self.hide()
      }
    }

    self.el = document.createElement('div')
    self.el.className = 'datepicker' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '')

    addEvent(self.el, 'mousedown', self._onMouseDown, true)
    addEvent(self.el, 'touchend', self._onMouseDown, true)
    addEvent(self.el, 'change', self._onChange)
    addEvent(document, 'keydown', self._onKeyChange)

    if (opts.field) {
      if (opts.container) {
        opts.container.appendChild(self.el)
      } else if (opts.bound) {
        document.body.appendChild(self.el)
      } else {
        opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling)
      }
      addEvent(opts.field, 'change', self._onInputChange)

      if (!opts.defaultDate) {
        opts.defaultDate = new Date(Date.parse(opts.field.value))
        opts.setDefaultDate = true
      }
    }

    const defDate = opts.defaultDate

    if (isDate(defDate)) {
      if (opts.setDefaultDate) {
        self.setDate(defDate, true)
      } else {
        self.gotoDate(defDate)
      }
    } else {
      self.gotoDate(new Date())
    }

    if (opts.bound) {
      this.hide()
      self.el.className += ' is-bound'
      addEvent(opts.trigger, 'click', self._onInputClick)
      addEvent(opts.trigger, 'focus', self._onInputFocus)
      addEvent(opts.trigger, 'blur', self._onInputBlur)
    } else {
      this.show()
    }
  }

  /**
   * public PlainPicker API
   */
  PlainPicker.prototype = {

    /**
     * configure functionality
     */
    config: function (options) {
      if (!this._o) {
        this._o = extend({}, defaults, true)
      }

      const opts = extend(this._o, options, true)

      opts.isRTL = !!opts.isRTL

      opts.field = (opts.field && opts.field.nodeName) ? opts.field : null

      opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null

      opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field)

      opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field

      opts.disableWeekends = !!opts.disableWeekends

      opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null

      const nom = parseInt(opts.numberOfMonths, 10) || 1
      opts.numberOfMonths = nom > 4 ? 4 : nom

      if (!isDate(opts.minDate)) {
        opts.minDate = false
      }
      if (!isDate(opts.maxDate)) {
        opts.maxDate = false
      }
      if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
        opts.maxDate = opts.minDate = false
      }
      if (opts.minDate) {
        this.setMinDate(opts.minDate)
      }
      if (opts.maxDate) {
        this.setMaxDate(opts.maxDate)
      }

      if (isArray(opts.yearRange)) {
        const fallback = new Date().getFullYear() - 10
        opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback
        opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback
      } else {
        opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange
        if (opts.yearRange > 100) {
          opts.yearRange = 100
        }
      }

      return opts
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function (format) {
      format = format || this._o.format
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
      const self = this

      if (!date) {
        self._d = null

        if (this._o.field) {
          self._o.field.value = ''
          fireEvent(self._o.field, 'change', {
            firedBy: self
          })
        }

        return self.draw()
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date))
      }
      if (!isDate(date)) {
        return
      }

      const min = self._o.minDate
      const max = self._o.maxDate

      if (isDate(min) && date < min) {
        date = min
      } else if (isDate(max) && date > max) {
        date = max
      }

      self._d = new Date(date.getTime())
      setToStartOfDay(self._d)
      self.gotoDate(self._d)

      if (self._o.field) {
        self._o.field.value = self.toString()
        fireEvent(self._o.field, 'change', {
          firedBy: self
        })
      }
      if (!preventOnSelect && typeof self._o.onSelect === 'function') {
        self._o.onSelect.call(self, self.getDate())
      }

      if (self._o.rangeSelect) {
        let newArr = self.dateRangeArr.map(el => self.toString(el))
        console.log(newArr)
        self._o.field.value = newArr.join(' - ')
      }
    },

    /**
     * change view to a specific date
     */
    gotoDate: function (date) {
      let newCalendar = true

      if (!isDate(date)) {
        return
      }

      if (this.calendars) {
        const firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1)
        const lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1)
        const visibleDate = date.getTime()
        // get the end of the month
        lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1)
        lastVisibleDate.setDate(lastVisibleDate.getDate() - 1)
        newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate)
      }

      if (newCalendar) {
        this.calendars = [{
          month: date.getMonth(),
          year: date.getFullYear()
        }]
        if (this._o.mainCalendar === 'right') {
          this.calendars[0].month += 1 - this._o.numberOfMonths
        }
      }

      this.adjustCalendars()
    },

    adjustDate: function (sign, days) {
      const day = this.getDate() || new Date()
      const difference = parseInt(days) * 24 * 60 * 60 * 1000

      let newDay

      if (sign === 'add') {
        newDay = new Date(day.valueOf() + difference)
      } else if (sign === 'subtract') {
        newDay = new Date(day.valueOf() - difference)
      }

      this.setDate(newDay)
    },

    adjustCalendars: function () {
      let c

      this.calendars[0] = adjustCalendar(this.calendars[0])
      for (c = 1; c < this._o.numberOfMonths; c++) {
        this.calendars[c] = adjustCalendar({
          month: this.calendars[0].month + c,
          year: this.calendars[0].year
        })
      }
      this.draw()
    },

    gotoToday: function () {
      this.gotoDate(new Date())
    },

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth: function (month) {
      if (!isNaN(month)) {
        this.calendars[0].month = parseInt(month, 10)
        this.adjustCalendars()
      }
    },

    nextMonth: function () {
      this.calendars[0].month++
      this.adjustCalendars()
    },

    prevMonth: function () {
      this.calendars[0].month--
      this.adjustCalendars()
    },

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear: function (year) {
      if (!isNaN(year)) {
        this.calendars[0].year = parseInt(year, 10)
        this.adjustCalendars()
      }
    },

    /**
     * change the minDate
     */
    setMinDate: function (value) {
      if (value instanceof Date) {
        setToStartOfDay(value)
        this._o.minDate = value
        this._o.minYear = value.getFullYear()
        this._o.minMonth = value.getMonth()
      } else {
        this._o.minDate = defaults.minDate
        this._o.minYear = defaults.minYear
        this._o.minMonth = defaults.minMonth
        this._o.startRange = defaults.startRange
      }

      this.draw()
    },

    /**
     * change the maxDate
     */
    setMaxDate: function (value) {
      if (value instanceof Date) {
        setToStartOfDay(value)
        this._o.maxDate = value
        this._o.maxYear = value.getFullYear()
        this._o.maxMonth = value.getMonth()
      } else {
        this._o.maxDate = defaults.maxDate
        this._o.maxYear = defaults.maxYear
        this._o.maxMonth = defaults.maxMonth
        this._o.endRange = defaults.endRange
      }

      this.draw()
    },

    setStartRange: function (value) {
      this._o.startRange = value
    },

    setEndRange: function (value) {
      this._o.endRange = value
    },

    /**
     * refresh the HTML
     */
    draw: function (force) {
      if (!this._v && !force) {
        return
      }

      const opts = this._o
      const minYear = opts.minYear
      const maxYear = opts.maxYear
      const minMonth = opts.minMonth
      const maxMonth = opts.maxMonth
      let html = ''
      let randId

      if (this._y <= minYear) {
        this._y = minYear
        if (!isNaN(minMonth) && this._m < minMonth) {
          this._m = minMonth
        }
      }
      if (this._y >= maxYear) {
        this._y = maxYear
        if (!isNaN(maxMonth) && this._m > maxMonth) {
          this._m = maxMonth
        }
      }

      randId = 'datepicker__title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2)

      let c
      for (c = 0; c < opts.numberOfMonths; c++) {
        html += '<div class="datepicker__lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>'
      }

      this.el.innerHTML = html

      if (opts.bound) {
        if (opts.field.type !== 'hidden') {
          setTimeout(() => {
            opts.trigger.focus()
          }, 1)
        }
      }

      if (typeof this._o.onDraw === 'function') {
        this._o.onDraw(this)
      }

      if (opts.bound) {
        // let the screen reader user know to use arrow keys
        opts.field.setAttribute('aria-label', 'Use the arrow keys to pick a date')
      }
    },

    adjustPosition: function () {
      if (this._o.container) return

      this.el.style.position = 'absolute'

      const field = this._o.trigger
      let pEl = field
      const width = this.el.offsetWidth
      const height = this.el.offsetHeight
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop
      let left
      let top

      if (typeof field.getBoundingClientRect === 'function') {
        const clientRect = field.getBoundingClientRect()
        left = clientRect.left + window.pageXOffset
        top = clientRect.bottom + window.pageYOffset
      } else {
        left = pEl.offsetLeft
        top = pEl.offsetTop + pEl.offsetHeight
        while ((pEl = pEl.offsetParent)) {
          left += pEl.offsetLeft
          top += pEl.offsetTop
        }
      }

      // default position is bottom & left
      if ((this._o.reposition && left + width > viewportWidth) || (
          this._o.position.indexOf('right') > -1 &&
          left - width + field.offsetWidth > 0
        )) {
        left = left - width + field.offsetWidth
      }
      if ((this._o.reposition && top + height > viewportHeight + scrollTop) || (
          this._o.position.indexOf('top') > -1 &&
          top - height - field.offsetHeight > 0
        )) {
        top = top - height - field.offsetHeight
      }

      this.el.style.left = left + 'px'
      this.el.style.top = top + 'px'
    },

    /**
     * render HTML for a particular month
     */
    render: function (year, month, randId) {
      const opts = this._o
      const now = new Date()
      const days = getDaysInMonth(year, month)
      let before = new Date(year, month, 1).getDay()
      let data = []
      let row = []

      setToStartOfDay(now)

      if (opts.firstDay > 0) {
        before -= opts.firstDay
        if (before < 0) {
          before += 7
        }
      }

      const previousMonth = month === 0 ? 11 : month - 1
      const nextMonth = month === 11 ? 0 : month + 1
      const yearOfPreviousMonth = month === 0 ? year - 1 : year
      const yearOfNextMonth = month === 11 ? year + 1 : year
      const daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth)
      let cells = days + before
      let after = cells

      while (after > 7) {
        after -= 7
      }

      cells += 7 - after
      let isWeekSelected = false
      let i, r

      for (i = 0, r = 0; i < cells; i++) {
        const day = new Date(year, month, 1 + (i - before))
        const isSelected = isDate(this._d) ? compareDates(day, this._d) : false
        const isToday = compareDates(day, now)
        const hasEvent = opts.events.indexOf(day.toDateString()) !== -1
        const isEmpty = i < before || i >= (days + before)
        let dayNumber = 1 + (i - before)
        let monthNumber = month
        let yearNumber = year
        const isStartRange = opts.startRange && compareDates(opts.startRange, day)
        const isEndRange = opts.endRange && compareDates(opts.endRange, day)
        const isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange
        const isDisabled = (opts.minDate && day < opts.minDate) ||
          (opts.maxDate && day > opts.maxDate) ||
          (opts.disableWeekends && isWeekend(day)) ||
          (opts.disableDayFn && opts.disableDayFn(day))

        if (isEmpty) {
          if (i < before) {
            dayNumber = daysInPreviousMonth + dayNumber
            monthNumber = previousMonth
            yearNumber = yearOfPreviousMonth
          } else {
            dayNumber = dayNumber - days
            monthNumber = nextMonth
            yearNumber = yearOfNextMonth
          }
        }

        const dayConfig = {
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
        }

        if (opts.pickWholeWeek && isSelected) {
          isWeekSelected = true
        }

        row.push(renderDay(dayConfig))

        if (++r === 7) {
          if (opts.showWeekNumber) {
            row.unshift(renderWeek(i - before, month, year))
          }
          data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected))
          row = []
          r = 0
          isWeekSelected = false
        }
      }
      return renderTable(opts, data, randId)
    },

    isVisible: function () {
      return this._v
    },

    show: function () {
      if (!this.isVisible()) {
        this._v = true
        this.draw()
        removeClass(this.el, 'is-hidden')
        if (this._o.bound) {
          addEvent(document, 'click', this._onClick)
          this.adjustPosition()
        }
        if (typeof this._o.onOpen === 'function') {
          this._o.onOpen.call(this)
        }
      }
    },

    hide: function () {
      const v = this._v
      if (v !== false) {
        if (this._o.bound) {
          removeEvent(document, 'click', this._onClick)
        }
        this.el.style.position = 'static' // reset
        this.el.style.left = 'auto'
        this.el.style.top = 'auto'
        addClass(this.el, 'is-hidden')
        this._v = false
        if (v !== undefined && typeof this._o.onClose === 'function') {
          this._o.onClose.call(this)
        }
      }
    },

    destroy: function () {
      this.hide()
      removeEvent(this.el, 'mousedown', this._onMouseDown, true)
      removeEvent(this.el, 'touchend', this._onMouseDown, true)
      removeEvent(this.el, 'change', this._onChange)
      if (this._o.field) {
        removeEvent(this._o.field, 'change', this._onInputChange)
        if (this._o.bound) {
          removeEvent(this._o.trigger, 'click', this._onInputClick)
          removeEvent(this._o.trigger, 'focus', this._onInputFocus)
          removeEvent(this._o.trigger, 'blur', this._onInputBlur)
        }
      }
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el)
      }
    }
  }
  window.PlainPicker = PlainPicker
})()
