import { type Kpi, type Goal, type Issue, type KpiReport } from '@hcengineering/kra'
import { createQuery, getClient } from '@hcengineering/presentation'
import kra from '../plugin'

export function getGoal(object: Issue, onResult: (goal: Goal) => void): void {
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

export type KpiResultType = 'sum' | 'manual'
export interface KpiResult {
  type: KpiResultType
  value: number
}

export function getKpiReports(kpi: Kpi, onResult: (reports: KpiReport[]) => void): void {
  const query = createQuery()
  query.query(kra.class.KpiReport, {
    attachedTo: kpi._id
  }, async (results) => {
    onResult(results)
  })
}
