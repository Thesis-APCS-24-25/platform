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
import type { Arr, Attribute, Class, Doc, Mixin, Ref, SpaceType, SpaceTypeDescriptor, Status, Timestamp, Type } from '@hcengineering/core'
import { Asset, IntlString, plugin, Plugin, Resource } from '@hcengineering/platform'
import type { Project, ProjectType, Task, TaskType, TaskTypeDescriptor } from '@hcengineering/task'
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
}

export interface EmployeeKRA extends Doc {
  kra: Ref<KRA>
  employee: Ref<PersonAccount>
  weight: number
}

export interface MeasureProgress extends Class<Task> {
  calculate: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

export interface WithKRA extends Task { }

// export interface ReviewComment extends Doc {
//   author: Ref<PersonAccount>
//   comment: string
//   score?: number
// }

export interface PerformanceReport extends Doc {
  reviewee: Ref<PersonAccount>
  reviewSession: Ref<ReviewSession>
  tasks?: Arr<Ref<WithKRA>>
}

export const performanceId = 'performance' as Plugin

export default plugin(performanceId, {
  app: {
    Performance: '' as Ref<Doc>
  },
  attribute: {
    KRAStatus: '' as Ref<Attribute<KRAStatus>>
  },
  class: {
    KRAStatus: '' as Ref<Class<KRAStatus>>,
    ReviewSession: '' as Ref<Class<ReviewSession>>,
    KRA: '' as Ref<Class<KRA>>,
    EmployeeKRA: '' as Ref<Class<EmployeeKRA>>,
    PerformanceReport: '' as Ref<Class<PerformanceReport>>,
    TypeReviewSessionStatus: '' as Ref<Class<Type<ReviewSessionStatus>>>
  },
  string: {
    KRA: '' as IntlString,
    ReviewSessionStart: '' as IntlString,
    ReviewSessionEnd: '' as IntlString,
    ReviewSessionKRAs: '' as IntlString,
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
    ReviewSessionStatus: '' as IntlString
  },
  kraStatus: {
    Drafting: '' as Ref<KRAStatus>,
    NeedChanges: '' as Ref<KRAStatus>,
    Approved: '' as Ref<KRAStatus>,
    InProgress: '' as Ref<KRAStatus>,
    Archived: '' as Ref<KRAStatus>
  },
  viewlet: {
    TaskList: '' as Ref<ViewletDescriptor>,
    WithKRAList: '' as Ref<Viewlet>
  },
  mixin: {
    DefaultReviewSessionData: '' as Ref<Mixin<ReviewSession>>,
    DefaultKRAData: '' as Ref<Mixin<KRA>>,
    WithKRA: '' as Ref<Mixin<WithKRA>>,
    MeasureProgress: '' as Ref<Mixin<MeasureProgress>>
  },
  taskTypes: {
    KRA: '' as Ref<TaskType>
  },
  ids: {
    ClassingProjectType: '' as Ref<ProjectType>,
    NoKRARef: '' as Ref<KRA>
  },
  icon: {
    Weight: '' as Asset,
    AssignKRA: '' as Asset,
    ReviewSession: '' as Asset,
    KRA: '' as Asset,
    StatusInProgress: '' as Asset
  },
  descriptor: {
    KRAType: '' as Ref<TaskTypeDescriptor>,
    ReviewSessionType: '' as Ref<SpaceTypeDescriptor>
  },
  spaceType: {
    ReviewSessionType: '' as Ref<SpaceType>
  }
})
