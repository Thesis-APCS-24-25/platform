import { type ReportAggregator, type Goal, type Issue, type Report, Kpi } from '@hcengineering/kra'
import { createQuery, getClient } from '@hcengineering/presentation'
import kra from '../plugin'
import { getResource } from '@hcengineering/platform'
import { type Doc, type Space } from '@hcengineering/core'

export function getGoal (object: Issue, onResult: (goal: Goal) => void): void {
  const ref = object.goal
  if (ref === undefined) {
    return
  }

  const query = createQuery()
  query.query(kra.class.Goal, {
    _id: ref
  }, (result) => {
    if (result.length === 0) {
      return
    }
    onResult(result[0])
  })
}

export function getReports (goal: Goal, onResult: (reports: Report[]) => void): void {
  const query = createQuery()
  query.query(kra.class.Report, {
    attachedTo: goal._id
  }, async (results) => {
    onResult(results)
  })
}

export function calculateKpiResult (
  reports: Report[]
): number {
  return reports.reduce((acc, report) => acc + report.value, 0)
}

export function calculateRatingScaleResult (
  reports: Report[]
): number {
  return reports.reduce((acc, report) => (acc.date ?? 0) > (report.date ?? 0) ? acc : report).value
}

export async function calculateGoal (
  goal: Goal,
  reports?: Report[] | undefined
): Promise<number | undefined> {
  const client = getClient()
  const fn = client.getHierarchy().classHierarchyMixin<Doc<Space>, ReportAggregator>(goal._class, kra.mixin.ReportAggregator)
  if (fn === undefined) {
    return undefined
  }
  if (reports === undefined) {
    reports = await client.findAll(kra.class.Report, {
      attachedTo: goal._id
    })
  }
  return fn.aggregator(reports)
}
