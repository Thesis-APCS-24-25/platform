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
import { type Status, type Resources } from '@hcengineering/platform'
import CreateReviewSession from './components/review-session/CreateReviewSession.svelte'
import ReviewSessionSpacePresenter from './components/review-session/ReviewSessionSpacePresenter.svelte'
import CreateKRA from './components/kra/CreateKRA.svelte'
import EditKRA from './components/kra/EditKRA.svelte'
import KRAPresenter from './components/kra/KRAPresenter.svelte'
import TeamSpacePresenter from './components/navigator/TeamSpacePresenter.svelte'
import KRARefPresenter from './components/kra/KRARefPresenter.svelte'
import KRAEditor from './components/kra/KRAEditor.svelte'
import { getAllKRAs } from './utils/kra'
import { checkPermission, type Attribute, type Doc, type DocumentQuery, type Ref, type Space } from '@hcengineering/core'
import { getAllStates } from '@hcengineering/task-resources'
import PerformanceDashboard from './components/dashboard/Dashboard.svelte'
import KRAAssigneesEditor from './components/kra/KRAAssigneesEditor.svelte'
import MyKRAs from './components/kra/MyKRAs.svelte'
import PerformanceReports from './components/report/PerformanceReports.svelte'
import ReportPanel from './components/report/ReportPanel.svelte'
import ReportPresenter from './components/report/ReportPresenter.svelte'
import TeamSwitchHeader from './components/navigator/TeamSwitchHeader.svelte'
import ListView from './components/list/ListView.svelte'
import KRAAssigneesPresenter from './components/kra/KRAAssigneesPresenter.svelte'
import KRAWeightEditorWithPopup from './components/kra/KRAWeightEditorWithPopup.svelte'
import ReviewSessionStatusPresenter from './components/review-session/ReviewSessionStatusPresenter.svelte'
import ReviewSessionStatusEditor from './components/review-session/ReviewSessionStatusEditor.svelte'
import KRAStatistics from './components/kra/KRAStatistics.svelte'
import Performance from './components/application/Performance.svelte'
// import ReviewSessionStatusPresenter from './components/review-session/ReviewSessionStatusPresenter.svelte'
// import ReviewSessionStatusRefPresenter from './components/review-session/ReviewSessionStatusRefPresenter.svelte'
// import ReviewSessionStateEditor from './components/review-session/ReviewSessionStateEditor.svelte'
import {
  IsActiveReviewSessionOfCurrentTeam,
  IsInactiveReviewSessionOfCurrentTeam,
  IsReviewSessionOfCurrentTeam
} from './utils/review-session'
import AllKRAs from './components/kra/AllKRAs.svelte'
import AllReviewSessions from './components/review-session/AllReviewSessions.svelte'
import EmployeeKRATotalWeightStat from './components/kra/EmployeeKRATotalWeightStat.svelte'
import { showEmptyGroups } from '@hcengineering/view-resources'
import KRAStatusPresenter from './components/kra/KRAStatusPresenter.svelte'
import ProgressPresenter from './components/progress/ProgressPresenter.svelte'
import AddProgressPopup from './components/progress/AddProgressPopup.svelte'
import AddUnitPopup from './components/progress/unit/AddUnitPopup.svelte'
import KRABox from './components/kra/KRABox.svelte'
import UnitPresenter from './components/progress/unit/UnitPresenter.svelte'
import ProgressObjectPresenter from './components/progress/ProgressObjectPresenter.svelte'
import AssignKraPopup from './components/kra/AssignKRAPopup.svelte'
import { canApproveKRA } from './visibilityTester'
import { approveKRA } from './actionImpl'
import ScorePresenter from './components/report/ScorePresenter.svelte'
import KpiReportEditPopup from './components/progress/kpi/KpiReportEditPopup.svelte'
import ProgressReportEditPopup from './components/progress/ProgressReportEditPopup.svelte'
import SetProgressMenu from './components/progress/SetProgressMenu.svelte'
import { type ReviewSession, type PTask } from '@hcengineering/performance'
import RemoveProgressPopup from './components/progress/RemoveProgressPopup.svelte'
import EditKpiPopup from './components/progress/kpi/EditKpiPopup.svelte'
import PTaskKRAStat from './components/task/PTaskKRAStat.svelte'
import MyReports from './components/application/MyReports.svelte'
import MyReport from './components/application/MyReport.svelte'
import { getClient, MessageBox } from '@hcengineering/presentation'
import { showPopup } from '@hcengineering/ui'
import { type Team } from '@hcengineering/kra-team'
import core from '@hcengineering/core'
import performance from './plugin'

export {
  EditKpiPopup,
  KRAPresenter,
  KRAEditor,
  AddProgressPopup,
  KRABox,
  ProgressObjectPresenter,
  UnitPresenter,
  KpiReportEditPopup,
  ProgressPresenter,
  ProgressReportEditPopup
}

async function deleteReviewSession (project: ReviewSession | undefined): Promise<void> {
  if (project !== undefined) {
    const client = getClient()

    if (project.archived) {
      // Clean project and all issues
      showPopup(MessageBox, {
        label: performance.string.DeleteReviewSessionName,
        labelProps: { name: project.name },
        message: performance.string.DeleteReviewSessionConfirm,
        action: async () => {
          const client = getClient()
          await client.remove(project)
        }
      })
    } else {
      const anyIssue = await client.findOne(performance.class.KRA, {
        space: project._id
      })
      showPopup(MessageBox, {
        label: performance.string.ArchiveReviewSessionName,
        labelProps: { name: project.name },
        message:
          anyIssue !== undefined
            ? performance.string.ReviewSessionHasKRAs
            : performance.string.ArchiveReviewSessionConfirm,
        action: async () => {
          await client.update(project, { archived: true })
        }
      })
    }
  }
}

export default async (): Promise<Resources> => ({
  actionImpl: {
    ApproveKRA: approveKRA,
    DeleteReviewSession: deleteReviewSession
  },
  component: {
    PTaskKRAStat,
    RemoveProgressPopup,
    SetProgressMenu,
    ProgressObjectPresenter,
    UnitPresenter,
    EmployeeKRATotalWeightStat,
    MyKRAs,
    ProgressPresenter,
    KRAAssigneesEditor,
    KRAAssigneesPresenter,
    CreateReviewSession,
    ReviewSessionSpacePresenter,
    CreateKRA,
    EditKRA,
    KRAPresenter,
    TeamSpacePresenter,
    KRARefPresenter,
    KRAEditor,
    PerformanceDashboard,
    PerformanceReports,
    ReportPanel,
    ReportPresenter,
    TeamSwitchHeader,
    KRAWeightEditorWithPopup,
    AllReviewSessions,
    AllKRAs,
    ListView,
    ReviewSessionStatusPresenter,
    ReviewSessionStatusEditor,
    PerformanceApplication: Performance,
    KRAStatistics,
    KRAStatusPresenter,
    AddUnitPopup,
    AssignKraPopup,
    ScorePresenter,
    MyReport,
    MyReports
  },
  function: {
    CanRemoveProgress: async (task: PTask | undefined): Promise<boolean> => task?.progress !== undefined,
    CanAddProgress: async (task: PTask | undefined): Promise<boolean> => task?.progress === undefined,
    GetAllKRAStates: async (
      query: DocumentQuery<Doc<Space>> | undefined,
      onUpdate: () => void,
      queryId: Ref<Doc<Space>>,
      attr: Attribute<Status>
    ) => await getAllStates(query, onUpdate, queryId, attr, false),
    GetAllKRAs: getAllKRAs,
    ShowEmptyGroups: showEmptyGroups,
    IsReviewSessionOfCurrentTeam,
    IsActiveReviewSessionOfCurrentTeam,
    IsInactiveReviewSessionOfCurrentTeam,
    CanApproveKRA: canApproveKRA,
    CanArchiveSpace: async (doc?: Doc | Doc[]): Promise<boolean> => {
      if (doc === undefined || Array.isArray(doc)) {
        return false
      }

      const space = doc as Space
      const team = space.space as Ref<Team>
      return await checkPermission(getClient(), core.permission.ArchiveSpace, team)
    }
  }
})
