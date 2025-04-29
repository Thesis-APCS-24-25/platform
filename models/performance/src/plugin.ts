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
import performance, { performanceId } from '@hcengineering/performance'
import type { Ref, StatusCategory } from '@hcengineering/core'
import { type IntlString, mergeIds } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui/src/types'
import { type GetAllValuesFunc, type SortFunc } from '@hcengineering/view'

export default mergeIds(performanceId, performance, {
  string: {
    PerformanceApplication: '' as IntlString,
    MyReviewSessions: '' as IntlString,
    CreateReviewSessionLabel: '' as IntlString,
    MyKRAs: '' as IntlString,
    CreateKraLabel: '' as IntlString,
    ReviewSessions: '' as IntlString,
    PerformanceDashboard: '' as IntlString,
    AssignedTo: '' as IntlString,
    AllReviewSessions: '' as IntlString
  },
  component: {
    MyKRAs: '' as AnyComponent,
    KRAAssigneesEditor: '' as AnyComponent,
    KRAEditor: '' as AnyComponent,
    KRARefPresenter: '' as AnyComponent,
    NewReviewSessionHeader: '' as AnyComponent,
    ReviewSessionSpacePresenter: '' as AnyComponent,
    CreateReviewSession: '' as AnyComponent,
    CreateKRA: '' as AnyComponent,
    KRAPresenter: '' as AnyComponent,
    EditKRA: '' as AnyComponent,
    TeamSpacePresenter: '' as AnyComponent,
    PerformanceDashboard: '' as AnyComponent
    // ReviewSessionStatusPresenter: '' as AnyComponent,
    // ReviewSessionStatusRefPresenter: '' as AnyComponent,
    // ReviewSessionStateEditor: '' as AnyComponent
  },
  function: {
    GetAllKRAStates: '' as GetAllValuesFunc,
    KRAStatusSort: '' as SortFunc
  },
  // reviewStatusCategory: {
  //   Drafting: '' as Ref<StatusCategory>,
  //   InProgress: '' as Ref<StatusCategory>,
  //   Concluded: '' as Ref<StatusCategory>
  // },
  kraStatusCategory: {
    Drafting: '' as Ref<StatusCategory>,
    NeedChanges: '' as Ref<StatusCategory>,
    Approved: '' as Ref<StatusCategory>,
    InProgress: '' as Ref<StatusCategory>,
    Archived: '' as Ref<StatusCategory>
  }
})
