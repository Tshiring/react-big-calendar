import * as dates from '../utils/dates'
import { DateLocalizer } from '../localizer'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
// import {
//   // format,
//   formatInTimeZone,
//   utcToZonedTime,
//   zonedTimeToUtc,
// } from 'date-fns-tz'
// import { startOfWeek, getDay } from 'date-fns'

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

const dateFnsTzLocalizer = function ({
  startOfWeek,
  getDay,
  format: _format,
  locales,
}) {
  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      return getDay(startOfWeek(new Date(), { locale: locales[culture] }))
    },
    format(value, formatString, culture, timezone) {
      const date = timezone ? toZonedTime(value, timezone) : new Date(value)
      return timezone
        ? formatInTimeZone(date, timezone, formatString, {
            locale: locales[culture],
          })
        : _format(date, formatString, { locale: locales[culture] })
    },
    getCurrentTimezone() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    convertToLocalTime(date, timezone) {
      return toZonedTime(date, timezone)
    },
    convertToUTC(date, timezone) {
      return fromZonedTime(date, timezone)
    },
  })
}

export default dateFnsTzLocalizer
