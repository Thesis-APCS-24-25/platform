import { type Goal, type Issue } from '@hcengineering/kra'
import { createQuery } from '@hcengineering/presentation'
import kra from '../plugin'

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
