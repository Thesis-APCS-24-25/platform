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

import activity from '@hcengineering/activity'
import chunter from '@hcengineering/chunter'
import { AccountRole, type Ref, type Status } from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/model-core'
import { generateClassNotificationTypes } from '@hcengineering/model-notification'
import presentation from '@hcengineering/model-presentation'
import task from '@hcengineering/model-task'
import view from '@hcengineering/model-view'
import workbench from '@hcengineering/model-workbench'
import notification from '@hcengineering/notification'
import setting from '@hcengineering/setting'
import pluginState, { kraId } from '@hcengineering/kra'

import type { TaskStatusFactory } from '@hcengineering/task'
import { PaletteColorIndexes } from '@hcengineering/ui/src/colors'
import { createActions as defineActions } from './actions'
import kra from './plugin'
import performance from '@hcengineering/model-performance'
import { definePresenters } from './presenters'
import {
  DOMAIN_KRA,
  TClassicProjectTypeData,
  TIssue,
  TIssueStatus,
  TIssueTemplate,
  TIssueTypeData,
  TProject,
  TProjectTargetPreference,
  TRelatedIssueTarget,
  TTimeSpendReport,
  TTypeEstimation,
  TTypeIssuePriority,
  TTypeRemainingTime,
  TTypeReportedTime
} from './types'
import { defineViewlets } from './viewlets'

export * from './types'
export { issuesOptions } from './viewlets'

export { kraId } from '@hcengineering/kra'
export { kraOperation } from './migration'
export { default } from './plugin'

/**
 * @public
 */
export const classicIssueTaskStatuses: TaskStatusFactory[] = [
  {
    category: task.statusCategory.UnStarted,
    statuses: [['Not Started', PaletteColorIndexes.Cloud, pluginState.status.Backlog]]
  },
  {
    category: task.statusCategory.ToDo,
    statuses: [['Todo', PaletteColorIndexes.Porpoise, pluginState.status.Todo]]
  },
  {
    category: task.statusCategory.Active,
    statuses: [['In Progress', PaletteColorIndexes.Cerulean, pluginState.status.InProgress]]
  },
  {
    category: task.statusCategory.Won,
    statuses: [['Done', PaletteColorIndexes.Grass, pluginState.status.Done]]
  },
  {
    category: task.statusCategory.Lost,
    statuses: [['Canceled', PaletteColorIndexes.Coin, pluginState.status.Canceled]]
  }
]

function defineSortAndGrouping (builder: Builder): void {
  builder.mixin(kra.class.IssueStatus, core.class.Class, view.mixin.SortFuncs, {
    func: kra.function.IssueStatusSort
  })

  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.SortFuncs, {
    func: kra.function.IssuePrioritySort
  })

  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.AllValuesFunc, {
    func: kra.function.GetAllPriority
  })

  builder.mixin(kra.class.IssueStatus, core.class.Class, view.mixin.AllValuesFunc, {
    func: kra.function.GetAllStates
  })
}

function defineNotifications (builder: Builder): void {
  builder.createDoc(
    notification.class.NotificationGroup,
    core.space.Model,
    {
      label: kra.string.Issues,
      icon: kra.icon.Issues,
      objectClass: kra.class.Issue
    },
    kra.ids.TrackerNotificationGroup
  )

  builder.createDoc(
    notification.class.NotificationType,
    core.space.Model,
    {
      hidden: false,
      generated: false,
      label: task.string.AssignedToMe,
      group: kra.ids.TrackerNotificationGroup,
      field: 'assignee',
      txClasses: [core.class.TxCreateDoc, core.class.TxUpdateDoc],
      objectClass: kra.class.Issue,
      onlyOwn: true,
      templates: {
        textTemplate: '{doc} was assigned to you by {sender}',
        htmlTemplate: '<p>{doc} was assigned to you by {sender}</p>',
        subjectTemplate: '{doc} was assigned to you'
      },
      defaultEnabled: true
    },
    kra.ids.AssigneeNotification
  )

  generateClassNotificationTypes(
    builder,
    kra.class.Issue,
    kra.ids.TrackerNotificationGroup,
    [],
    ['comments', 'status', 'priority', 'assignee', 'subIssues', 'blockedBy', 'dueDate']
  )
}

/**
 * Define filters
 */
function defineFilters (builder: Builder): void {
  //
  // Issue
  //
  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ClassFilters, {
    filters: ['kind', 'status', 'priority', 'space', 'createdBy', 'assignee'],
    ignoreKeys: ['number', 'estimation', 'attachedTo'],
    getVisibleFilters: kra.function.GetVisibleFilters
  })

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectIdentifier, {
    provider: kra.function.IssueIdentifierProvider
  })

  builder.mixin(kra.class.Issue, core.class.Class, chunter.mixin.ObjectChatPanel, {
    ignoreKeys: [
      'number',
      'createdBy',
      'attachedTo',
      'title',
      'collaborators',
      'description',
      'remainingTime',
      'reportedTime'
    ]
  })

  //
  // Issue Status
  //
  builder.mixin(kra.class.IssueStatus, core.class.Class, view.mixin.AttributeFilterPresenter, {
    presenter: kra.component.StatusFilterValuePresenter
  })

  //
  // Issue Template
  //
  builder.mixin(kra.class.IssueTemplate, core.class.Class, view.mixin.ClassFilters, {
    filters: []
  })

  //
  // Project
  //
  builder.mixin(kra.class.Project, core.class.Class, view.mixin.AttributeFilter, {
    component: view.component.ValueFilter
  })
  builder.mixin(kra.class.Project, core.class.Class, view.mixin.AttributeFilterPresenter, {
    presenter: kra.component.ProjectFilterValuePresenter
  })

  //
  // Type Issue Priority
  //
  builder.mixin(
    kra.class.TypeIssuePriority,
    core.class.Class,
    view.mixin.AttributeFilterPresenter,
    {
      presenter: kra.component.PriorityFilterValuePresenter
    }
  )

  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.AttributeFilter, {
    component: view.component.ValueFilter
  })
}

function defineApplication (
  builder: Builder,
  opt: {
    myIssuesId: string
    allIssuesId: string
    issuesId: string
    templatesId: string
    labelsId: string
  }
): void {
  builder.createDoc(
    workbench.class.Application,
    core.space.Model,
    {
      label: kra.string.TrackerApplication,
      icon: kra.icon.TrackerApplication,
      alias: kraId,
      hidden: false,
      locationResolver: kra.resolver.Location,
      navigatorModel: {
        specials: [
          {
            id: opt.myIssuesId,
            position: 'top',
            label: kra.string.MyIssues,
            icon: kra.icon.MyIssues,
            component: kra.component.MyIssues,
            componentProps: {
              icon: kra.icon.MyIssues,
              config: [
                ['assigned', view.string.Assigned, {}],
                ['active', kra.string.Active, {}],
                ['backlog', kra.string.Backlog, {}],
                ['created', view.string.Created, {}],
                ['subscribed', view.string.Subscribed, {}]
              ]
            }
          },
          {
            id: opt.allIssuesId,
            position: 'top',
            label: kra.string.AllIssues,
            icon: kra.icon.Issues,
            component: kra.component.Issues,
            componentProps: {
              space: undefined,
              icon: kra.icon.Issues,
              title: kra.string.AllIssues,
              config: [
                ['all', kra.string.All, {}],
                ['active', kra.string.Active, {}],
                ['backlog', kra.string.Backlog, {}]
              ],
              allProjectsTypes: true
            }
          },
          {
            id: 'all-projects',
            component: workbench.component.SpecialView,
            icon: view.icon.List,
            accessLevel: AccountRole.User,
            label: kra.string.AllProjects,
            position: 'bottom',
            spaceClass: kra.class.Project,
            componentProps: {
              _class: kra.class.Project,
              icon: view.icon.List,
              label: kra.string.AllProjects
            }
          },
          {
            id: opt.labelsId,
            component: kra.component.LabelsView,
            accessLevel: AccountRole.User,
            icon: kra.icon.Labels,
            label: kra.string.Labels,
            // createItemLabel: task.string.TaskCreateLabel,
            position: 'bottom'
          }
        ],
        spaces: [
          {
            id: 'projects',
            label: kra.string.Projects,
            spaceClass: kra.class.Project,
            addSpaceLabel: kra.string.CreateProject,
            createComponent: kra.component.CreateProject,
            visibleIf: kra.function.IsProjectJoined,
            icon: kra.icon.Home,
            specials: [
              {
                id: opt.issuesId,
                label: kra.string.Issues,
                icon: kra.icon.Issues,
                component: kra.component.Issues,
                componentProps: {
                  icon: kra.icon.Issues,
                  title: kra.string.Issues,
                  config: [
                    ['all', kra.string.All, {}],
                    ['active', kra.string.Active, {}],
                    ['backlog', kra.string.Backlog, {}]
                  ]
                }
              },
              {
                id: opt.templatesId,
                label: kra.string.IssueTemplates,
                icon: kra.icon.IssueTemplates,
                component: kra.component.IssueTemplates
              }
            ]
          }
        ]
      },
      navHeaderComponent: kra.component.NewIssueHeader
    },
    kra.app.Tracker
  )
}

export function createModel (builder: Builder): void {
  builder.createModel(
    TProject,
    TIssue,
    TIssueTemplate,
    TIssueStatus,
    TTypeIssuePriority,
    TTimeSpendReport,
    TTypeReportedTime,
    TRelatedIssueTarget,
    TTypeEstimation,
    TTypeRemainingTime,
    TProjectTargetPreference
  )

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectFactory, {
    component: kra.component.CreateIssue
  })

  builder.mixin(kra.class.Issue, core.class.Class, performance.mixin.ActionItemFactory, {
    component: kra.component.CreateIssue
  })
  builder.mixin(kra.class.Project, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(kra.class.Issue, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(kra.class.IssueTemplate, core.class.Class, activity.mixin.ActivityDoc, {})

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.LinkIdProvider, {
    encode: kra.function.GetIssueId,
    decode: kra.function.GetIssueIdByIdentifier
  })

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: kra.class.Issue,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: kra.class.IssueTemplate,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  defineViewlets(builder)

  const issuesId = 'issues'
  const templatesId = 'templates'
  const myIssuesId = 'my-issues'
  const allIssuesId = 'all-issues'
  const labelsId = 'labels'
  // const scrumsId = 'scrums'

  definePresenters(builder)

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectTitle, {
    titleProvider: kra.function.IssueTitleProvider
  })

  defineSortAndGrouping(builder)

  builder.mixin(kra.class.Issue, core.class.Class, notification.mixin.ClassCollaborators, {
    fields: ['createdBy', 'assignee']
  })

  builder.mixin(kra.class.Issue, core.class.Class, setting.mixin.Editable, {
    value: true
  })

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.LinkProvider, {
    encode: kra.function.GetIssueLinkFragment
  })

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectPanel, {
    component: kra.component.EditIssue
  })

  builder.mixin(kra.class.IssueTemplate, core.class.Class, view.mixin.ObjectPanel, {
    component: kra.component.EditIssueTemplate
  })

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: kra.class.Issue,
      action: 'update',
      icon: kra.icon.Issue,
      config: {
        status: {
          iconPresenter: kra.component.IssueStatusIcon
        },
        priority: {
          iconPresenter: kra.component.PriorityIconPresenter
        },
        estimation: {
          icon: kra.icon.Estimation
        }
      }
    },
    kra.ids.IssueUpdatedActivityViewlet
  )

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: kra.class.Issue,
      action: 'create',
      icon: kra.icon.Issue,
      valueAttr: 'title'
    },
    kra.ids.IssueCreatedActivityViewlet
  )

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: kra.class.Issue,
      action: 'remove',
      icon: kra.icon.Issue,
      valueAttr: 'title'
    },
    kra.ids.IssueRemovedActivityViewlet
  )

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: kra.class.IssueTemplate,
      action: 'update',
      config: {
        priority: {
          iconPresenter: kra.component.PriorityIconPresenter
        }
      }
    },
    kra.ids.IssueTemplateUpdatedActivityViewlet
  )

  defineApplication(builder, { myIssuesId, allIssuesId, issuesId, templatesId, labelsId })

  defineActions(builder, issuesId, myIssuesId)

  defineFilters(builder)

  builder.createDoc(
    presentation.class.ObjectSearchCategory,
    core.space.Model,
    {
      icon: kra.icon.TrackerApplication,
      label: kra.string.SearchIssue,
      title: kra.string.Issues,
      query: kra.completion.IssueQuery,
      context: ['search', 'mention', 'spotlight'],
      classToSearch: kra.class.Issue,
      priority: 300
    },
    kra.completion.IssueCategory
  )

  defineNotifications(builder)

  builder.createDoc(setting.class.WorkspaceSettingCategory, core.space.Model, {
    name: 'relations',
    label: kra.string.RelatedIssues,
    icon: kra.icon.Relations,
    component: kra.component.SettingsRelatedTargets,
    group: 'settings-editor',
    role: AccountRole.Maintainer,
    order: 4000
  })

  builder.createDoc(
    chunter.class.ChatMessageViewlet,
    core.space.Model,
    {
      messageClass: chunter.class.ChatMessage,
      objectClass: kra.class.Issue,
      label: chunter.string.LeftComment
    },
    kra.ids.IssueChatMessageViewlet
  )

  builder.createDoc(
    chunter.class.ChatMessageViewlet,
    core.space.Model,
    {
      messageClass: chunter.class.ChatMessage,
      objectClass: kra.class.IssueTemplate,
      label: chunter.string.LeftComment
    },
    kra.ids.IssueTemplateChatMessageViewlet
  )

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectIcon, {
    component: kra.component.IssueStatusPresenter
  })

  builder.createDoc(core.class.DomainIndexConfiguration, core.space.Model, {
    domain: DOMAIN_KRA,
    disabled: [
      { space: 1 },
      { attachedToClass: 1 },
      { status: 1 },
      { project: 1 },
      { priority: 1 },
      { assignee: 1 },
      { sprint: 1 },
      { component: 1 },
      { category: 1 },
      { modifiedOn: 1 },
      { modifiedBy: 1 },
      { createdBy: 1 },
      { relations: 1 },
      { createdOn: -1 },
      { kra: 1 }
    ]
  })

  defineSpaceType(builder)
}

function defineSpaceType (builder: Builder): void {
  builder.createModel(TClassicProjectTypeData)
  builder.createDoc(
    task.class.ProjectTypeDescriptor,
    core.space.Model,
    {
      name: kra.string.TrackerApplication,
      description: kra.string.ManageWorkflowStatuses,
      icon: task.icon.Task,
      baseClass: kra.class.Project,
      availablePermissions: [
        core.permission.UpdateSpace,
        core.permission.ArchiveSpace,
        core.permission.ForbidDeleteObject
      ],
      allowedClassic: true,
      allowedTaskTypeDescriptors: [kra.descriptors.Issue]
    },
    kra.descriptors.ProjectType
  )

  builder.createDoc(
    task.class.TaskTypeDescriptor,
    core.space.Model,
    {
      baseClass: kra.class.Issue,
      allowCreate: true,
      description: kra.string.Issue,
      icon: kra.icon.Issue,
      name: kra.string.Issue,
      statusCategoriesFunc: kra.function.GetIssueStatusCategories
    },
    kra.descriptors.Issue
  )

  const classicStatuses: Ref<Status>[] = []

  // Create statuses for the default task type
  for (const { category, statuses } of classicIssueTaskStatuses) {
    for (const status of statuses) {
      const [name, color, statusId] = Array.isArray(status)
        ? status
        : [status, undefined, undefined]

      if (statusId === undefined) {
        throw new Error('Status id is required when creating in static model. Missing for: ' + name)
      }

      classicStatuses.push(statusId)

      builder.createDoc(
        kra.class.IssueStatus,
        core.space.Model,
        {
          ofAttribute: kra.attribute.IssueStatus,
          name,
          color,
          category
        },
        statusId
      )
    }
  }

  // Create default task type
  builder.createModel(TIssueTypeData)

  builder.createDoc(
    task.class.TaskType,
    core.space.Model,
    {
      parent: pluginState.ids.ClassingProjectType,
      statuses: classicStatuses,
      descriptor: kra.descriptors.Issue,
      name: 'Issue',
      kind: 'both',
      ofClass: kra.class.Issue,
      targetClass: kra.mixin.IssueTypeData,
      statusClass: kra.class.IssueStatus,
      statusCategories: classicIssueTaskStatuses.map((it) => it.category),
      allowedAsChildOf: [kra.taskTypes.Issue],
      icon: kra.icon.Issue
    },
    kra.taskTypes.Issue
  )

  builder.createDoc(
    task.class.ProjectType,
    core.space.Model,
    {
      name: 'Classic project',
      descriptor: kra.descriptors.ProjectType,
      description: '',
      tasks: [kra.taskTypes.Issue],
      roles: 0,
      classic: true,
      statuses: classicStatuses.map((s) => ({ _id: s, taskType: kra.taskTypes.Issue })),
      targetClass: kra.mixin.ClassicProjectTypeData
    },
    pluginState.ids.ClassingProjectType
  )
}
