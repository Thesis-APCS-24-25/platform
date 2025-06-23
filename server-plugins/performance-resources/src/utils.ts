import core, { Account, Ref, Tx, TxCreateDoc, TxUpdateDoc } from '@hcengineering/core'
import performance, {
  PTask,
  EmployeeKRA,
  KRA,
  PerformanceReport,
  Progress,
  ReviewSession,
  Kpi
} from '@hcengineering/performance'
import { TriggerControl } from '@hcengineering/server-core'
import contact from '@hcengineering/contact'
import taskPlugin from '@hcengineering/task'

export function addUpdates (
  control: TriggerControl,
  member: Ref<Account>,
  reviewSessions: ReviewSession[],
  isPull: boolean
): Tx[] {
  const result: Tx[] = []

  for (const rs of reviewSessions) {
    if (!rs.members.includes(member)) continue
    const payload = isPull
      ? { $pull: { members: member } }
      : { $push: { members: member } }
    const updateTx = control.txFactory.createTxUpdateDoc(rs._class, rs.space, rs._id, payload)
    result.push(updateTx)
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
      assignee: assignee.person
    }
  ))
  const kras = employeeKras.map(v => v.kra)
  const tasks = (await control.findAll(control.ctx, performance.class.PTask,
    {
      assignee: assignee.person,
      // createdOn: {
      //   $gte: reviewSession.reviewSessionStart,
      //   // Add an extra day to include tasks at the end of review session date
      //   $lt: reviewSession.reviewSessionEnd + 86400
      // },
      'performance:mixin:WithKRA.kra': { $in: kras }
    }
  ))

  const score = await calculateScore(control, tasks, employeeKras)

  const taskRefs = tasks.map<Ref<PTask>>((task) => task._id)

  return control.txFactory.createTxUpdateDoc(createTx.objectClass, createTx.objectSpace, createTx.objectId, {
    tasks: taskRefs,
    scorePreview: score
  })
}

async function getScore (control: TriggerControl, ptask: PTask, progress: Progress | undefined): Promise<number> {
  // TODO: Handle this commented case properly
  if (progress === undefined) {
    const [status] = await control.queryFind(control.ctx, core.class.Status, { _id: ptask.status }, { limit: 1 })
    if (status?.category === taskPlugin.statusCategory.Won) {
      return 1
    } else {
      return 0
    }
    // return ptask.status === performance.status.Done ? 1 : 0
  }
  if (progress._class === performance.class.Progress) {
    return (progress.progress ?? 0) / 100
  } else if (progress._class === performance.class.Kpi) {
    const kpi = progress as Kpi
    const rs = (kpi.progress ?? 0) / (kpi.target ?? 1)
    if (isFinite(rs)) {
      return rs
    }
  }
  return 0
}

async function calculateScore (control: TriggerControl, tasks: PTask[], employeeKras: EmployeeKRA[]): Promise<number> {
  const tasksByKras: Record<Ref<KRA>, { tasks: PTask[], weight: number }> = {}
  let score: number = 0
  for (const ekra of employeeKras) {
    tasksByKras[ekra.kra] = {
      tasks: [],
      weight: ekra.weight
    }
  }
  for (const task of tasks) {
    if (task.kra === undefined) continue
    tasksByKras[task.kra].tasks.push(task)
  }
  for (const ekra of employeeKras) {
    let sum = 0
    const entry = tasksByKras[ekra.kra]
    if (entry.tasks.length === 0) continue
    for (const task of entry.tasks) {
      const find = await control.findAll(control.ctx, performance.class.Progress, { _id: task.progress }, { limit: 1 })
      const progress = find !== undefined && find.length > 0 ? find[0] : undefined
      sum += await getScore(control, task, progress)
    }
    score += (sum / entry.tasks.length) * entry.weight
  }
  return score
}
