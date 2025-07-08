//
// Copyright © 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { type Contact } from '@hcengineering/contact'
import core, {
  SortingOrder,
  toIdMap,
  type ApplyOperations,
  type AttachedData,
  type AttachedDoc,
  type Class,
  type Collection,
  type Doc,
  type DocumentQuery,
  type DocumentUpdate,
  type Ref,
  type Space,
  type Status,
  type StatusCategory,
  type TxCreateDoc,
  type TxOperations,
  type TxUpdateDoc
} from '@hcengineering/core'
import { type IntlString } from '@hcengineering/platform'
import { createQuery, getClient, onClient } from '@hcengineering/presentation'
import task, { getStatusIndex, makeRank, type Task, type ProjectType } from '@hcengineering/task'
import { activeProjects as taskActiveProjects, taskTypeStore } from '@hcengineering/task-resources'
import {
  IssuePriority,
  TimeReportDayType,
  type Issue,
  type IssueStatus,
  type Project
} from '@hcengineering/kra'
import { PaletteColorIndexes, areDatesEqual, isWeekend } from '@hcengineering/ui'
import { type KeyFilter, type ViewletDescriptor } from '@hcengineering/view'
import { CategoryQuery, ListSelectionProvider, statusStore, type SelectDirection } from '@hcengineering/view-resources'
import { derived, get, writable } from 'svelte/store'
import tracker from './plugin'
import { defaultPriorities } from './types'

export const activeProjects = derived(taskActiveProjects, (projects) => {
  const client = getClient()
  return toIdMap(
    Array.from(projects.values()).filter((it) => client.getHierarchy().isDerived(it._class, tracker.class.Project))
  ) as Map<Ref<Project>, Project>
})
export * from './types'

export type ComponentsFilterMode = 'all' | 'backlog' | 'active' | 'closed'

export type MilestoneViewMode = 'all' | 'planned' | 'active' | 'closed'

export const componentsTitleMap: Record<ComponentsFilterMode, IntlString> = Object.freeze({
  all: tracker.string.AllComponents,
  backlog: tracker.string.BacklogComponents,
  active: tracker.string.ActiveComponents,
  closed: tracker.string.ClosedComponents
})

export const milestoneTitleMap: Record<MilestoneViewMode, IntlString> = Object.freeze({
  all: tracker.string.AllMilestones,
  planned: tracker.string.PlannedMilestones,
  active: tracker.string.ActiveMilestones,
  closed: tracker.string.ClosedMilestones
})

/**
 * @public
 */
export const listIssueStatusOrder = [
  task.statusCategory.Active,
  task.statusCategory.ToDo,
  task.statusCategory.UnStarted,
  task.statusCategory.Won,
  task.statusCategory.Lost
] as const

/**
 * @public
 */
export const listIssueKanbanStatusOrder = [
  task.statusCategory.UnStarted,
  task.statusCategory.ToDo,
  task.statusCategory.Active,
  task.statusCategory.Won,
  task.statusCategory.Lost
] as const

export async function issueStatusSort (
  client: TxOperations,
  value: Array<Ref<IssueStatus>>,
  space: Ref<Project> | undefined,
  viewletDescriptorId?: Ref<ViewletDescriptor>
): Promise<Array<Ref<IssueStatus>>> {
  let type: ProjectType | undefined
  if (space !== undefined) {
    const _space = await client.findOne(
      task.class.Project,
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

  if (viewletDescriptorId === tracker.viewlet.Kanban) {
    value.sort((a, b) => {
      const aVal = statuses.get(a)
      const bVal = statuses.get(b)
      const res =
        listIssueKanbanStatusOrder.indexOf(aVal?.category as Ref<StatusCategory>) -
        listIssueKanbanStatusOrder.indexOf(bVal?.category as Ref<StatusCategory>)
      if (res === 0) {
        if (type != null) {
          const aIndex = getStatusIndex(type, taskTypes, a)
          const bIndex = getStatusIndex(type, taskTypes, b)
          return aIndex - bIndex
        } else {
          return (aVal?.name ?? '').localeCompare(bVal?.name ?? '')
        }
      }
      return res
    })
  } else {
    value.sort((a, b) => {
      const aVal = statuses.get(a) as IssueStatus
      const bVal = statuses.get(b) as IssueStatus
      const res =
        listIssueStatusOrder.indexOf(aVal?.category as Ref<StatusCategory>) -
        listIssueStatusOrder.indexOf(bVal?.category as Ref<StatusCategory>)
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
  }
  return value
}

export async function issuePrioritySort (client: TxOperations, value: IssuePriority[]): Promise<IssuePriority[]> {
  value.sort((a, b) => {
    const i1 = defaultPriorities.indexOf(a)
    const i2 = defaultPriorities.indexOf(b)

    return i2 - i1
  })
  return value
}

export function getTimeReportDate (type: TimeReportDayType): number {
  const date = new Date(Date.now())

  if (type === TimeReportDayType.PreviousWorkDay) {
    date.setDate(date.getDate() - 1)
  }

  // if date is day off then set date to last working day
  while (isWeekend(date)) {
    date.setDate(date.getDate() - 1)
  }

  return date.valueOf()
}

export function getTimeReportDayType (timestamp: number): TimeReportDayType | undefined {
  const date = new Date(timestamp)
  const currentWorkDate = new Date(getTimeReportDate(TimeReportDayType.CurrentWorkDay))
  const previousWorkDate = new Date(getTimeReportDate(TimeReportDayType.PreviousWorkDay))

  if (areDatesEqual(date, currentWorkDate)) {
    return TimeReportDayType.CurrentWorkDay
  } else if (areDatesEqual(date, previousWorkDate)) {
    return TimeReportDayType.PreviousWorkDay
  }
}

export function subIssueQuery (value: boolean, query: DocumentQuery<Issue>): DocumentQuery<Issue> {
  return value ? query : { ...query, attachedTo: tracker.ids.NoParent }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAllSomething (
  _class: Ref<Class<Doc>>,
  query: DocumentQuery<Doc> | undefined,
  onUpdate: () => void,
  queryId: Ref<Doc>
): Promise<any[] | undefined> {
  const promise = new Promise<Array<Ref<Doc>>>((resolve, reject) => {
    let refresh: boolean = false
    const lq = CategoryQuery.getLiveQuery(queryId)
    refresh = lq.query(_class, query ?? {}, (res) => {
      const result = res.map((p) => p._id)
      CategoryQuery.results.set(queryId, result)
      resolve(result)
      onUpdate()
    })

    if (!refresh) {
      resolve(CategoryQuery.results.get(queryId) ?? [])
    }
  })
  return await promise
}

export async function getAllPriority (
  query: DocumentQuery<Doc> | undefined,
  onUpdate: () => void,
  queryId: Ref<Doc>
): Promise<any[] | undefined> {
  return defaultPriorities
}

export function subIssueListProvider (subIssues: Issue[], target: Ref<Issue>): void {
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0, of?: Doc, dir?: SelectDirection) => {
    if (dir === 'vertical') {
      let pos = subIssues.findIndex((p) => p._id === of?._id)
      pos += offset
      if (pos < 0) {
        pos = 0
      }
      if (pos >= subIssues.length) {
        pos = subIssues.length - 1
      }
      listProvider.updateFocus(subIssues[pos])
    }
  }, false)
  listProvider.update(subIssues)
  const selectedIssue = subIssues.find((p) => p._id === target)
  if (selectedIssue != null) {
    listProvider.updateFocus(selectedIssue)
  }
}

export async function getPreviousAssignees (objectId: Ref<Issue> | undefined): Promise<Array<Ref<Contact>>> {
  if (objectId === undefined) {
    return []
  }
  const client = getClient()
  const createTx = (
    await client.findAll<TxCreateDoc<Issue>>(core.class.TxCreateDoc, {
      objectId
    })
  )[0]
  const updateTxes = await client.findAll<TxUpdateDoc<Issue>>(
    core.class.TxUpdateDoc,
    { objectId, 'operations.assignee': { $exists: true } },
    { sort: { modifiedOn: -1 } }
  )
  const set = new Set<Ref<Contact>>()
  const createAssignee = createTx?.attributes?.assignee
  for (const tx of updateTxes) {
    const assignee = tx.operations.assignee
    if (assignee == null) continue
    set.add(assignee)
  }
  if (createAssignee != null) {
    set.add(createAssignee)
  }
  return Array.from(set)
}

async function updateIssuesOnMove (
  client: TxOperations,
  applyOps: ApplyOperations,
  doc: Doc,
  space: Project,
  extra: DocumentUpdate<any>,
  updates: Map<Ref<Issue>, DocumentUpdate<Issue>>
): Promise<void> {
  const hierarchy = client.getHierarchy()
  const attributes = hierarchy.getAllAttributes(doc._class)
  for (const attribute of attributes.values()) {
    if (hierarchy.isDerived(attribute.type._class, core.class.Collection)) {
      const collection = attribute.type as Collection<AttachedDoc>
      const allAttached = await client.findAll(collection.of, { attachedTo: doc._id })
      for (const attached of allAttached) {
        if (hierarchy.isDerived(collection.of, tracker.class.Issue)) {
          const lastOne = await client.findOne(tracker.class.Issue, {}, { sort: { rank: SortingOrder.Descending } })
          const incResult = await client.updateDoc(
            tracker.class.Project,
            core.space.Space,
            space._id,
            {
              $inc: { sequence: 1 }
            },
            true
          )
          const number = (incResult as any).object.sequence
          await updateIssuesOnMove(
            client,
            applyOps,
            attached,
            space,
            {
              ...updates.get(attached._id as Ref<Issue>),
              rank: makeRank(lastOne?.rank, undefined),
              number,
              identifier: `${space.identifier}-${number}`
            },
            updates
          )
        } else {
          await updateIssuesOnMove(client, applyOps, attached, space, {}, updates)
        }
      }
    }
  }
  await applyOps.update(doc, {
    space: space._id,
    ...extra
  })
}

/**
 * @public
 */
export async function moveIssueToSpace (
  client: TxOperations,
  docs: Issue[],
  space: Project,
  updates: Map<Ref<Issue>, DocumentUpdate<Issue>>
): Promise<void> {
  const applyOps = client.apply()
  for (const doc of docs) {
    const lastOne = await client.findOne(tracker.class.Issue, {}, { sort: { rank: SortingOrder.Descending } })
    const incResult = await client.updateDoc(
      tracker.class.Project,
      core.space.Space,
      space._id,
      {
        $inc: { sequence: 1 }
      },
      true
    )
    const number = (incResult as any).object.sequence
    await updateIssuesOnMove(
      client,
      applyOps,
      doc,
      space,
      {
        ...updates.get(doc._id),
        rank: makeRank(lastOne?.rank, undefined),
        number,
        identifier: `${space.identifier}-${number}`
      },
      updates
    )
  }
  await applyOps.commit()
}

/**
 * @public
 *
 * Will collect all issues to be moved.
 */
export async function collectIssues (client: TxOperations, docs: Doc[]): Promise<Issue[]> {
  const result: Issue[] = []
  const hierarchy = client.getHierarchy()
  for (const doc of docs) {
    if (hierarchy.isDerived(doc._class, tracker.class.Issue)) {
      result.push(doc as Issue)
    }

    const attributes = hierarchy.getAllAttributes(doc._class)
    for (const attribute of attributes.values()) {
      if (hierarchy.isDerived(attribute.type._class, core.class.Collection)) {
        const collection = attribute.type as Collection<AttachedDoc>
        const allAttached = await client.findAll(collection.of, { attachedTo: doc._id })
        for (const attached of allAttached) {
          if (hierarchy.isDerived(collection.of, tracker.class.Issue)) {
            if (result.find((it) => it._id === attached._id) === undefined) {
              result.push(attached as Issue)
            }
          }

          const subIssues = await collectIssues(client, [attached])
          if (subIssues.length > 0) {
            for (const s of subIssues) {
              if (result.find((it) => it._id === s._id) === undefined) {
                result.push(s)
              }
            }
          }
        }
      }
    }
  }
  return result
}

/**
 * @public
 */
export function issueToAttachedData (issue: Issue): AttachedData<Issue> {
  const { _id, _class, space, ...data } = issue
  return { ...data }
}

/**
 * @public
 */
export const IssuePriorityColor = {
  [IssuePriority.NoPriority]: PaletteColorIndexes.Blueberry,
  [IssuePriority.Urgent]: PaletteColorIndexes.Orange,
  [IssuePriority.High]: PaletteColorIndexes.Sunshine,
  [IssuePriority.Medium]: PaletteColorIndexes.Ocean,
  [IssuePriority.Low]: PaletteColorIndexes.Cloud
}

export async function getVisibleFilters (filters: KeyFilter[], space?: Ref<Space>): Promise<KeyFilter[]> {
  // Removes the "Project" filter if a specific space is provided
  return space === undefined ? filters : filters.filter((f) => f.key !== 'space')
}

export function getIssueChatTitle (object: Issue): string {
  return object.title
}

export function getIssueStatusCategories (project: ProjectType): Array<Ref<StatusCategory>> {
  if (project.classic) {
    return [
      task.statusCategory.UnStarted,
      task.statusCategory.ToDo,
      task.statusCategory.Active,
      task.statusCategory.Won,
      task.statusCategory.Lost
    ]
  } else {
    return [
      task.statusCategory.UnStarted,
      task.statusCategory.Active,
      task.statusCategory.Won,
      task.statusCategory.Lost
    ]
  }
}

interface ManualUpdates {
  useStatus: boolean
  useComponent: boolean
  createStatus: boolean
  createComponent: boolean
}
export type IssueToUpdate = DocumentUpdate<Issue> & Partial<ManualUpdates>

export interface IssueRef {
  status: Ref<Status>
  _id: Ref<Issue>
}
export type IssueReverseRevMap = Map<Ref<Doc>, IssueRef[]>
export const relatedIssues = writable<IssueReverseRevMap>(new Map())

const relatedIssuesQuery = createQuery(true)
onClient(() => {
  relatedIssuesQuery.query(
    tracker.class.Issue,
    { 'relations._id': { $exists: true } },
    (res) => {
      const nMap: IssueReverseRevMap = new Map()
      for (const r of res) {
        for (const rr of r.relations ?? []) {
          nMap.set(rr._id, [...(nMap.get(rr._id) ?? []), { _id: r._id, status: r.status }])
        }
      }
      relatedIssues.set(nMap)
    },
    {
      projection: {
        relations: 1,
        status: 1
      }
    }
  )
})

// TODO: copy this to @hcengineering/performance-resources
// export async function calculateCompletionLevel (taskId: Ref<Task>): Promise<number | undefined> {
//   const client = getClient()
//   const res = await client.findOne(task.class.Task, { _id: taskId })
//   const issue = res as Issue
//   const goal = await client.findOne(tracker.class.Goal, { _id: issue.goal })
//   if (goal === undefined) {
//     return issue.status === tracker.status.Done ? 1 : undefined
//   }
//   if (goal._class === tracker.class.Kpi) {
//     return (goal.progress ?? 0) / (goal as Kpi).target
//   }
//   if (goal._class === tracker.class.RatingScale) {
//     return (goal.progress ?? 0) / 5
//   }
// }
