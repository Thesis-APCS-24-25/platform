//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Analytics } from '@hcengineering/analytics'
import {
  type Attribute,
  type Class,
  type Client,
  type Doc,
  type DocumentQuery,
  getCurrentAccount,
  type Ref,
  type RelatedDocument,
  type Space,
  toIdMap
} from '@hcengineering/core'
import { type Resources, type Status } from '@hcengineering/platform'
import { getClient, MessageBox, type ObjectSearchResult } from '@hcengineering/presentation'
import { type Issue, type Project } from '@hcengineering/kra'
import { closePanel, getCurrentLocation, navigate, showPopup } from '@hcengineering/ui'
import CreateIssue from './components/CreateIssue.svelte'
import EditRelatedTargets from './components/EditRelatedTargets.svelte'
import EditRelatedTargetsPopup from './components/EditRelatedTargetsPopup.svelte'
import AssigneeEditor from './components/issues/AssigneeEditor.svelte'
import DueDatePresenter from './components/issues/DueDatePresenter.svelte'
import EditIssue from './components/issues/edit/EditIssue.svelte'
import IssueExtra from './components/issues/IssueExtra.svelte'
import IssueItem from './components/issues/IssueItem.svelte'
import IssuePresenter from './components/issues/IssuePresenter.svelte'
import IssuePreview from './components/issues/IssuePreview.svelte'
import Issues from './components/issues/Issues.svelte'
import IssueSearchIcon from './components/issues/IssueSearchIcon.svelte'
import IssueStatusPresenter from './components/issues/IssueStatusPresenter.svelte'
import IssuesView from './components/issues/IssuesView.svelte'
import KanbanView from './components/issues/KanbanView.svelte'
import ModificationDatePresenter from './components/issues/ModificationDatePresenter.svelte'
import NotificationIssuePresenter from './components/issues/NotificationIssuePresenter.svelte'
import PriorityEditor from './components/issues/PriorityEditor.svelte'
import PriorityFilterValuePresenter from './components/issues/PriorityFilterValuePresenter.svelte'
import PriorityInlineEditor from './components/issues/PriorityInlineEditor.svelte'
import PriorityPresenter from './components/issues/PriorityPresenter.svelte'
import PriorityRefPresenter from './components/issues/PriorityRefPresenter.svelte'
import RelatedIssueSelector from './components/issues/related/RelatedIssueSelector.svelte'
import RelatedIssuesSection from './components/issues/related/RelatedIssuesSection.svelte'
import StatusEditor from './components/issues/StatusEditor.svelte'
import StatusFilterValuePresenter from './components/issues/StatusFilterValuePresenter.svelte'
import StatusPresenter from './components/issues/StatusPresenter.svelte'
import TitlePresenter from './components/issues/TitlePresenter.svelte'
import LabelsView from './components/LabelsView.svelte'
import MyIssues from './components/myissues/MyIssues.svelte'
import NewIssueHeader from './components/NewIssueHeader.svelte'
import NopeComponent from './components/NopeComponent.svelte'
import MembersArrayEditor from './components/projects/MembersArrayEditor.svelte'
import ProjectFilterValuePresenter from './components/projects/ProjectFilterValuePresenter.svelte'
import RelationsPopup from './components/RelationsPopup.svelte'
import SetDueDateActionPopup from './components/SetDueDateActionPopup.svelte'
import SetParentIssueActionPopup from './components/SetParentIssueActionPopup.svelte'
import SettingsRelatedTargets from './components/SettingsRelatedTargets.svelte'
import CreateIssueTemplate from './components/templates/CreateIssueTemplate.svelte'
import {
  getIssueIdByIdentifier,
  getIssueTitle,
  getTitle,
  issueIdentifierProvider,
  issueLinkFragmentProvider,
  issueLinkProvider,
  issueTitleProvider,
  resolveLocation
} from './issues'
import tracker from './plugin'

import SubIssuesSelector from './components/issues/edit/SubIssuesSelector.svelte'
import EstimationEditor from './components/issues/timereport/EstimationEditor.svelte'
import ReportedTimeEditor from './components/issues/timereport/ReportedTimeEditor.svelte'
import TimeSpendReport from './components/issues/timereport/TimeSpendReport.svelte'

import RelatedIssues from './components/issues/related/RelatedIssues.svelte'
import RelatedIssueTemplates from './components/issues/related/RelatedIssueTemplates.svelte'

import IssueTemplatePresenter from './components/templates/IssueTemplatePresenter.svelte'
import IssueTemplates from './components/templates/IssueTemplates.svelte'

import { AggregationManager, deleteObjects } from '@hcengineering/view-resources'
import EditIssueTemplate from './components/templates/EditIssueTemplate.svelte'
import TemplateEstimationEditor from './components/templates/EstimationEditor.svelte'
import {
  activeProjects,
  getAllPriority,
  getIssueChatTitle,
  getIssueStatusCategories,
  getVisibleFilters,
  issuePrioritySort,
  issueStatusSort,
  subIssueQuery
} from './utils'

import PriorityIcon from './components/activity/PriorityIcon.svelte'
import StatusIcon from './components/activity/StatusIcon.svelte'
import IssueStatusIcon from './components/issues/IssueStatusIcon.svelte'
import MoveIssues from './components/issues/Move.svelte'
import PriorityIconPresenter from './components/issues/PriorityIconPresenter.svelte'
import StatusRefPresenter from './components/issues/StatusRefPresenter.svelte'
import TimeSpendReportPopup from './components/issues/timereport/TimeSpendReportPopup.svelte'
import CreateProject from './components/projects/CreateProject.svelte'
import ProjectPresenter from './components/projects/ProjectPresenter.svelte'
import ProjectSpacePresenter from './components/projects/ProjectSpacePresenter.svelte'

import { settingId } from '@hcengineering/setting'
import { getAllStates } from '@hcengineering/task-resources'
import EstimationValueEditor from './components/issues/timereport/EstimationValueEditor.svelte'
import TimePresenter from './components/issues/timereport/TimePresenter.svelte'
import GoalPresenter from './components/GoalPresenter.svelte'
import KpiPresenter from './components/KpiPresenter.svelte'
import RatingScalePresenter from './components/RatingScalePresenter.svelte'
import KpiReport from './components/issues/kpi/KpiReport.svelte'
import './styles/_colors.scss'

export { default as AssigneeEditor } from './components/issues/AssigneeEditor.svelte'
export { default as SubIssueList } from './components/issues/edit/SubIssueList.svelte'
export { default as IssueStatusIcon } from './components/issues/IssueStatusIcon.svelte'
export { default as StatusPresenter } from './components/issues/StatusPresenter.svelte'

export {
  activeProjects,
  CreateProject,
  IssuePresenter,
  PriorityEditor,
  StatusEditor,
  TitlePresenter
}

export async function queryIssue<D extends Issue>(
  _class: Ref<Class<D>>,
  client: Client,
  search: string,
  filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }
): Promise<ObjectSearchResult[]> {
  const q: DocumentQuery<Issue> = { identifier: { $like: `%${search}%` } }
  if (filter?.in !== undefined || filter?.nin !== undefined) {
    q._id = {}
    if (filter.in !== undefined) {
      q._id.$in = filter.in?.map((it) => it._id as Ref<Issue>)
    }
    if (filter.nin !== undefined) {
      q._id.$nin = filter.nin?.map((it) => it._id as Ref<Issue>)
    }
  }

  const numbered = toIdMap(
    await client.findAll<Issue>(_class, q, {
      limit: 200
    })
  )

  const q2: DocumentQuery<Issue> = { title: { $like: `%${search}%` } }
  if (q._id !== undefined) {
    q2._id = q._id
  }
  const named = await client.findAll<Issue>(_class, q2, { limit: 200 })
  for (const d of named) {
    if (d.identifier.includes(search) || d.title.includes(search)) {
      if (!numbered.has(d._id)) {
        numbered.set(d._id, d)
      }
    }
  }

  return Array.from(numbered.values()).map((e) => ({
    doc: e,
    title: e.identifier,
    icon: tracker.icon.TrackerApplication,
    component: IssueItem
  }))
}

async function move(issues: Issue | Issue[]): Promise<void> {
  showPopup(MoveIssues, { selected: issues }, 'top')
}

async function editWorkflowStatuses(project: Project): Promise<void> {
  const loc = getCurrentLocation()
  loc.path[2] = settingId
  loc.path[3] = 'spaceTypes'
  loc.path[4] = project.type
  navigate(loc)
}

async function editProject(project: Project | undefined): Promise<void> {
  if (project !== undefined) {
    showPopup(CreateProject, { project })
  }
}

async function deleteIssue(issue: Issue | Issue[]): Promise<void> {
  const issueCount = Array.isArray(issue) ? issue.length : 1
  let subissues: number = 0
  if (Array.isArray(issue)) {
    issue.forEach((it) => {
      subissues += it.subIssues
    })
  } else {
    subissues = issue.subIssues
  }
  showPopup(MessageBox, {
    label: tracker.string.DeleteIssue,
    labelProps: { issueCount },
    message: tracker.string.DeleteIssueConfirm,
    params: {
      issueCount,
      subIssueCount: subissues
    },
    action: async () => {
      const objs = Array.isArray(issue) ? issue : [issue]
      try {
        await deleteObjects(getClient(), objs as unknown as Doc[])
      } catch (err: any) {
        Analytics.handleError(err)
      }
      closePanel()
    }
  })
}

async function deleteProject(project: Project | undefined): Promise<void> {
  if (project !== undefined) {
    const client = getClient()

    if (project.archived) {
      // Clean project and all issues
      showPopup(MessageBox, {
        label: tracker.string.DeleteProject,
        labelProps: { name: project.name },
        message: tracker.string.DeleteProjectConfirm,
        action: async () => {
          const client = getClient()
          await client.remove(project)
        }
      })
    } else {
      const anyIssue = await client.findOne(tracker.class.Issue, { space: project._id })
      showPopup(MessageBox, {
        label: tracker.string.ArchiveProjectName,
        labelProps: { name: project.name },
        message:
          anyIssue !== undefined
            ? tracker.string.ProjectHasIssues
            : tracker.string.ArchiveProjectConfirm,
        action: async () => {
          await client.update(project, { archived: true })
        }
      })
    }
  }
}

export default async (): Promise<Resources> => ({
  activity: {
    PriorityIcon,
    StatusIcon
  },
  component: {
    NopeComponent,
    Issues,
    MyIssues,
    IssuePresenter,
    TitlePresenter,
    ModificationDatePresenter,
    PriorityPresenter,
    PriorityEditor,
    PriorityInlineEditor,
    PriorityRefPresenter,
    StatusPresenter,
    StatusEditor,
    AssigneeEditor,
    DueDatePresenter,
    EditIssue,
    NewIssueHeader,
    SetDueDateActionPopup,
    SetParentIssueActionPopup,
    IssuesView,
    KanbanView,
    IssuePreview,
    RelationsPopup,
    CreateIssue,
    CreateIssueTemplate,
    ReportedTimeEditor,
    TimeSpendReport,
    EstimationEditor,
    SubIssuesSelector,
    RelatedIssues,
    RelatedIssueTemplates,
    IssueTemplates,
    IssueTemplatePresenter,
    EditIssueTemplate,
    TemplateEstimationEditor,
    CreateProject,
    ProjectPresenter,
    ProjectSpacePresenter,
    StatusRefPresenter,
    RelatedIssuesSection,
    RelatedIssueSelector,
    TimeSpendReportPopup,
    NotificationIssuePresenter,
    PriorityFilterValuePresenter,
    StatusFilterValuePresenter,
    ProjectFilterValuePresenter,
    EditRelatedTargets,
    EditRelatedTargetsPopup,
    SettingsRelatedTargets,
    TimePresenter,
    EstimationValueEditor,
    IssueStatusIcon,
    PriorityIconPresenter,
    IssueSearchIcon,
    MembersArrayEditor,
    IssueExtra,
    IssueStatusPresenter,
    LabelsView,
    GoalPresenter,
    KpiPresenter,
    RatingScalePresenter,
    KpiReport
  },
  completion: {
    IssueQuery: async (
      client: Client,
      query: string,
      filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }
    ) => await queryIssue(tracker.class.Issue, client, query, filter)
  },
  function: {
    IssueIdentifierProvider: issueIdentifierProvider,
    IssueTitleProvider: issueTitleProvider,
    GetIssueId: getTitle,
    GetIssueIdByIdentifier: getIssueIdByIdentifier,
    GetIssueLink: issueLinkProvider,
    GetIssueLinkFragment: issueLinkFragmentProvider,
    GetIssueTitle: getIssueTitle,
    IssueStatusSort: issueStatusSort,
    IssuePrioritySort: issuePrioritySort,
    SubIssueQuery: subIssueQuery,
    GetAllPriority: getAllPriority,
    GetAllStates: async (
      query: DocumentQuery<Doc<Space>> | undefined,
      onUpdate: () => void,
      queryId: Ref<Doc<Space>>,
      attr: Attribute<Status>
    ) => await getAllStates(query, onUpdate, queryId, attr, false),
    GetVisibleFilters: getVisibleFilters,
    IssueChatTitleProvider: getIssueChatTitle,
    IsProjectJoined: async (project: Project) => project.members.includes(getCurrentAccount()._id),
    GetIssueStatusCategories: getIssueStatusCategories
  },
  actionImpl: {
    Move: move,
    EditWorkflowStatuses: editWorkflowStatuses,
    EditProject: editProject,
    DeleteProject: deleteProject,
    DeleteIssue: deleteIssue
  },
  resolver: {
    Location: resolveLocation
  },
  aggregation: {
    // eslint-disable-next-line @typescript-eslint/unbound-method
  }
})
