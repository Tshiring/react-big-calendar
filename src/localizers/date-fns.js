import * as dates from '../utils/dates'
import { DateLocalizer } from '../localizer'
import { getTimezoneOffset } from 'date-fns-tz'
import { differenceInMinutes, startOfDay } from 'date-fns'

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

// function fixUnit(unit) {
//   let datePart = unit ? unit.toLowerCase() : unit
//   if (datePart === 'FullYear') {
//     datePart = 'year'
//   } else if (!datePart) {
//     datePart = undefined
//   }
//   return datePart
// }

const dateFnsLocalizer = function ({
  startOfWeek,
  getDay,
  format: _format,
  locales,
  timeZone,
}) {
  function getDateFnsTimeZoneOffset(date) {
    return getTimezoneOffset(timeZone, date) / 60000 // Convert to minutes
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

  return new DateLocalizer({
    formats,
    browserTZOffset,
    getDstOffset,
    getMinutesFromMidnight,
    getTimezoneOffset(date, timeZone) {
      return getTimezoneOffset(timeZone, new Date(date))
    },
    // eq(a, b, unit) {
    //   const dateFnsUnit = fixUnit(unit)
    //   return isSameDay(utcToZonedTime(a, timeZone), utcToZonedTime(b, timeZone))
    // },

    firstOfWeek(culture) {
      return getDay(startOfWeek(new Date(), { locale: locales[culture] }))
    },

    format(value, formatString, culture) {
      return _format(new Date(value), formatString, {
        locale: locales[culture],
      })
    },
  })
}

export default dateFnsLocalizer
