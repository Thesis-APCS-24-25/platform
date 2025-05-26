import { type Goal, type Issue, type Report, type GoalAggregateFunction, type Kpi } from '@hcengineering/kra'
import { createQuery, getClient } from '@hcengineering/presentation'
import kra from '../plugin'

export function getGoal (object: Issue, onResult: (goal: Goal) => void): void {
  const ref = object.goal
  if (ref === undefined) {
    return
  }

  const query = createQuery()
  query.query(
    kra.class.Goal,
    {
      _id: ref
    },
    (result) => {
      if (result.length === 0) {
        return
      }
      onResult(result[0])
    }
  )
}

export function getReports (goal: Goal, onResult: (reports: Report[]) => void): void {
  const query = createQuery()
  query.query(
    kra.class.Report,
    {
      attachedTo: goal._id
    },
    async (results) => {
      onResult(results)
    }
  )
}

export const calculateKpiResult: GoalAggregateFunction = (reports: Report[]): number =>
  reports.reduce((acc, report) => acc + report.value, 0)

export const calculateRatingScaleResult: GoalAggregateFunction = (reports: Report[]): number =>
  reports.length > 0 ? reports.reduce((acc, report) => ((acc.date ?? 0) > (report.date ?? 0) ? acc : report)).value : 0

function _calculateGoal (goal: Goal, reports: Report[]): number {
  if (goal._class === kra.class.Kpi) {
    return calculateKpiResult(reports) / (goal as Kpi).target
  } else if (goal._class === kra.class.RatingScale) {
    return calculateRatingScaleResult(reports) / 5
  }
  return 0
}

export async function calculateGoal (goal: Goal, reports?: Report[] | undefined): Promise<number | undefined> {
  if (reports !== undefined) {
    return _calculateGoal(goal, reports)
  }
  const client = getClient()
  const res = await client.findAll(kra.class.Report, {
    attachedTo: goal._id
  })
  return _calculateGoal(goal, res)
}

export async function calculateResult (goal: Goal, reports?: Report[] | undefined): Promise<number | undefined> {
  function sum (goal: Goal, reports: Report[]): number {
    if (goal._class === kra.class.Kpi) {
      return calculateKpiResult(reports)
    } else if (goal._class === kra.class.RatingScale) {
      return calculateRatingScaleResult(reports)
    }
    return 0
  }

  if (reports !== undefined) {
    return sum(goal, reports)
  }

  const client = getClient()
  const res = await client.findAll(kra.class.Report, {
    attachedTo: goal._id
  })
  return sum(goal, res)
}

export function calculateGoalCallback (
  goal: Goal,
  reports: Report[] | undefined,
  callback: (error: Error | null, result?: number | undefined) => void
): void {
  if (reports !== undefined) {
    callback(null, _calculateGoal(goal, reports))
  }
  getReports(goal, (reports) => {
    const result = _calculateGoal(goal, reports)
    callback(null, result)
  })
}

export async function removeGoal (issue: Issue): Promise<void> {
  const client = getClient()
  if (issue.goal === undefined) {
    return
  }
  const ops = client.apply()
  await ops.update(issue, { goal: undefined })
  await ops.removeDoc(kra.class.Goal, issue.space, issue.goal)
  await ops.commit()
}
