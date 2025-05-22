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
    PerformanceApplication: '' as IntlString,
    MyReviewSessions: '' as IntlString,
    CreateReviewSessionLabel: '' as IntlString,
    MyKRAs: '' as IntlString,
    CreateKraLabel: '' as IntlString,
    ReviewSessions: '' as IntlString,
    PerformanceDashboard: '' as IntlString,
    AssignedTo: '' as IntlString,
    AllReviewSessions: '' as IntlString,
    ReviewCommentAuthor: '' as IntlString,
    ReviewerComment: '' as IntlString,
    ReviewerScore: '' as IntlString,
    Reviewee: '' as IntlString,
    ReviewSession: '' as IntlString,
    ReviewComments: '' as IntlString,
    PerformanceReports: '' as IntlString,
    CreateReportLabel: '' as IntlString,
    Assignees: '' as IntlString,
    AssignTo: '' as IntlString,
    Weight: '' as IntlString,
    CreateReviewSession: '' as IntlString,
    ReviewSessionName: '' as IntlString,
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
    PerformanceApplication: '' as AnyComponent,
    MyKRAs: '' as AnyComponent,
    KRAAssigneesEditor: '' as AnyComponent,
    KRAEditor: '' as AnyComponent,
    EditKRA: '' as AnyComponent,
    KRARefPresenter: '' as AnyComponent,
    NewReviewSessionHeader: '' as AnyComponent,
    ReviewSessionSpacePresenter: '' as AnyComponent,
    CreateReviewSession: '' as AnyComponent,
    CreateKRA: '' as AnyComponent,
    KRAPresenter: '' as AnyComponent,
    TeamSpacePresenter: '' as AnyComponent,
    PerformanceDashboard: '' as AnyComponent,
    PerformanceReports: '' as AnyComponent,
    ReportPanel: '' as AnyComponent,
    ReportPresenter: '' as AnyComponent,
    CreateReport: '' as AnyComponent,
    CreateReportButton: '' as AnyComponent,
    ListView: '' as AnyComponent,
    TeamSwitchHeader: '' as AnyComponent
    // ReviewSessionStatusPresenter: '' as AnyComponent,
    // ReviewSessionStatusRefPresenter: '' as AnyComponent,
    // ReviewSessionStateEditor: '' as AnyComponent
  },
  function: {
    GetAllKRAStates: '' as GetAllValuesFunc,
    KRAStatusSort: '' as SortFunc
  }
})
