//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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

import { Person, type PersonAccount } from '@hcengineering/contact'
import type {
  Arr,
  AttachedDoc,
  Class,
  CollectionSize,
  Doc,
  Markup,
  Mixin,
  Ref,
  RelatedDocument,
  SpaceType,
  SpaceTypeDescriptor,
  StatusCategory,
  Timestamp,
  Type
} from '@hcengineering/core'
import { Member } from '@hcengineering/kra-team'
import { Asset, IntlString, plugin, Plugin, Resource } from '@hcengineering/platform'
import type { Project, ProjectType, Task, TaskType, TaskTypeDescriptor } from '@hcengineering/task'
import { AnyComponent } from '@hcengineering/ui'
import { Action, ViewAction, Viewlet, ViewletDescriptor } from '@hcengineering/view'
import { ChatMessageViewlet } from '@hcengineering/chunter'
import task from '@hcengineering/task'

export enum ReportDayType {
  CurrentWorkDay = 'CurrentWorkDay',
  PreviousWorkDay = 'PreviousWorkDay'
}

export interface Progress extends Doc {
  task: Ref<PTask>
  name?: string
  description?: string
  reports: CollectionSize<Report>
  progress: number | null
}

export interface Kpi extends Progress {
  target: number
  unit: Ref<Unit>
}

export interface Unit extends Doc {
  name: string
  symbol: string
  prefix: boolean
}

export interface ProgressReport extends AttachedDoc {
  attachedTo: Ref<Progress>
  attachedToClass: Ref<Class<Progress>>
  date: Timestamp | null
  reportBy: Ref<Person> | null
  value: number
  note: string
}

export interface PTask extends Task {
  title: string
  startDate: Timestamp | null
  kra: Ref<KRA> | null
  progress: Ref<Progress> | null
  blockedBy?: RelatedDocument[]
  relations?: RelatedDocument[]
}

export enum ReviewSessionStatus {
  Drafting,
  InProgress,
  Concluded
}

export enum KRAStatus {
  Drafting,
  NeedChanges,
  Approved
}

export interface ReviewSession extends Project {
  reviewSessionStart: Timestamp
  reviewSessionEnd: Timestamp
  identifier: string
  status?: ReviewSessionStatus
  sequence: number

  allowMembersToCommentOnReport?: boolean
}

export interface KRA extends Task {
  title: string
  description: string
  color?: number
  // keep track of assigned members, will be updated in server
  assignedTo: Array<Ref<Person>>
}

export interface EmployeeKRA extends Doc {
  status: KRAStatus
  kra: Ref<KRA>
  assignee: Ref<Member>
  weight: number
}

export interface MeasureProgress extends Class<Task> {
  calculate: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

export interface ProgressPresenter extends Class<Task> {
  presenter: AnyComponent
}

export function taskCompletionLevelFormula (
  taskStatusCategory: Ref<StatusCategory>,
  progress: Progress | null
): number | null {
  if (taskStatusCategory === task.statusCategory.Lost) {
    return null
  }
  if (progress?._class === performancePlugin.class.Progress) {
    return (progress.progress ?? 0) / 100
  }
  if (progress?._class === performancePlugin.class.Kpi) {
    return (progress.progress ?? 0) / (progress as Kpi).target
  }

  if (progress == null && taskStatusCategory === task.statusCategory.Won) {
    return 1 // Task is won, no progress is set, so we assume it's completed
  }
  return 0
}

/**
 * Allow to create new action items for KRA
 * `component` will be created with `kra` and `assignee` props
 */
export interface ActionItemFactory extends Class<Task> {
  component: AnyComponent
}

export interface PerformanceReport extends Doc {
  reviewee: Ref<PersonAccount>
  reviewSession: Ref<ReviewSession>
  tasks?: Arr<Ref<PTask>>
  scorePreview: number | null // calculated score preview

  score: number | null // final score
  content: Markup | null // final report content
  reviewer: Ref<PersonAccount> | null // person who wrote the report
}

// export interface PerformanceReview extends Doc {
//   report: Ref<PerformanceReport>
//   content: string
//   score: number
// }
//
export const performanceId = 'performance' as Plugin

const performancePlugin = plugin(performanceId, {
  class: {
    Kpi: '' as Ref<Class<Kpi>>,
    Progress: '' as Ref<Class<Progress>>,
    Unit: '' as Ref<Class<Unit>>,
    ProgressReport: '' as Ref<Class<ProgressReport>>,
    PTask: '' as Ref<Class<PTask>>,
    ReviewSession: '' as Ref<Class<ReviewSession>>,
    KRA: '' as Ref<Class<KRA>>,
    EmployeeKRA: '' as Ref<Class<EmployeeKRA>>,
    PerformanceReport: '' as Ref<Class<PerformanceReport>>,
    // PerformanceReview: '' as Ref<Class<PerformanceReview>>,
    TypeKRAStatus: '' as Ref<Class<Type<KRAStatus>>>,
    TypeReviewSessionStatus: '' as Ref<Class<Type<ReviewSessionStatus>>>
  },
  string: {
    NotGiven: '' as IntlString,
    TrackProgress: '' as IntlString,
    CompletionLevelTracking: '' as IntlString,
    KpiTracking: '' as IntlString,
    TrackCompletionLevel: '' as IntlString,
    TrackKpi: '' as IntlString,
    SetKpi: '' as IntlString,
    BlockedTasks: '' as IntlString,
    FinishedBlockedTasks: '' as IntlString,
    UnnamedProgress: '' as IntlString,
    NoKRASelected: '' as IntlString,
    Progress: '' as IntlString,
    AddUnit: '' as IntlString,
    AddNamePlaceholder: '' as IntlString,
    AddSymbolPlaceholder: '' as IntlString,
    Prefix: '' as IntlString,
    SelectUnit: '' as IntlString,
    Issue: '' as IntlString,
    AddKpi: '' as IntlString,
    ChooseTemplate: '' as IntlString,
    AddTargetPlaceholder: '' as IntlString,
    UseAsTemplate: '' as IntlString,
    Edit: '' as IntlString,
    RemoveGoal: '' as IntlString,
    Task: '' as IntlString,
    Reports: '' as IntlString,
    PassedDays: '' as IntlString,
    RemainingDays: '' as IntlString,
    KRA: '' as IntlString,
    RemoveProgress: '' as IntlString,
    SetProgress: '' as IntlString,
    ReviewSessionStart: '' as IntlString,
    ReviewSessionEnd: '' as IntlString,
    SetKRA: '' as IntlString,
    Title: '' as IntlString,
    Description: '' as IntlString,
    KRAStatus: '' as IntlString,
    IsArchived: '' as IntlString,
    Assignee: '' as IntlString,
    NoReviewSessions: '' as IntlString,
    AttachedKRA: '' as IntlString,
    AttachedEmployee: '' as IntlString,
    KRAWeight: '' as IntlString,
    NoKRA: '' as IntlString,
    Active: '' as IntlString,
    ReviewSessionStatus: '' as IntlString,
    KRACompletionLevel: '' as IntlString,
    ScorePreview: '' as IntlString,
    PerformanceReport: '' as IntlString,
    ReviewContent: '' as IntlString,
    ApproveKRA: '' as IntlString,
    DeleteReviewSessionName: '' as IntlString,
    DeleteReviewSessionConfirm: '' as IntlString,
    ArchiveReviewSessionName: '' as IntlString,
    ReviewSessionHasKRAs: '' as IntlString,
    ArchiveReviewSessionConfirm: '' as IntlString
  },
  viewlet: {
    TaskList: '' as Ref<ViewletDescriptor>,
    WithKRAList: '' as Ref<Viewlet>
  },
  mixin: {
    ActionItemFactory: '' as Ref<Mixin<ActionItemFactory>>,
    DefaultReviewSessionData: '' as Ref<Mixin<ReviewSession>>,
    DefaultKRAData: '' as Ref<Mixin<KRA>>,
    MeasureProgress: '' as Ref<Mixin<MeasureProgress>>,
    ProgressPresenter: '' as Ref<Mixin<ProgressPresenter>>
  },
  taskTypes: {
    KRA: '' as Ref<TaskType>
  },
  action: {
    ApproveKRA: '' as Ref<Action<Doc, Record<string, any>>>,
    DeleteReviewSession: '' as Ref<Action<Doc, Record<string, any>>>,
    DeleteReviewSessionClean: '' as Ref<Action<Doc, Record<string, any>>>
  },
  actionImpl: {
    ApproveKRA: '' as ViewAction,
    DeleteReviewSession: '' as ViewAction
  },
  ids: {
    ClassingProjectType: '' as Ref<ProjectType>,
    EmployeeKRAMessageViewlet: '' as Ref<ChatMessageViewlet>,
    PerformanceReportMessageViewlet: '' as Ref<ChatMessageViewlet>,
    NoKRARef: '' as Ref<KRA>
  },
  icon: {
    Reports: '' as Asset,
    BlockedTask: '' as Asset,
    Unit: '' as Asset,
    Kpi: '' as Asset,
    TimeLeft: '' as Asset,
    EmployeeKRA: '' as Asset,
    ConcludeReviewSession: '' as Asset,
    StatusDrafting: '' as Asset,
    StatusNeedChanges: '' as Asset,
    StatusApproved: '' as Asset,
    StatusCancelled: '' as Asset,
    StartReviewSession: '' as Asset,
    Active: '' as Asset,
    Weight: '' as Asset,
    AssignKRA: '' as Asset,
    ReviewSession: '' as Asset,
    KRA: '' as Asset,
    StatusInProgress: '' as Asset,
    StatusConcluded: '' as Asset,
    PerformanceReview: '' as Asset,
    Progress: '' as Asset,
    WriteReport: '' as Asset,
    EditReview: '' as Asset
  },
  descriptor: {
    KRAType: '' as Ref<TaskTypeDescriptor>,
    ReviewSessionType: '' as Ref<SpaceTypeDescriptor>
  },
  spaceType: {
    ReviewSessionType: '' as Ref<SpaceType>
  }
})

export default performancePlugin
