import core, {
  type AttachedData,
  type DocumentQuery,
  type Rank,
  SortingOrder,
  type Space,
  type Status,
  type Ref,
  type TxOperations,
  type Attribute,
  type Doc,
  type Client,
  type QuerySelector,
  type ObjQueryType
} from '@hcengineering/core'
import {
  type KRA,
  type EmployeeKRA,
  type WithKRA,
  type PTask
} from '@hcengineering/performance'
import performance from '../plugin'
import task, { makeRank } from '@hcengineering/task'
import { getClient } from '@hcengineering/presentation'
import type { Member } from '@hcengineering/kra-team'

export async function getFirstRank (
  client: TxOperations,
  space: Ref<Space>,
  sort: SortingOrder = SortingOrder.Descending,
  extra: DocumentQuery<KRA> = {}
): Promise<Rank | undefined> {
  const doc = await client.findOne(
    performance.class.KRA,
    { space, ...extra },
    { sort: { rank: sort }, projection: { rank: 1 } }
  )

  return doc?.rank
}

export async function createKRA (
  client: TxOperations,
  title: string,
  description: string,
  space: Ref<Space>,
  status: Ref<Status>,
  attributes: Partial<AttachedData<KRA>> & { kind: KRA['kind'] }
): Promise<Ref<KRA>> {
  const sequence = await client.findOne(core.class.Sequence, { attachedTo: performance.class.KRA })
  if (sequence === undefined) {
    throw new Error('sequence object not found')
  }

  const lastOne = await client.findOne(performance.class.KRA, {}, { sort: { rank: SortingOrder.Descending } })
  const incResult = await client.update(sequence, { $inc: { sequence: 1 } }, true)
  const number = (incResult as any).object.sequence
  const rank = makeRank(lastOne?.rank, undefined)

  const object: AttachedData<KRA> = {
    title,
    status,
    dueDate: null,
    number,
    rank,
    assignee: null,
    assignedTo: [],
    identifier: `KRA-${number}`,
    description,
    ...attributes
  }

  return await client.addCollection(
    performance.class.KRA,
    space,
    space,
    performance.class.ReviewSession,
    'kras',
    object
  )
}

export async function calculateCompletionLevel (task: Ref<PTask> | PTask): Promise<number | undefined> {
  const client = getClient()
  async function calculate (task: PTask): Promise<number | undefined> {
    if (task.progress !== undefined) {
      const p = await client.findOne(performance.class.Progress, { _id: task.progress })
      if (p === undefined) {
        return undefined
      }
      const rs = (p.progress ?? 0) / p.target
      return isFinite(rs) ? rs : undefined
    }
  }

  if (typeof task === 'object') {
    const d = await calculate(task)
    return d
  } else {
    const _task = await client.findOne(performance.class.PTask, { _id: task })
    if (_task !== undefined) {
      const d = await calculate(_task)
      return d
    }
  }
  return undefined
}

async function getKRAsOfEmployeeKRA (client: Client, query: DocumentQuery<EmployeeKRA>): Promise<Array<Ref<KRA>>> {
  const res = (await client.findAll(performance.class.KRA, query as DocumentQuery<KRA>)).map((kra) => kra._id)
  return res
}

async function getKRAsOfTask (client: Client, query: DocumentQuery<WithKRA>): Promise<Array<Ref<KRA>>> {
  // TODO: Refactor when `assignedTo` in `KRA` is added
  let kraQuery: ObjQueryType<Ref<KRA>> = {}
  if (query.kra === undefined) return []
  if (typeof query.kra !== 'string' && query.kra.$in !== undefined) {
    kraQuery = query.kra as QuerySelector<Ref<KRA>>
  }
  const space = await client
    .findOne(performance.class.KRA, { _id: kraQuery }, { projection: { space: 1 } })
    .then((kra) => kra?.space)
  const assignee = query.assignee as QuerySelector<Ref<Member>>
  const res = (await client.findAll(performance.class.EmployeeKRA, { space, kra: kraQuery, assignee })).map((kra) => kra.kra)

  console.log('getKRAsOfTask', res, query, space)
  return res
}

export async function getAllKRAs (
  query: DocumentQuery<Doc<Space>> | undefined,
  _onUpdate: () => void,
  _queryId: Ref<Doc<Space>>,
  attr: Attribute<Status>
): Promise<Array<Ref<KRA>>> {
  const client = getClient()
  const hierarchy = client.getHierarchy()
  if (hierarchy.isDerived(attr.attributeOf, performance.class.EmployeeKRA)) {
    return await getKRAsOfEmployeeKRA(client, query as DocumentQuery<EmployeeKRA>)
  } else if (hierarchy.isDerived(attr.attributeOf, task.class.Task)) {
    return await getKRAsOfTask(client, query as DocumentQuery<WithKRA>)
  }
  return []
}
