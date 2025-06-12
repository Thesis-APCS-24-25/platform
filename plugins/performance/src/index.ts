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

import { type PersonAccount } from '@hcengineering/contact'
import type { Arr, Attribute, Class, Doc, Mixin, Obj, Ref, SpaceType, SpaceTypeDescriptor, Status, Timestamp, Type } from '@hcengineering/core'
import { Asset, IntlString, plugin, Plugin, Resource } from '@hcengineering/platform'
import type { Project, ProjectType, Task, TaskType, TaskTypeDescriptor } from '@hcengineering/task'
import { AnyComponent } from '@hcengineering/ui'
import { Viewlet, ViewletDescriptor } from '@hcengineering/view'

export enum ReviewSessionStatus {
  Drafting,
  InProgress,
  Concluded
}

export interface KRAStatus extends Status {}

export interface ReviewSession extends Project {
  reviewSessionStart: Timestamp
  reviewSessionEnd: Timestamp
  status?: ReviewSessionStatus
}

export interface KRA extends Task {
  title: string
  description: string
  kraStatus: Ref<KRAStatus>
  color?: number
}

export interface EmployeeKRA extends Doc {
  kra: Ref<KRA>
  employee: Ref<PersonAccount>
  weight: number
}

export interface MeasureProgress extends Class<Task> {
  calculate: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

export interface ProgressPresenter extends Class<Task> {
  presenter: AnyComponent
}

/**
 * Allow to create new action items for KRA
 * `component` will be created with `kra` and `assignee` props
 */
export interface ActionItemFactory extends Class<Task> {
  component: AnyComponent
}

export interface WithKRA extends Task {
  kra?: Ref<KRA>
}

export interface PerformanceReport extends Doc {
  reviewee: Ref<PersonAccount>
  reviewSession: Ref<ReviewSession>
  tasks?: Arr<Ref<WithKRA>>
  scorePreview?: number
}

export interface PerformanceReview extends Doc {
  report: Ref<PerformanceReport>
  content: string
  score: number
}

export const performanceId = 'performance' as Plugin

export default plugin(performanceId, {
  attribute: {
    KRAStatus: '' as Ref<Attribute<KRAStatus>>
  },
  class: {
    KRAStatus: '' as Ref<Class<KRAStatus>>,
    ReviewSession: '' as Ref<Class<ReviewSession>>,
    KRA: '' as Ref<Class<KRA>>,
    EmployeeKRA: '' as Ref<Class<EmployeeKRA>>,
    PerformanceReport: '' as Ref<Class<PerformanceReport>>,
    PerformanceReview: '' as Ref<Class<PerformanceReview>>,
    TypeReviewSessionStatus: '' as Ref<Class<Type<ReviewSessionStatus>>>
  },
  string: {
    KRA: '' as IntlString,
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
    ReviewContent: '' as IntlString
  },
  kraStatus: {
    Drafting: '' as Ref<KRAStatus>,
    NeedChanges: '' as Ref<KRAStatus>,
    Approved: '' as Ref<KRAStatus>,
    Cancelled: '' as Ref<KRAStatus>
  },
  viewlet: {
    TaskList: '' as Ref<ViewletDescriptor>,
    WithKRAList: '' as Ref<Viewlet>
  },
  mixin: {
    ActionItemFactory: '' as Ref<Mixin<ActionItemFactory>>,
    DefaultReviewSessionData: '' as Ref<Mixin<ReviewSession>>,
    DefaultKRAData: '' as Ref<Mixin<KRA>>,
    WithKRA: '' as Ref<Mixin<WithKRA>>,
    MeasureProgress: '' as Ref<Mixin<MeasureProgress>>,
    ProgressPresenter: '' as Ref<Mixin<ProgressPresenter>>
  },
  taskTypes: {
    KRA: '' as Ref<TaskType>
  },
  ids: {
    ClassingProjectType: '' as Ref<ProjectType>,
    NoKRARef: '' as Ref<KRA>
  },
  icon: {
    StartReviewSession: '' as Asset,
    Active: '' as Asset,
    Weight: '' as Asset,
    AssignKRA: '' as Asset,
    ReviewSession: '' as Asset,
    KRA: '' as Asset,
    StatusInProgress: '' as Asset,
    StatusConcluded: '' as Asset,
    PerformanceReview: '' as Asset
  },
  descriptor: {
    KRAType: '' as Ref<TaskTypeDescriptor>,
    ReviewSessionType: '' as Ref<SpaceTypeDescriptor>
  },
  spaceType: {
    ReviewSessionType: '' as Ref<SpaceType>
  }
})
