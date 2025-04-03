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

import type { Arr, Attribute, Class, Doc, Mixin, Ref, SpaceType, SpaceTypeDescriptor, Status, Timestamp } from '@hcengineering/core'
import { Team } from '@hcengineering/kra-team'
import { Asset, IntlString, plugin, Plugin } from '@hcengineering/platform'
import type { Project, ProjectType, Task, TaskType, TaskTypeDescriptor} from '@hcengineering/task'
import { Viewlet } from '@hcengineering/view'

export interface ReviewSessionStatus extends Status {}

export interface KRAStatus extends Status {}

export interface ReviewSession extends Project {
  reviewSessionStatus: Ref<ReviewSessionStatus>
  reviewSessionStart: Timestamp
  reviewSessionEnd: Timestamp
  kras?: Arr<Ref<KRA>>
  team: Ref<Team>
}

export interface KRA extends Task {
  title: string
  description: string
  kraStatus: Ref<KRAStatus>
}

export const performanceId = 'performance' as Plugin

export default plugin(performanceId, {
  app: {
    Performance: '' as Ref<Doc>
  },
  attribute: {
    ReviewSessionAttribute: '' as Ref<Attribute<ReviewSessionStatus>>,
    KRAStatusAttribute: '' as Ref<Attribute<KRAStatus>>,
  },
  class: {
    ReviewSessionStatus: '' as Ref<Class<ReviewSessionStatus>>,
    KRAStatus: '' as Ref<Class<KRAStatus>>,
    ReviewSession: '' as Ref<Class<ReviewSession>>,
    KRA: '' as Ref<Class<KRA>>
  },
  string: {
    ReviewSessionStatus: '' as IntlString,
    ReviewSessionStart: '' as IntlString,
    ReviewSessionEnd: '' as IntlString,
    ReviewSessionKRAs: '' as IntlString,
    Title: '' as IntlString,
    Description: '' as IntlString,
    KRAStatus: '' as IntlString,
    IsArchived: '' as IntlString,
    Assignee: '' as IntlString,
    NoReviewSessions: '' as IntlString,
  },
  reviewSessionStatus: {
    Drafting: '' as Ref<ReviewSessionStatus>,
    InProgress: '' as Ref<ReviewSessionStatus>,
    Concluded: '' as Ref<ReviewSessionStatus>,
  },
  kraStatus: {
    Drafting: '' as Ref<KRAStatus>,
    NeedChanges: '' as Ref<KRAStatus>,
    Approved: '' as Ref<KRAStatus>,
    InProgress: '' as Ref<KRAStatus>,
    Archived: '' as Ref<KRAStatus>,
  },
  viewlet: {
    ReviewSessionTable: '' as Ref<Viewlet>,
  },
  mixin: {
    DefaultReviewSessionData: '' as Ref<Mixin<ReviewSession>>,
    DefaultKRAData: '' as Ref<Mixin<KRA>>,
  },
  taskTypes: {
    KRA: '' as Ref<TaskType>
  },
  ids: {
    ClassingProjectType: '' as Ref<ProjectType>
  },
  icon: {
    ReviewSession: '' as Asset,
    KRA: '' as Asset,
  },
  descriptor: {
    KRAType: '' as Ref<TaskTypeDescriptor>,
    ReviewSessionType: '' as Ref<SpaceTypeDescriptor>
  },
  spaceType: {
    ReviewSessionType: '' as Ref<SpaceType>
  }
})
