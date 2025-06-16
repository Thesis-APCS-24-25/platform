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

import { type Space } from '@hcengineering/core'
import performance, { performanceId } from '@hcengineering/performance'
import { type IntlString, mergeIds, type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import { type ViewCategoryAction, type GetAllValuesFunc } from '@hcengineering/view'

export default mergeIds(performanceId, performance, {
  string: {
    NeedChanges: '' as IntlString,
    Approved: '' as IntlString,
    Cancelled: '' as IntlString,
    IdentifierPlaceholder: '' as IntlString,
    Identifier: '' as IntlString,
    CreateActionItem: '' as IntlString,
    Chart: '' as IntlString,
    AssignedKRAs: '' as IntlString,
    ConcludeReviewSession: '' as IntlString,
    ConcludeReviewSessionMessage: '' as IntlString,
    ConcludeReviewSessionConfirm: '' as IntlString,
    NoDraftingReviewSession: '' as IntlString,
    WeightWarningPopupTitle: '' as IntlString,
    StartReviewSession: '' as IntlString,
    StartReviewSessionConfirm: '' as IntlString,
    NotInAnyTeam: '' as IntlString,
    DraftingReviewSessions: '' as IntlString,
    ConcludedReviewSessions: '' as IntlString,
    NoActiveReviewSession: '' as IntlString,
    Tasks: '' as IntlString,
    NotDraftingCannotCreateKRA: '' as IntlString,
    RemoveKRAAssignee: '' as IntlString,
    RemoveKRAAssigneeMessage: '' as IntlString,
    PerKRA: '' as IntlString,
    KRAWeightFull: '' as IntlString,
    KRAWeightNotFullWarning: '' as IntlString,
    PerMember: '' as IntlString,
    ActiveReviewSessions: '' as IntlString,
    PerformanceApplication: '' as IntlString,
    MyReviewSessions: '' as IntlString,
    CreateReviewSessionLabel: '' as IntlString,
    MyKRAs: '' as IntlString,
    CreateKraLabel: '' as IntlString,
    ReviewSessions: '' as IntlString,
    PerformanceDashboard: '' as IntlString,
    AssignedTo: '' as IntlString,
    AllReviewSessions: '' as IntlString,
    Reviewee: '' as IntlString,
    ReviewSession: '' as IntlString,
    Reviews: '' as IntlString,
    ReviewScore: '' as IntlString,
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
    CreateReport: '' as IntlString,
    Drafting: '' as IntlString,
    InProgress: '' as IntlString,
    Concluded: '' as IntlString,
    SetStatus: '' as IntlString,
    ReviewSessionStartDetail: '' as IntlString,
    ReviewSessionEndDetail: '' as IntlString,
    PerformanceReview: '' as IntlString,
    AddPerformanceReview: '' as IntlString,
    RemovePerformanceReview: '' as IntlString,
    EditPerformanceReview: '' as IntlString,
    NoReviews: '' as IntlString,
    InputScore: '' as IntlString,
    ReviewContentPlaceholder: '' as IntlString,
    SubmitReview: '' as IntlString,
    ReviewerScore: '' as IntlString,
    StartDateFilter: '' as IntlString,
    EndDateFilter: '' as IntlString,
    StartDateFilterDetail: '' as IntlString,
    EndDateFilterDetail: '' as IntlString,
    ResetFilters: '' as IntlString,
    EmployeeScore: '' as IntlString,
    RemainingWeight: '' as IntlString
  },
  category: {
    ReviewSessionType: '' as IntlString
  },
  component: {
    KRAStatusPresenter: '' as AnyComponent,
    KRAWeightEditorWithPopup: '' as AnyComponent,
    PerformanceApplication: '' as AnyComponent,
    MyKRAs: '' as AnyComponent,
    KRAAssigneesEditor: '' as AnyComponent,
    KRAAssigneesPresenter: '' as AnyComponent,
    KRAEditor: '' as AnyComponent,
    EditKRA: '' as AnyComponent,
    KRARefPresenter: '' as AnyComponent,
    NewReviewSessionHeader: '' as AnyComponent,
    ReviewSessionSpacePresenter: '' as AnyComponent,
    CreateReviewSession: '' as AnyComponent,
    CreateKRA: '' as AnyComponent,
    KRAPresenter: '' as AnyComponent,
    Performance: '' as AnyComponent,
    TeamSpacePresenter: '' as AnyComponent,
    PerformanceDashboard: '' as AnyComponent,
    PerformanceReports: '' as AnyComponent,
    ReportPanel: '' as AnyComponent,
    ReportPresenter: '' as AnyComponent,
    ListView: '' as AnyComponent,
    AllReviewSessions: '' as AnyComponent,
    AllKRAs: '' as AnyComponent,
    TeamSwitchHeader: '' as AnyComponent,
    KRAStatistics: '' as AnyComponent,
    ReviewSessionStatusPresenter: '' as AnyComponent,
    // ReviewSessionStatusRefPresenter: '' as AnyComponent,
    ReviewSessionStatusEditor: '' as AnyComponent,
    ReviewPresenter: '' as AnyComponent,
    EmployeeKRATotalWeightStat: '' as AnyComponent,
    ReviewEditor: '' as AnyComponent
  },
  function: {
    IsReviewSessionOfCurrentTeam: '' as Resource<(space: Space) => Promise<boolean>>,
    IsActiveReviewSessionOfCurrentTeam: '' as Resource<(space: Space) => Promise<boolean>>,
    IsInactiveReviewSessionOfCurrentTeam: '' as Resource<(space: Space) => Promise<boolean>>,
    GetAllKRAStates: '' as GetAllValuesFunc,
    ShowEmptyGroups: '' as ViewCategoryAction,
    GetAllKRAs: '' as GetAllValuesFunc
  }
})
