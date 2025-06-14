//
// Copyright © 2022 Hardcore Engineering Inc.
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

import { loadMetadata } from '@hcengineering/platform'
import kra from '@hcengineering/kra'

const icons = require('../assets/icons.svg') as string // eslint-disable-line
loadMetadata(kra.icon, {
  TrackerApplication: `${icons}#tracker`,
  Issue: `${icons}#issue`,
  Subissue: `${icons}#sub-issue`,
  Project: `${icons}#project`,
  Relations: `${icons}#relations`,
  Inbox: `${icons}#inbox`,
  MyIssues: `${icons}#myissues`,
  Views: `${icons}#views`,
  Issues: `${icons}#issues`,
  NewIssue: `${icons}#new-issue`,
  Magnifier: `${icons}#magnifier`,
  Home: `${icons}#home`,
  RedCircle: `${icons}#red-circle`,
  Labels: `${icons}#labels`,
  DueDate: `${icons}#dueDate`, // TODO: add icon
  Parent: `${icons}#parent-issue`, // TODO: add icon
  UnsetParent: `${icons}#unset-parent-issue`, // TODO: add icon
  IssueTemplates: `${icons}#issuetemplates`,
  Start: `${icons}#start`,
  Stop: `${icons}#stop`,

  CategoryBacklog: `${icons}#status-backlog`,
  CategoryUnstarted: `${icons}#status-todo`,
  CategoryStarted: `${icons}#status-inprogress`,
  CategoryCompleted: `${icons}#status-done`,
  CategoryCanceled: `${icons}#status-canceled`,
  PriorityNoPriority: `${icons}#priority-nopriority`,
  PriorityUrgent: `${icons}#priority-urgent`,
  PriorityHigh: `${icons}#priority-high`,
  PriorityMedium: `${icons}#priority-medium`,
  PriorityLow: `${icons}#priority-low`,

  CopyBranch: `${icons}#copyBranch`,
  Duplicate: `${icons}#duplicate`,
  TimeReport: `${icons}#timeReport`,
  Estimation: `${icons}#estimation`,

  Goal: `${icons}#goal`,
  WriteReport: `${icons}#write-report`,
  StarFilled: `${icons}#star-filled`,
  Star: `${icons}#star`
})
