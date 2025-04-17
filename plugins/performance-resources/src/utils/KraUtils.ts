import core, { type AttachedData, type DocumentQuery, type Rank, SortingOrder, type Space, type Status, type Ref, type TxOperations } from '@hcengineering/core'
import { type KRA, type KRAStatus, type ReviewSession } from '@hcengineering/performance'
import performance from '../plugin'
import task, { getStatusIndex, makeRank, type Task, type ProjectType } from '@hcengineering/task'
import { type ViewletDescriptor } from '@hcengineering/view'
import { taskTypeStore } from '@hcengineering/task-resources'
import { get } from 'svelte/store'
import { statusStore } from '@hcengineering/view-resources'

export const listKRAStatusOrder = [
  performance.kraStatus.InProgress,
  performance.kraStatus.Approved,
  performance.kraStatus.NeedChanges,
  performance.kraStatus.Drafting,
  performance.kraStatus.Archived
] as const

export async function kraStatusSort (
  client: TxOperations,
  value: Array<Ref<KRAStatus>>,
  space: Ref<ReviewSession> | undefined,
  viewletDescriptorId?: Ref<ViewletDescriptor>
): Promise<Array<Ref<KRAStatus>>> {
  let type: ProjectType | undefined
  if (space !== undefined) {
    const _space = await client.findOne(
      performance.class.ReviewSession,
      { _id: space },
      {
        lookup: {
          type: task.class.ProjectType
        }
      }
    )
    type = _space?.$lookup?.type
  }
  const taskTypes = get(taskTypeStore)
  const statuses = get(statusStore).byId
  // TODO: How we track category updates.

  //   if (viewletDescriptorId === tracker.viewlet.Kanban) {
  //     value.sort((a, b) => {
  //       const aVal = statuses.get(a)
  //       const bVal = statuses.get(b)
  //       const res =
  //         listIssueKanbanStatusOrder.indexOf(aVal?.category as Ref<StatusCategory>) -
  //         listIssueKanbanStatusOrder.indexOf(bVal?.category as Ref<StatusCategory>)
  //       if (res === 0) {
  //         if (type != null) {
  //           const aIndex = getStatusIndex(type, taskTypes, a)
  //           const bIndex = getStatusIndex(type, taskTypes, b)
  //           return aIndex - bIndex
  //         } else {
  //           return (aVal?.name ?? '').localeCompare(bVal?.name ?? '')
  //         }
  //       }
  //       return res
  //     })
  //   } else {
  value.sort((a, b) => {
    const aVal = statuses.get(a) as KRAStatus
    const bVal = statuses.get(b) as KRAStatus
    const res =
        listKRAStatusOrder.indexOf(aVal._id) -
        listKRAStatusOrder.indexOf(bVal._id)
    if (res === 0) {
      if (type != null) {
        const aIndex = getStatusIndex(type, taskTypes, a)
        const bIndex = getStatusIndex(type, taskTypes, b)
        return aIndex - bIndex
      } else if (aVal != null && bVal != null) {
        return aVal.name.localeCompare(bVal.name)
      }
    }
    return res
  })
  //   }
  return value
}

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
    kraStatus: performance.kraStatus.Drafting,
    dueDate: null,
    number,
    rank,
    assignee: null,
    identifier: `KRA-${number}`,
    description,
    ...attributes
  }

  return await client.addCollection(performance.class.KRA, space, space, performance.class.ReviewSession, 'kras', object)
}

export async function calculateCompletionLevel (task: Ref<Task>): Promise<number | undefined> {
  // TODO: implement completion level
  return undefined
}
