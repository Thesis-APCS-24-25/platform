import core, { Account, Ref, Role, Tx, TxCreateDoc, TxUpdateDoc, TypedSpace } from '@hcengineering/core'
import performance, {
  PTask,
  EmployeeKRA,
  KRA,
  PerformanceReport,
  Progress,
  ReviewSession,
  taskCompletionLevelFormula
} from '@hcengineering/performance'
import { TriggerControl } from '@hcengineering/server-core'
import contact from '@hcengineering/contact'
import task from '@hcengineering/task'

export async function checkRole (
  control: TriggerControl,
  account: Ref<Account>,
  _id: Ref<Role>,
  _space: Ref<TypedSpace>,
  space?: TypedSpace
): Promise<boolean> {
  space = space ?? (await control.findAll(control.ctx, core.class.TypedSpace, { _id: _space }, { limit: 1 }))[0]
  const type = await control.modelDb
    .findOne(core.class.SpaceType, { _id: space?.type }, { lookup: { _id: { roles: core.class.Role } } })
  const mixin = type?.targetClass
  if (space === undefined || type === undefined || mixin === undefined) {
    return false
  }

  const asMixin = control.hierarchy.as(space, mixin)
  return (asMixin as any)[_id]?.includes(account)
}

export function addUpdates (
  control: TriggerControl,
  member: Ref<Account>,
  reviewSessions: ReviewSession[],
  isPull: boolean
): Tx[] {
  const result: Tx[] = []

  for (const rs of reviewSessions) {
    if (!rs.members.includes(member)) continue
    const payload = isPull ? { $pull: { members: member } } : { $push: { members: member } }
    const updateTx = control.txFactory.createTxUpdateDoc(rs._class, rs.space, rs._id, payload)
    result.push(updateTx)
  }
  return result
}

export async function prepareReport (
  control: TriggerControl,
  createTx: TxCreateDoc<PerformanceReport>,
  create: boolean = false
): Promise<TxUpdateDoc<PerformanceReport> | TxCreateDoc<PerformanceReport>> {
  const assignee = (
    await control.findAll(control.ctx, contact.class.PersonAccount, { _id: createTx.attributes.reviewee }, { limit: 1 })
  )[0]
  const reviewSession = (
    await control.findAll(
      control.ctx,
      performance.class.ReviewSession,
      { _id: createTx.attributes.reviewSession },
      { limit: 1 }
    )
  )[0]
  const employeeKras = await control.findAll(control.ctx, performance.class.EmployeeKRA, {
    space: reviewSession._id,
    assignee: assignee.person
  })
  const kras = employeeKras.map((v) => v.kra)
  const tasks1 = await control.findAll(control.ctx, performance.class.PTask, {
    assignee: assignee.person,
    startDate: { $lte: reviewSession.reviewSessionEnd + 86400 },
    dueDate: { $gte: reviewSession.reviewSessionStart }
  })
  const tasks2 = await control.findAll(control.ctx, performance.class.PTask, {
    assignee: assignee.person,
    kra: { $in: kras.length > 0 ? kras : [] }
  })
  const tasksSet = new Set([...tasks1, ...tasks2])
  const tasks = Array.from(tasksSet)

  const score = await calculateScore(control, tasks, employeeKras)

  const taskRefs = tasks.map<Ref<PTask>>((task) => task._id)

  if (create) {
    const create = createTx
    create.attributes = {
      ...createTx.attributes,
      tasks: taskRefs,
      scorePreview: Math.round(score)
    }
    return create
  }
  return control.txFactory.createTxUpdateDoc(createTx.objectClass, createTx.objectSpace, createTx.objectId, {
    tasks: taskRefs,
    scorePreview: Math.round(score)
  })
}

async function getScore (control: TriggerControl, ptask: PTask, progress: Progress | null): Promise<number | null> {
  const [status] = await control.findAll(control.ctx, core.class.Status, { _id: ptask.status }, { limit: 1 })
  return taskCompletionLevelFormula(status.category ?? task.statusCategory.Lost, progress ?? null) ?? 0
}

async function calculateScore (control: TriggerControl, tasks: PTask[], employeeKras: EmployeeKRA[]): Promise<number> {
  const tasksByKras: Record<Ref<KRA>, { tasks: PTask[], weight: number }> = {}
  let total: number = 0
  for (const ekra of employeeKras) {
    tasksByKras[ekra.kra] = {
      tasks: [],
      weight: ekra.weight
    }
  }
  for (const task of tasks) {
    if (task.kra == null || task.kra === performance.ids.NoKRARef) continue
    tasksByKras[task.kra].tasks.push(task)
  }
  for (const ekra of employeeKras) {
    let sum = 0
    const entry = tasksByKras[ekra.kra]
    if (entry.tasks.length === 0) continue
    let includedTasks = 0
    for (const task of entry.tasks) {
      let progress: Progress | null = null
      if (task.progress != null) {
        const find = await control.findAll(control.ctx, performance.class.Progress, { _id: task.progress }, { limit: 1 })
        progress = find !== undefined && find.length > 0 ? find[0] : null
      }
      const score = await getScore(control, task, progress)
      sum += score ?? 0
      includedTasks += score != null ? 1 : 0
    }
    if (includedTasks > 0) total += (sum / includedTasks) * entry.weight
  }
  return total ?? 0
}
