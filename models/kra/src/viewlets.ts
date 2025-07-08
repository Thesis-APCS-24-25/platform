//
// Copyright © 2023 Hardcore Engineering Inc.
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

import { SortingOrder } from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/model-core'
import task from '@hcengineering/model-task'
import view, { showColorsViewOption } from '@hcengineering/model-view'
import tags from '@hcengineering/tags'
import { type BuildModelKey, type ViewOptionsModel } from '@hcengineering/view'
import kra from './plugin'
import performance from '@hcengineering/model-performance'

export const issuesOptions = (kanban: boolean): ViewOptionsModel => ({
  groupBy: [
    'status',
    'kind',
    'assignee',
    'priority',
    'createdBy',
    'modifiedBy',
    'remainingTime'
  ],
  orderBy: [
    ['modifiedOn', SortingOrder.Descending],
    ['status', SortingOrder.Ascending],
    ['kind', SortingOrder.Ascending],
    ['priority', SortingOrder.Ascending],
    ['createdOn', SortingOrder.Descending],
    ['dueDate', SortingOrder.Ascending],
    ['rank', SortingOrder.Ascending],
    ['remainingTime', SortingOrder.Descending]
  ],
  other: [
    {
      key: 'shouldShowSubIssues',
      type: 'toggle',
      defaultValue: true,
      actionTarget: 'query',
      action: kra.function.SubIssueQuery,
      label: kra.string.SubIssues
    },
    {
      key: 'shouldShowAll',
      type: 'toggle',
      defaultValue: false,
      actionTarget: 'category',
      action: view.function.ShowEmptyGroups,
      label: view.string.ShowEmptyGroups
    },
    {
      key: 'hideArchived',
      type: 'toggle',
      defaultValue: true,
      actionTarget: 'options',
      action: view.function.HideArchived,
      label: view.string.HideArchived
    },
    ...(!kanban ? [showColorsViewOption] : [])
  ]
})

export function issueConfig (
  key: string = '',
  compact: boolean = false,
  showKra: boolean = true
): (BuildModelKey | string)[] {
  return [
    {
      key: '',
      label: kra.string.Priority,
      presenter: kra.component.PriorityEditor,
      props: { type: 'priority', kind: 'list', size: 'small' },
      displayProps: { key: 'priority' }
    },
    {
      key: '',
      label: kra.string.Identifier,
      presenter: kra.component.IssuePresenter,
      displayProps: { key: key + 'issue', fixed: 'left' }
    },
    {
      key: '',
      label: kra.string.Status,
      presenter: kra.component.StatusEditor,
      props: { kind: 'list', size: 'small', justify: 'center' },
      displayProps: { key: key + 'status' }
    },
    // {
    //   key: 'kind',
    //   label: task.string.TaskType,
    //   presenter: task.component.TaskTypePresenter,
    //   props: { kind: 'list', size: 'small', justify: 'center' },
    //   displayProps: { key: key + 'kind' }
    // },
    {
      key: '',
      label: kra.string.Title,
      presenter: kra.component.TitlePresenter,
      props: compact ? { shouldUseMargin: true, showParent: false } : {},
      displayProps: { key: key + 'title' }
    },
    {
      key: '',
      label: kra.string.SubIssues,
      presenter: kra.component.SubIssuesSelector,
      props: {}
    },
    { key: 'comments', displayProps: { key: key + 'comments', suffix: true } },
    { key: 'attachments', displayProps: { key: key + 'attachments', suffix: true } },
    { key: '', displayProps: { grow: true } },
    {
      key: 'labels',
      presenter: tags.component.LabelsPresenter,
      displayProps: { compression: true },
      props: { kind: 'list', full: false }
    },
    {
      key: '',
      label: kra.string.Extensions,
      presenter: kra.component.IssueExtra,
      displayProps: { compression: true },
      props: { kind: 'list', full: false }
    },
    {
      key: '',
      label: kra.string.DueDate,
      presenter: kra.component.DueDatePresenter,
      displayProps: { key: key + 'dueDate', compression: true },
      props: { kind: 'list' }
    },
    {
      key: '',
      label: performance.string.Progress,
      presenter: performance.component.ProgressPresenter,
      props: { kind: 'list', size: 'small' },
      displayProps: {
        fixed: 'right',
        optional: true
      }
    },
    {
      key: 'modifiedOn',
      presenter: kra.component.ModificationDatePresenter,
      displayProps: { key: key + 'modified', fixed: 'left', dividerBefore: true }
    },
    {
      key: 'assignee',
      presenter: kra.component.AssigneeEditor,
      displayProps: { key: 'assignee', fixed: 'right' },
      props: { kind: 'list', shouldShowName: false, avatarSize: 'x-small' }
    },
    ...(showKra
      ? [
          {
            key: '',
            presenter: kra.component.KRAEditor,
            label: performance.string.KRA,
            props: { kind: 'list', size: 'small', shrink: 1 },
            displayProps: {
              key: 'kra',
              fixed: 'right',
              dividerBefore: true,
              align: 'right'
            }
          } as const
        ]
      : [])
  ]
}

export function defineViewlets (builder: Builder): void {
  builder.createDoc(
    view.class.ViewletDescriptor,
    core.space.Model,
    {
      label: kra.string.Board,
      icon: task.icon.Kanban,
      component: kra.component.KanbanView
    },
    kra.viewlet.Kanban
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: kra.class.Issue,
      descriptor: view.viewlet.List,
      viewOptions: issuesOptions(false),
      configOptions: {
        strict: true,
        hiddenKeys: [
          'title',
          'blockedBy',
          'relations',
          'description',
          'number',
          'reportedTime',
          'reports',
          'priority',
          'estimation',
          'remainingTime',
          'status',
          'dueDate',
          'attachedTo',
          'createdBy',
          'modifiedBy',
          'goal',
          'kra'
        ]
      },
      config: issueConfig()
    },
    kra.viewlet.IssueList
  )

  const subIssuesOptions: ViewOptionsModel = {
    groupBy: ['status', 'kind', 'assignee', 'priority', 'createdBy', 'modifiedBy'],
    orderBy: [
      ['rank', SortingOrder.Ascending],
      ['kind', SortingOrder.Ascending],
      ['status', SortingOrder.Ascending],
      ['priority', SortingOrder.Ascending],
      ['modifiedOn', SortingOrder.Descending],
      ['createdOn', SortingOrder.Descending],
      ['dueDate', SortingOrder.Ascending]
    ],
    groupDepth: 1,
    other: [showColorsViewOption]
  }

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: kra.class.Issue,
      descriptor: view.viewlet.List,
      viewOptions: subIssuesOptions,
      variant: 'subissue',
      configOptions: {
        strict: true,
        hiddenKeys: [
          'priority',
          'number',
          'status',
          'title',
          'dueDate',
          'estimation',
          'remainingTime',
          'createdBy',
          'modifiedBy',
          'goal',
          'kra'
        ]
      },
      config: issueConfig('sub', true)
    },
    kra.viewlet.SubIssues
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: kra.class.IssueTemplate,
      descriptor: view.viewlet.List,
      viewOptions: {
        groupBy: ['assignee', 'priority', 'createdBy', 'modifiedBy'],
        orderBy: [
          ['priority', SortingOrder.Ascending],
          ['modifiedOn', SortingOrder.Descending],
          ['dueDate', SortingOrder.Ascending],
          ['rank', SortingOrder.Ascending]
        ],
        other: [showColorsViewOption]
      },
      configOptions: {
        strict: true,
        hiddenKeys: [
          'estimation',
          'remainingTime',
          'reportedTime',
          'title',
          'description',
          'createdBy',
          'modifiedBy',
          'goal'
        ]
      },
      config: [
        // { key: '', presenter: tracker.component.PriorityEditor, props: { kind: 'list', size: 'small' } },
        {
          key: '',
          presenter: kra.component.IssueTemplatePresenter,
          props: { type: 'issue', shouldUseMargin: true }
        },
        // { key: '', presenter: tracker.component.DueDatePresenter, props: { kind: 'list' } },
        { key: '', displayProps: { grow: true } },
        {
          key: 'modifiedOn',
          presenter: kra.component.ModificationDatePresenter,
          displayProps: { fixed: 'right', dividerBefore: true }
        },
        {
          key: 'assignee',
          presenter: kra.component.AssigneeEditor,
          props: { kind: 'list', shouldShowName: false, avatarSize: 'x-small' }
        }
      ]
    },
    kra.viewlet.IssueTemplateList
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: kra.class.Issue,
      descriptor: kra.viewlet.Kanban,
      viewOptions: {
        ...issuesOptions(true),
        groupDepth: 1
      },
      configOptions: {
        strict: true
      },
      config: [
        'subIssues',
        'priority',
        'dueDate',
        'labels',
        'attachments',
        'comments',
        'kra',
        'goal'
      ]
    },
    kra.viewlet.IssueKanban
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: kra.class.Project,
      descriptor: view.viewlet.Table,
      configOptions: {
        hiddenKeys: ['identifier', 'name', 'description', 'goal']
      },
      config: [
        {
          key: '',
          presenter: kra.component.ProjectPresenter,
          props: {
            openIssues: true
          }
        },
        'members',
        {
          key: 'defaultAssignee',
          props: { kind: 'list' }
        },
        {
          key: 'modifiedOn',
          presenter: kra.component.ModificationDatePresenter,
          displayProps: { fixed: 'right', dividerBefore: true }
        }
      ],
      options: {
        showArchived: true
      }
    },
    kra.viewlet.ProjectList
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: performance.class.PTask,
      descriptor: performance.viewlet.TaskList,
      variant: 'report',
      configOptions: {
        hiddenKeys: [
          'title',
          'blockedBy',
          'relations',
          'description',
          'number',
          'priority',
          'estimation',
          'status',
          'dueDate',
          'attachedTo',
          'createdBy',
          'modifiedBy',
          'goal',
          'kra'
        ]
      },
      config: [
        {
          key: '',
          label: kra.string.Priority,
          presenter: kra.component.PriorityEditor,
          props: { type: 'priority', kind: 'list', size: 'small' },
          displayProps: { key: 'priority' }
        },
        {
          key: '',
          label: kra.string.Identifier,
          presenter: kra.component.IssuePresenter,
          displayProps: { key: 'issue', fixed: 'left' }
        },
        {
          key: '',
          label: kra.string.Status,
          presenter: kra.component.StatusEditor,
          props: { kind: 'list', size: 'small', justify: 'center' },
          displayProps: { key: 'status' }
        },
        {
          key: '',
          label: kra.string.Title,
          presenter: kra.component.TitlePresenter,
          props: {},
          displayProps: { key: 'title' }
        },
        {
          key: '',
          label: kra.string.SubIssues,
          presenter: kra.component.SubIssuesSelector,
          props: {}
        },
        { key: 'comments', displayProps: { key: 'comments', suffix: true } },
        { key: 'attachments', displayProps: { key: 'attachments', suffix: true } },
        { key: '', displayProps: { grow: true } },
        {
          key: 'labels',
          presenter: tags.component.LabelsPresenter,
          displayProps: { compression: true },
          props: { kind: 'list', full: false }
        },
        {
          key: '',
          label: kra.string.Extensions,
          presenter: kra.component.IssueExtra,
          displayProps: { compression: true },
          props: { kind: 'list', full: false }
        },
        {
          key: '',
          label: kra.string.DueDate,
          presenter: kra.component.DueDatePresenter,
          displayProps: { key: 'dueDate', compression: true },
          props: { kind: 'list' }
        },
        {
          key: '',
          label: kra.string.Progress,
          presenter: performance.component.ProgressPresenter,
          props: { kind: 'list', size: 'small' },
          displayProps: {
            key: 'goal',
            fixed: 'right',
            optional: true
          }
        },
        {
          key: 'modifiedOn',
          presenter: kra.component.ModificationDatePresenter,
          displayProps: { key: 'modified', fixed: 'left', dividerBefore: true }
        }
      ],
      viewOptions: {
        groupDepth: 1,
        groupBy: ['kra'],
        orderBy: [
          ['modifiedOn', SortingOrder.Descending],
          ['status', SortingOrder.Ascending],
          ['kind', SortingOrder.Ascending],
          ['priority', SortingOrder.Ascending],
          ['createdOn', SortingOrder.Descending],
          ['dueDate', SortingOrder.Ascending],
          ['rank', SortingOrder.Ascending]
        ],
        other: []
      }
    },
    performance.viewlet.WithKRAList
  )
}
