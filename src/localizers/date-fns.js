import * as dates from '../utils/dates'
import { DateLocalizer } from '../localizer'
import { getTimezoneOffset } from 'date-fns-tz'
import {
  differenceInMinutes,
  endOfMonth,
  startOfDay,
  startOfMonth,
  min as minimum,
  max as maximum,
  toDate,
  format,
  startOfYear,
  startOfQuarter,
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInQuarters,
  differenceInDays,
  isSameDay,
  startOfWeek,
  parse,
  addMinutes,
} from 'date-fns'

let dateRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'P', culture)} – ${local.format(end, 'P', culture)}`

let timeRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'p', culture)} – ${local.format(end, 'p', culture)}`

let timeRangeStartFormat = ({ start }, culture, local) =>
  `${local.format(start, 'h:mma', culture)} – `

let timeRangeEndFormat = ({ end }, culture, local) =>
  ` – ${local.format(end, 'h:mma', culture)}`

let weekRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'MMMM dd', culture)} – ${local.format(
    end,
    dates.eq(start, end, 'month') ? 'dd' : 'MMMM dd',
    culture
  )}`

export let formats = {
  dateFormat: 'dd',
  dayFormat: 'dd eee',
  weekdayFormat: 'cccc',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'p',

  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'cccc MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ccc MMM dd',
  agendaTimeFormat: 'p',
  agendaTimeRangeFormat: timeRangeFormat,
}

function fixUnit(unit) {
  let datePart = unit ? unit.toLowerCase() : unit
  if (datePart === 'FullYear') {
    datePart = 'year'
  } else if (!datePart) {
    datePart = undefined
  }
  return datePart
}

function defineComparators(a, b, unit) {
  const datePart = fixUnit(unit)
  let dtA = new Date(a)
  let dtB = new Date(b)

  switch (datePart) {
    case 'year':
      dtA = startOfYear(dtA)
      dtB = startOfYear(dtB)
      break
    case 'month':
      dtA = startOfMonth(dtA)
      dtB = startOfMonth(dtB)
      break
    case 'week':
      dtA = startOfWeek(dtA)
      dtB = startOfWeek(dtB)
      break
    case 'quarter':
      dtA = startOfQuarter(dtA)
      dtB = startOfQuarter(dtB)
      break
    case 'day':
      dtA = startOfDay(dtA)
      dtB = startOfDay(dtB)
      break
    default:
      // No adjustment needed for default
      break
  }

  return [dtA, dtB, datePart]
}

function eq(a, b, unit) {
  const [dtA, dtB] = defineComparators(a, b, unit)
  return +dtA == +dtB
}

function neq(a, b, unit) {
  return !eq(a, b, unit)
}

function gt(a, b, unit) {
  const [dtA, dtB] = defineComparators(a, b, unit)
  return +dtA > +dtB
}

function lt(a, b, unit) {
  const [dtA, dtB] = defineComparators(a, b, unit)
  return +dtA < +dtB
}

function gte(a, b, unit) {
  const [dtA, dtB] = defineComparators(a, b, unit)
  return +dtA >= +dtB
}

function lte(a, b, unit) {
  const [dtA, dtB] = defineComparators(a, b, unit)
  return +dtA <= +dtB
}

function inRange(day, min, max) {
  // const datePart = fixUnit(unit)
  const mDay = new Date(day)
  const mMin = new Date(min)
  const mMax = new Date(max)
  return +mDay >= +mMin && +mDay <= +mMax
}

function min(dateA, dateB) {
  const dtA = new Date(dateA)
  const dtB = new Date(dateB)
  const minDt = minimum(dtA, dtB)
  return toDate(minDt)
}

function max(dateA, dateB) {
  const dtA = new Date(dateA)
  const dtB = new Date(dateB)
  const maxDt = maximum(dtA, dtB)
  return toDate(maxDt)
}

function merge(date, time) {
  if (!date && !time) return null

  // Format the time and date
  const formattedTime = format(time, 'HH:mm:ss')
  const formattedDate = format(startOfDay(date), 'MM/dd/yyyy') // Use 'MM/dd/yyyy' for date formatting

  // Combine date and time strings
  const dateTimeStr = `${formattedDate} ${formattedTime}`

  // Define the format
  const formatStr = 'MM/dd/yyyy HH:mm:ss'

  // Parse the combined string into a Date object
  return parse(dateTimeStr, formatStr, new Date())
}

function add(date, adder, unit) {
  const datePart = fixUnit(unit)
  const parsedDate = new Date(date)

  // Use `date-fns` add function with different units
  switch (datePart) {
    case 'year':
      return add(parsedDate, { years: adder })
    case 'month':
      return add(parsedDate, { months: adder })
    case 'week':
      return add(parsedDate, { weeks: adder })
    case 'day':
      return add(parsedDate, { days: adder })
    case 'quarter':
      return add(parsedDate, { quarters: adder }) // Note: `quarters` requires `date-fns-quarter`
    default:
      return parsedDate
  }
}

const dateFnsLocalizer = function ({
  startOfWeek,
  getDay,
  format: _format,
  locales,
  timeZone,
}) {
  function getDateFnsTimeZoneOffset(date) {
    return getTimezoneOffset(timeZone, new Date(date))
  }
  function browserTZOffset() {
    /**
     * Date.prototype.getTimezoneOffset horrifically flips the positive/negative from
     * what you see in it's string, so we have to jump through some hoops to get a value
     * we can actually compare.
     */
    const now = new Date()
    const browserOffset = now.getTimezoneOffset()
    const zoneOffset = getDateFnsTimeZoneOffset(now)
    return zoneOffset > browserOffset ? 1 : 0
  }

  function getDstOffset(start, end) {
    const startOffset = getDateFnsTimeZoneOffset(start)
    const endOffset = getDateFnsTimeZoneOffset(end)
    return startOffset - endOffset
  }

  function getDayStartDstOffset(start) {
    const dayStart = startOfDay(start)
    return getDstOffset(dayStart, start)
  }

  function getMinutesFromMidnight(start) {
    const dayStart = startOfDay(start)
    const day = new Date(start)
    return differenceInMinutes(dayStart, day) + getDayStartDstOffset(start)
  }

  function startOf(date = null, unit) {
    const datePart = fixUnit(unit)
    const parsedDate = new Date(date)

    switch (datePart) {
      case 'year':
        return startOfYear(parsedDate)
      case 'month':
        return startOfMonth(parsedDate)
      case 'week':
        return startOfWeek(parsedDate)
      case 'quarter':
        return startOfQuarter(parsedDate)
      case 'day':
      default:
        return startOfDay(parsedDate)
    }
  }

  function endOf(date = null, unit) {
    const datePart = fixUnit(unit)
    const parsedDate = new Date(date)

    switch (datePart) {
      case 'year':
        return startOfYear(parsedDate)
      case 'month':
        return startOfMonth(parsedDate)
      case 'week':
        return startOfWeek(parsedDate)
      case 'quarter':
        return startOfQuarter(parsedDate)
      case 'day':
      default:
        return startOfDay(parsedDate)
    }
  }

  function range(start, end, unit = 'day') {
    const datePart = fixUnit(unit)
    // because the add method will put these in tz, we have to start that way
    let current = new Date(start)
    const days = []

    while (lte(current, end)) {
      days.push(current)
      current = add(current, 1, datePart)
    }

    return days
  }

  function ceil(date, unit) {
    const datePart = fixUnit(unit)
    const floor = startOf(date, datePart)

    return eq(floor, date) ? floor : add(floor, 1, datePart)
  }

  function diff(a, b, unit = 'day') {
    const datePart = fixUnit(unit)
    const dtA = new Date(a)
    const dtB = new Date(b)

    switch (datePart) {
      case 'year':
        return differenceInYears(dtB, dtA)
      case 'month':
        return differenceInMonths(dtB, dtA)
      case 'week':
        return differenceInWeeks(dtB, dtA)
      case 'quarter':
        return differenceInQuarters(dtB, dtA) // Requires `date-fns-quarter` if not in core
      case 'day':
      default:
        return differenceInDays(dtB, dtA)
    }
  }

  function getSlotDate(dt, minutesFromMidnight, offset) {
    const date = new Date(dt)

    // Get the start of the day
    const startOfDayDate = startOfDay(date)

    // Add the total minutes (minutesFromMidnight + offset)
    const totalMinutes = minutesFromMidnight + offset
    const finalDate = addMinutes(startOfDayDate, totalMinutes)

    return finalDate
  }

  function getTotalMin(start, end) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    return differenceInMinutes(endDate, startDate)
  }

  // These two are used by DateSlotMetrics
  function continuesPrior(start, first) {
    return lt(start, first)
  }

  function continuesAfter(start, end, last) {
    return gte(end, last)
  }

  function daySpan(start, end) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    return differenceInDays(endDate, startDate)
  }

  // These two are used by eventLevels
  function sortEvents({
    evtA: { start: aStart, end: aEnd, allDay: aAllDay },
    evtB: { start: bStart, end: bEnd, allDay: bAllDay },
  }) {
    const startSort = +startOf(aStart, 'day') - +startOf(bStart, 'day')

    const durA = daySpan(aStart, aEnd)

    const durB = daySpan(bStart, bEnd)

    return (
      startSort || // sort by start Day first
      durB - durA || // events spanning multiple days go first
      !!bAllDay - !!aAllDay || // then allDay single day events
      +aStart - +bStart || // then sort by start time *don't need moment conversion here
      +aEnd - +bEnd // then sort by end time *don't need moment conversion here either
    )
  }

  function inEventRange({
    event: { start, end },
    range: { start: rangeStart, end: rangeEnd },
  }) {
    const eStart = startOf(start, 'day')

    const startsBeforeEnd = lte(eStart, rangeEnd, 'day')
    // when the event is zero duration we need to handle a bit differently
    const sameMin = neq(eStart, end, 'minutes')
    const endsAfterStart = sameMin
      ? gt(end, rangeStart, 'minutes')
      : gte(end, rangeStart, 'minutes')
    return startsBeforeEnd && endsAfterStart
  }

  function isSameDate(date1, date2) {
    const dt = new Date(date1)
    const dt2 = new Date(date2)
    return isSameDay(dt, dt2)
  }

  function firstOfWeek(culture) {
    return getDay(startOfWeek(new Date(), { locale: locales[culture] }))
  }
  function firstVisibleDay(date) {
    return getDay(startOfMonth(date))
  }
  function lastVisibleDay(date) {
    return getDay(endOfMonth(date))
  }
  function visibleDays(date) {
    let current = firstVisibleDay(date)
    const last = lastVisibleDay(date)
    const days = []

    while (lte(current, last)) {
      days.push(current)
      current = add(current, 1, 'd')
    }

    return days
  }

  return new DateLocalizer({
    format(value, formatString, culture) {
      return _format(new Date(value), formatString, {
        locale: locales[culture],
      })
    },

    formats,

    firstOfWeek,
    firstVisibleDay,
    lastVisibleDay,
    visibleDays,

    lt,
    lte,
    gt,
    gte,
    eq,
    neq,
    merge,
    inRange,
    startOf,
    endOf,
    range,
    add,
    diff,
    ceil,
    min,
    max,

    getSlotDate,
    getTotalMin,
    getMinutesFromMidnight,
    continuesPrior,
    continuesAfter,
    sortEvents,
    inEventRange,
    isSameDate,
    daySpan,

    browserTZOffset,
    getDstOffset,
    // getMinutesFromMidnight,
    getTimezoneOffset(date, timeZone) {
      return getTimezoneOffset(timeZone, new Date(date))
    },
    // eq(a, b, unit) {
    //   const dateFnsUnit = fixUnit(unit)
    //   return isSameDay(utcToZonedTime(a, timeZone), utcToZonedTime(b, timeZone))
    // },
  })
}

export default dateFnsLocalizer
