import { Account, Ref, Tx, TxCreateDoc, TxUpdateDoc } from '@hcengineering/core'
import performance, { EmployeeKRA, KRA, PerformanceReport, ReviewSession, WithKRA } from '@hcengineering/performance'
import { TriggerControl } from '@hcengineering/server-core'
import contact from '@hcengineering/contact'
import kra, { Goal, Issue, Kpi } from '@hcengineering/kra'

export function addUpdates (control: TriggerControl, member: Ref<Account>, reviewSessions: ReviewSession[]): Tx[] {
  const result: Tx[] = []

  for (const rs of reviewSessions) {
    if (!rs.members.includes(member)) continue
    const pullTx = control.txFactory.createTxUpdateDoc(rs._class, rs.space, rs._id, {
      $pull: {
        members: member
      }
    })
    result.push(pullTx)
  }
  return result
}

export async function prepareReport (
  control: TriggerControl,
  createTx: TxCreateDoc<PerformanceReport>
): Promise<TxUpdateDoc<PerformanceReport>> {
  const assignee = (await control.findAll(
    control.ctx,
    contact.class.PersonAccount,
    { _id: createTx.attributes.reviewee },
    { limit: 1 }
  ))[0]
  const reviewSession = (await control.findAll(
    control.ctx,
    performance.class.ReviewSession,
    { _id: createTx.attributes.reviewSession },
    { limit: 1 }
  ))[0]
  const employeeKras = (await control.findAll(
    control.ctx,
    performance.class.EmployeeKRA,
    {
      space: reviewSession._id,
      employee: assignee._id
    }
  ))
  const kras = employeeKras.map(v => v.kra)
  const tasks = (await control.findAll(control.ctx, kra.class.Issue,
    {
      assignee: assignee.person,
      createdOn: {
        $gte: reviewSession.reviewSessionStart,
        // Add an extra day to include tasks at the end of review session date
        $lt: reviewSession.reviewSessionEnd + 86400
      },
      'performance:mixin:WithKRA.kra': { $in: kras }
    }
  ))

  const score = await calculateScore(control, tasks, employeeKras)

  const taskRefs = tasks.map<Ref<WithKRA>>((task) => task._id)

  return control.txFactory.createTxUpdateDoc(
    createTx.objectClass,
    createTx.objectSpace,
    createTx.objectId,
    {
      tasks: taskRefs,
      scorePreview: score
    }
  )
}

function getScore (issue: Issue, goal: Goal | undefined): number {
  if (goal === undefined) {
    return issue.status === kra.status.Done ? 1 : 0
  }
  if (goal._class === kra.class.Kpi) {
    return (goal.progress ?? 0) / (goal as Kpi).target
  }
  if (goal._class === kra.class.RatingScale) {
    return (goal.progress ?? 0) / 5
  }
  return 0
}

async function calculateScore (control: TriggerControl, tasks: Issue[], employeeKras: EmployeeKRA[]): Promise<number> {
  const tasksByKras: Record<Ref<KRA>, { tasks: Issue[], weight: number }> = {}
  let score: number = 0
  for (const ekra of employeeKras) {
    tasksByKras[ekra.kra] = {
      tasks: [],
      weight: ekra.weight
    }
  }
  for (const task of tasks) {
    const withKra: WithKRA = control.hierarchy.as(task, performance.mixin.WithKRA)
    if (withKra.kra !== undefined) {
      tasksByKras[withKra.kra].tasks.push(task)
    }
  }
  for (const ekra of employeeKras) {
    let sum = 0
    const entry = tasksByKras[ekra.kra]
    if (entry.tasks.length === 0) continue
    for (const task of entry.tasks) {
      const find = await control.findAll(
        control.ctx,
        kra.class.Goal,
        { _id: task.goal },
        { limit: 1 }
      )
      const goal = find !== undefined && find.length > 0 ? find[0] : undefined
      sum += getScore(task, goal)
    }
    score += (sum / entry.tasks.length) * entry.weight * 100
  }
  return score
}
