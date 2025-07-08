// TODO: Copy to @hcengineering/performance-resources
// import { type Goal, type Issue, type Report } from '@hcengineering/kra'
// import { createQuery, getClient } from '@hcengineering/presentation'
// import kra from '../plugin'
//
// export function getGoal (object: Issue, onResult: (goal: Goal) => void): void {
//   const ref = object.goal
//   if (ref === undefined) {
//     return
//   }
//
//   const query = createQuery()
//   query.query(
//     kra.class.Goal,
//     {
//       _id: ref
//     },
//     (result) => {
//       if (result.length === 0) {
//         return
//       }
//       onResult(result[0])
//     }
//   )
// }
//
// export function getReports (goal: Goal, onResult: (reports: Report[]) => void): void {
//   const query = createQuery()
//   query.query(
//     kra.class.Report,
//     {
//       attachedTo: goal._id
//     },
//     async (results) => {
//       onResult(results)
//     }
//   )
// }
//
// export async function removeGoal (issue: Issue): Promise<void> {
//   const client = getClient()
//   if (issue.goal === undefined) {
//     return
//   }
//   const ops = client.apply()
//   await ops.update(issue, { goal: undefined })
//   await ops.removeDoc(kra.class.Goal, issue.space, issue.goal)
//   await ops.commit()
// }
