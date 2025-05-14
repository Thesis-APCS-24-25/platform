//
// Copyright © 2020 Anticrm Platform Contributors.
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
import { type IntlString, mergeIds } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import { type GetAllValuesFunc, type SortFunc } from '@hcengineering/view'

export default mergeIds(performanceId, performance, {
  string: {
    Assignees: '' as IntlString,
    AssignTo: '' as IntlString,
    Weight: '' as IntlString,
    CreateReviewSession: '' as IntlString,
    ReviewSessionName: '' as IntlString,
    ReviewSession: '' as IntlString,
    ReviewSessionNamePlaceholder: '' as IntlString,
    ReviewSessionDescription: '' as IntlString,
    ReviewSessionDescriptionPlaceholder: '' as IntlString,
    Untitled: '' as IntlString,
    CreateKRA: '' as IntlString,
    KRAName: '' as IntlString,
    KRADescription: '' as IntlString,
    KRANamePlaceholder: '' as IntlString,
    KRADescriptionPlaceholder: '' as IntlString,
    SelectTeam: '' as IntlString,
    SelectReviewSession: '' as IntlString,
    NoTeam: '' as IntlString,
    AssignKRA: '' as IntlString,
    CreateReport: '' as IntlString
  },
  category: {
    ReviewSessionType: '' as IntlString
  },
  component: {
    EditKRA: '' as AnyComponent,
    KRAEditor: '' as AnyComponent,
    KRARefPresenter: '' as AnyComponent,
    PerformanceDashboard: '' as AnyComponent,
    ReportPanel: '' as AnyComponent,
    ReportPresenter: '' as AnyComponent
    // ReviewSessionStatusPresenter: '' as AnyComponent,
    // ReviewSessionStatusRefPresenter: '' as AnyComponent,
    // ReviewSessionStateEditor: '' as AnyComponent
  },
  function: {
    GetAllKRAStates: '' as GetAllValuesFunc,
    KRAStatusSort: '' as SortFunc
  }
})
