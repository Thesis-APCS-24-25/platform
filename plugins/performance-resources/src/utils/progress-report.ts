// TODO: move to uitls/timereport.ts
import { ReportDayType } from '@hcengineering/performance'
import { areDatesEqual, isWeekend } from '@hcengineering/ui'

export function getReportDate (type: ReportDayType): number {
  const date = new Date(Date.now())

  if (type === ReportDayType.PreviousWorkDay) {
    date.setDate(date.getDate() - 1)
  }

  // if date is day off then set date to last working day
  while (isWeekend(date)) {
    date.setDate(date.getDate() - 1)
  }

  return date.valueOf()
}

export function getReportDayType (timestamp: number): ReportDayType | undefined {
  const date = new Date(timestamp)
  const currentWorkDate = new Date(getReportDate(ReportDayType.CurrentWorkDay))
  const previousWorkDate = new Date(getReportDate(ReportDayType.PreviousWorkDay))

  if (areDatesEqual(date, currentWorkDate)) {
    return ReportDayType.CurrentWorkDay
  } else if (areDatesEqual(date, previousWorkDate)) {
    return ReportDayType.PreviousWorkDay
  }
}
