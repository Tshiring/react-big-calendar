import { DateLocalizer } from '../localizer'
import * as dates from '../utils/dates'

const dateRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'P', culture)} – ${local.format(end, 'P', culture)}`

const timeRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'p', culture)} – ${local.format(end, 'p', culture)}`

const timeRangeStartFormat = ({ start }, culture, local) =>
  `${local.format(start, 'h:mma', culture)} – `

const timeRangeEndFormat = ({ end }, culture, local) =>
  ` – ${local.format(end, 'h:mma', culture)}`

const weekRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'MMMM dd', culture)} – ${local.format(
    end,
    dates.eq(start, end, 'month') ? 'dd' : 'MMMM dd',
    culture
  )}`

const formats = {
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

const dateFnsTzLocalizer = ({
  startOfWeek,
  getDay,
  format: _format,
  locales,
  timeZone,
  formatTz,
  utcToZonedTime,
}) => {
  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      return getDay(startOfWeek(new Date(), { locale: locales[culture] }))
    },
    format(value, formatString, culture) {
      const zonedDate = utcToZonedTime(value, timeZone)
      return formatTz(zonedDate, formatString, {
        locale: locales[culture],
      })
    },
  })
}

export default dateFnsTzLocalizer
