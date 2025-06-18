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

import contact from '@hcengineering/contact'
import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/model-core'
import task from '@hcengineering/model-task'
import view, { actionTemplates, createAction } from '@hcengineering/model-view'
import workbench, { createNavigateAction } from '@hcengineering/model-workbench'
import { type IntlString } from '@hcengineering/platform'
import { kraId } from '@hcengineering/kra'
import { type KeyBinding } from '@hcengineering/view'
import kra from './plugin'

import tags from '@hcengineering/tags'
import { defaultPriorities, issuePriorities } from '@hcengineering/kra-resources/src/types'
import performance from '@hcengineering/model-performance'

function createGotoSpecialAction(
  builder: Builder,
  id: string,
  key: KeyBinding,
  label: IntlString,
  query?: Record<string, string | null>
): void {
  createNavigateAction(builder, key, label, kra.app.Tracker, {
    application: kraId,
    mode: 'space',
    spaceSpecial: id,
    spaceClass: kra.class.Project,
    query
  })
}
export function createActions(builder: Builder, issuesId: string, myIssuesId: string): void {
  createGotoSpecialAction(builder, issuesId, 'keyG->keyE', kra.string.GotoIssues)
  createGotoSpecialAction(builder, issuesId, 'keyG->keyA', kra.string.GotoActive, { mode: 'active' })
  createGotoSpecialAction(builder, issuesId, 'keyG->keyB', kra.string.GotoBacklog, { mode: 'backlog' })
  createNavigateAction(builder, 'keyG->keyM', kra.string.GotoMyIssues, kra.app.Tracker, {
    application: kraId,
    mode: 'special',
    special: myIssuesId
  })

  createAction(builder, {
    action: workbench.actionImpl.Navigate,
    actionProps: {
      mode: 'app',
      application: kraId
    },
    label: kra.string.GotoTrackerApplication,
    icon: view.icon.ArrowRight,
    input: 'none',
    category: view.category.Navigation,
    target: core.class.Doc,
    context: {
      mode: ['workbench', 'browser', 'editor', 'panel', 'popup']
    }
  })

  createAction(
    builder,
    {
      action: kra.actionImpl.EditWorkflowStatuses,
      label: kra.string.EditWorkflowStatuses,
      icon: view.icon.Statuses,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Project,
      override: [task.action.EditStatuses],
      query: {},
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      }
    },
    kra.action.EditWorkflowStatuses
  )

  createAction(
    builder,
    {
      action: kra.actionImpl.EditProject,
      label: kra.string.EditProject,
      icon: contact.icon.Edit,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Project,
      visibilityTester: view.function.CanEditSpace,
      query: {},
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      }
    },
    kra.action.EditProject
  )

  createAction(
    builder,
    {
      action: kra.actionImpl.DeleteProject,
      label: workbench.string.Archive,
      icon: view.icon.Archive,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Project,
      visibilityTester: view.function.CanArchiveSpace,
      query: {
        archived: false
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      },
      override: [view.action.Archive, view.action.Delete]
    },
    kra.action.DeleteProject
  )
  createAction(
    builder,
    {
      action: kra.actionImpl.DeleteProject,
      label: workbench.string.Delete,
      icon: view.icon.Delete,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Project,
      visibilityTester: view.function.CanDeleteSpace,
      query: {
        archived: true
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      },
      override: [view.action.Archive, view.action.Delete]
    },
    kra.action.DeleteProjectClean
  )

  createAction(
    builder,
    {
      action: kra.actionImpl.DeleteIssue,
      label: workbench.string.Delete,
      icon: view.icon.Delete,
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        group: 'remove'
      },
      visibilityTester: view.function.CanDeleteObject,
      override: [view.action.Delete]
    },
    kra.action.DeleteIssue
  )

  builder.createDoc(
    view.class.ActionCategory,
    core.space.Model,
    { label: kra.string.TrackerApplication, visible: true },
    kra.category.Tracker
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.CreateIssue,
        element: 'top'
      },
      label: kra.string.NewIssue,
      icon: kra.icon.NewIssue,
      keyBinding: ['keyC'],
      input: 'none',
      category: kra.category.Tracker,
      target: core.class.Doc,
      context: {
        mode: ['browser'],
        application: kra.app.Tracker,
        group: 'create'
      },
      override: [kra.action.NewIssueGlobal]
    },
    kra.action.NewIssue
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.CreateIssue,
        element: 'top'
      },
      label: kra.string.NewIssue,
      icon: kra.icon.NewIssue,
      input: 'none',
      category: kra.category.Tracker,
      target: core.class.Doc,
      context: {
        mode: [],
        group: 'create'
      }
    },
    kra.action.NewIssueGlobal
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'parentIssue',
          space: 'space'
        }
      },
      label: kra.string.NewSubIssue,
      icon: kra.icon.Subissue,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'associate'
      }
    },
    kra.action.NewSubIssue
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.SetParentIssueActionPopup,
        element: 'top',
        fillProps: {
          _objects: 'value'
        }
      },
      label: kra.string.SetParent,
      icon: kra.icon.Parent,
      input: 'none',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context'],
        application: kra.app.Tracker,
        group: 'associate'
      }
    },
    kra.action.SetParent
  )

  createAction(builder, {
    action: view.actionImpl.ShowPopup,
    actionProps: {
      component: kra.component.AddGoalActionPopup,
      element: 'top',
      fillProps: {
        _objects: 'value'
      }
    },
    label: kra.string.AddGoal,
    icon: kra.icon.Goal,
    input: 'none',
    category: kra.category.Tracker,
    visibilityTester: kra.function.CanAddGoal,
    target: kra.class.Issue,
    context: {
      mode: ['context'],
      application: kra.app.Tracker,
      group: 'associate'
    }
  })
  createAction(
    builder,
    {
      action: view.actionImpl.UpdateDocument,
      actionProps: {
        key: 'attachedTo',
        value: kra.ids.NoParent
      },
      query: {
        attachedTo: { $ne: kra.ids.NoParent }
      },
      label: kra.string.UnsetParentIssue,
      icon: kra.icon.UnsetParent,
      input: 'none',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context'],
        application: kra.app.Tracker,
        group: 'associate'
      }
    },
    kra.action.UnsetParent
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'relatedTo',
          space: 'space'
        }
      },
      label: kra.string.NewRelatedIssue,
      icon: kra.icon.NewIssue,
      input: 'focus',
      category: kra.category.Tracker,
      target: core.class.Doc,
      context: {
        mode: ['context', 'browser', 'editor'],
        group: 'associate'
      }
    },
    kra.action.NewRelatedIssue
  )

  createAction(builder, {
    action: view.actionImpl.ShowPopup,
    actionPopup: kra.component.SetParentIssueActionPopup,
    actionProps: {
      component: kra.component.SetParentIssueActionPopup,
      element: 'top',
      fillProps: {
        _object: 'value'
      }
    },
    label: kra.string.SetParent,
    icon: kra.icon.Parent,
    input: 'none',
    category: kra.category.Tracker,
    target: kra.class.Issue,
    override: [kra.action.SetParent],
    context: {
      mode: ['browser'],
      application: kra.app.Tracker,
      group: 'associate'
    }
  })

  createAction(builder, {
    ...actionTemplates.open,
    actionProps: {
      component: kra.component.EditIssue
    },
    target: kra.class.Issue,
    context: {
      mode: ['browser', 'context'],
      group: 'create'
    },
    override: [view.action.Open]
  })

  createAction(builder, {
    ...actionTemplates.open,
    actionProps: {
      component: kra.component.EditIssueTemplate
    },
    target: kra.class.IssueTemplate,
    context: {
      mode: ['browser', 'context'],
      group: 'create'
    },
    override: [view.action.Open]
  })

  createAction(
    builder,
    {
      action: task.actionImpl.SelectStatus,
      actionPopup: task.component.StatusSelector,
      actionProps: {
        _class: kra.class.IssueStatus,
        ofAttribute: kra.attribute.IssueStatus,
        placeholder: kra.string.Status
      },
      label: kra.string.Status,
      icon: kra.icon.CategoryBacklog,
      keyBinding: ['keyS->keyS'],
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'edit'
      }
    },
    kra.action.SetStatus
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'priority',
        values: defaultPriorities.map((p) => ({ id: p, ...issuePriorities[p] })),
        placeholder: kra.string.SetPriority
      },
      label: kra.string.Priority,
      icon: kra.icon.PriorityHigh,
      keyBinding: ['keyP->keyR'],
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'edit'
      }
    },
    kra.action.SetPriority
  )
  createAction(
    builder,
    {
      action: view.actionImpl.AttributeSelector,
      actionPopup: kra.component.AssigneeEditor,
      actionProps: {
        attribute: 'assignee',
        isAction: true,
        valueKey: 'object'
        // _class: contact.mixin.Employee,
        // query: {},
        // placeholder: tracker.string.AssignTo
      },
      label: kra.string.Assignee,
      icon: contact.icon.Person,
      keyBinding: ['keyA'],
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'edit'
      }
    },
    kra.action.SetAssignee
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tags.component.ObjectsTagsEditorPopup,
        element: 'top',
        fillProps: {
          _objects: 'value'
        }
      },
      label: kra.string.Labels,
      icon: tags.icon.Tags,
      keyBinding: ['keyL'],
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'edit'
      }
    },
    kra.action.SetLabels
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.SetDueDateActionPopup,
        props: { mondayStart: true, withTime: false },
        element: 'top',
        fillProps: {
          _objects: 'value'
        }
      },
      label: kra.string.SetDueDate,
      icon: kra.icon.DueDate,
      keyBinding: ['keyD'],
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'edit'
      }
    },
    kra.action.SetDueDate
  )

  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: kra.function.GetIssueId
      },
      label: kra.string.CopyIssueId,
      icon: view.icon.CopyId,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      visibilityTester: view.function.IsClipboardAvailable,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'copy'
      }
    },
    kra.action.CopyIssueId
  )
  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: kra.function.GetIssueTitle
      },
      label: kra.string.CopyIssueTitle,
      icon: kra.icon.CopyBranch,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      visibilityTester: view.function.IsClipboardAvailable,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'copy'
      }
    },
    kra.action.CopyIssueTitle
  )
  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: kra.function.GetIssueLink
      },
      label: kra.string.CopyIssueUrl,
      icon: view.icon.CopyLink,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      visibilityTester: view.function.IsClipboardAvailable,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'copy'
      }
    },
    kra.action.CopyIssueLink
  )
  createAction(
    builder,
    {
      action: kra.actionImpl.Move,
      label: kra.string.MoveToProject,
      icon: view.icon.Move,
      input: 'any',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'associate'
      },
      override: [task.action.Move]
    },
    kra.action.MoveToProject
  )
  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: kra.component.RelationsPopup,
      actionProps: {
        attribute: ''
      },
      label: kra.string.Relations,
      icon: kra.icon.Relations,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'associate'
      }
    },
    kra.action.Relations
  )
  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: kra.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'originalIssue',
          space: 'space'
        }
      },
      label: kra.string.Duplicate,
      icon: kra.icon.Duplicate,
      input: 'focus',
      category: kra.category.Tracker,
      target: kra.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: kra.app.Tracker,
        group: 'associate'
      }
    },
    kra.action.Duplicate
  )

  // createAction(
  //   builder,
  //   {
  //     action: view.actionImpl.ShowPopup,
  //     actionProps: {
  //       component: kra.component.EditRelatedTargetsPopup,
  //       element: 'top',
  //       fillProps: {
  //         _objects: 'value'
  //       }
  //     },
  //     label: kra.string.MapRelatedIssues,
  //     icon: kra.icon.Relations,
  //     input: 'none',
  //     category: kra.category.Tracker,
  //     target: core.class.Space,
  //     query: {
  //       _class: { $ne: kra.class.Project }
  //     },
  //     context: {
  //       mode: ['context'],
  //       application: kra.app.Tracker,
  //       group: 'associate'
  //     }
  //   },
  //   kra.action.EditRelatedTargets
  // )
  ignoreActions(builder)
}

function ignoreActions(builder: Builder): void {
  builder.mixin(performance.class.PerformanceReport, core.class.Class, view.mixin.IgnoreActions, {
    actions: [kra.action.NewRelatedIssue]
  })
}
