;(function() {
  /**
   * feature detection and helper functions
   */

  const hasEventListeners = !!window.addEventListener

  const addEvent = function(el, e, callback, capture) {
    if (hasEventListeners) {
      el.addEventListener(e, callback, !!capture)
    } else {
      el.attachEvent('on' + e, callback)
    }
  }

  const removeEvent = function(el, e, callback, capture) {
    if (hasEventListeners) {
      el.removeEventListener(e, callback, !!capture)
    } else {
      el.detachEvent('on' + e, callback)
    }
  }

  const hasClass = function(el, cn) {
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1
  }

  const daysToTime = function(days) {
    return days * 24 * 3600000
  }

  const extend = function(out) {
    out = out || {}
    let o, i
    for (o, i = 1; i < arguments.length; i++) {
      o = arguments[i]
      if (!o) continue
      for (let key in o) {
        if (o.hasOwnProperty(key)) {
          out[key] = o[key]
        }
      }
    }
    return out
  }

  /**
   * Pikarange constructor
   */
  const PickRanger = function(options) {
    const startOptions = options.start.nodeName ? {field: options.start} : options.start
    const endOptions = options.end.nodeName ? {field: options.end} : options.end
    let pickerOptions

    delete options.start
    delete options.end

    pickerOptions = extend({}, options, startOptions, {autoInit: false})
    const startPicker = new PlainPicker(pickerOptions)

    pickerOptions = extend({}, options, endOptions, {autoInit: false})
    const endPicker = new PlainPicker(pickerOptions)

    console.log(endPicker)

    function setStartRange(d, temporary) {
      startPicker.setStartRange(d)
      endPicker.setStartRange(d)

      if (!(d instanceof Date) || !d.getTime()) {
        return
      }
      if (temporary) {
        return
      }

      let minEndDate = options.minDate
      let time
      if (typeof endPicker._o.minRange !== 'undefined') {
        time = d.getTime() + daysToTime(endPicker._o.minRange)
        if (!minEndDate || minEndDate < time) {
          minEndDate = new Date(time)
        }
      }

      let maxEndDate = options.maxDate
      if (typeof endPicker._o.maxRange !== 'undefined') {
        time = d.getTime() + daysToTime(endPicker._o.maxRange)
        if (!maxEndDate || maxEndDate > time) {
          maxEndDate = new Date(time)
        }
      }
      endPicker.setMinDate(minEndDate)
      endPicker.setMaxDate(maxEndDate)
      if (!endPicker._d || !endPicker._d.getTime()) {
        endPicker.gotoDate(d)
      } else {
        if (endPicker._d < minEndDate || endPicker._d > maxEndDate) {
          endPicker.setDate(null)
          endPicker.gotoDate(d)
        }
      }
    }

    function setEndRange(d) {
      startPicker.setEndRange(d)
      endPicker.setEndRange(d)
    }

    startPicker.on('change', function() {
      delete this.originalRange
      setStartRange(this._d)
      if (!endPicker.isValid()) {
        endPicker.setDate(null)
        endPicker.gotoDate(this._d)
      }
    })

    startPicker.on('select', function() {
      if (endPicker._o.trigger || endPicker._o.field) (endPicker._o.trigger || endPicker._o.field).focus()
    })

    endPicker.on('change', function() {
      delete this.originalRange
      setEndRange(this._d)
    })

    startPicker.on('close', function() {
      delete this.originalRange
    })
    endPicker.on('close', function() {
      delete this.originalRange
    })

    startPicker.on('destroy', function() {
      removeEvent(startPicker.el, 'mouseover', handleStartOver)
      removeEvent(endPicker.el, 'mouseover', handleEndOver)
      endPicker.destroy()
    })

    endPicker.on('init', function() {
      startPicker.init()
    })

    startPicker.on('init', function() {
      setStartRange(startPicker._d)
      setEndRange(endPicker._d)
      addEvent(startPicker.el, 'mouseover', handleStartOver)
      addEvent(endPicker.el, 'mouseover', handleEndOver)
    })

    const handleStartOver = getPickerOver(startPicker)
    const handleEndOver = getPickerOver(endPicker)

    function getPickerOver(picker) {
      return function handlePickerOver(event) {
        if (startPicker._d && endPicker._d) {
          return
        }
        if (!hasClass(event.target, 'datepicker__button')) {
          if (!picker.outDelay && picker.originalRange) {
            picker.outDelay = setTimeout(function() {
              setStartRange(picker.originalRange[0], true)
              setEndRange(picker.originalRange[1], true)
              delete picker.originalRange
              delete picker.outDelay
            }, 200)
          }
          return
        }
        clearTimeout(picker.outDelay)
        delete picker.outDelay

        if (typeof picker.originalRange === 'undefined') {
          picker.originalRange = [picker._o.startRange, picker._o.endRange]
        }
        const targetEl = event.target
        const date = new Date(
          targetEl.getAttribute('data-datepicker-year'),
          targetEl.getAttribute('data-datepicker-month'),
          targetEl.getAttribute('data-datepicker-day')
        )
        if (picker === startPicker) {
          setStartRange(date, true)
        } else {
          setEndRange(date, true)
        }
      }
    }

    if (options.autoInit !== false) {
      endPicker.init()
    }

    return this.startPicker
  }

  window.PickRanger = PickRanger
})()
