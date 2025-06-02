import { type Builder } from '@hcengineering/model'
import { type KRAStatus, performanceId } from '@hcengineering/performance'
import tracker from '@hcengineering/model-tracker'
import activity from '@hcengineering/activity'
import chunter from '@hcengineering/chunter'
import kraTeam from '@hcengineering/model-kra-team'
import performance from './plugin'
import task from '@hcengineering/task'
import { type Ref, type StatusCategory } from '@hcengineering/core'
import core from '@hcengineering/model-core'
import workbench, { type Application } from '@hcengineering/model-workbench'
import view from '@hcengineering/model-view'
import {
  DOMAIN_PERFORMANCE,
  TDefaultKRAData,
  TDefaultReviewSessionData,
  TEmployeeKRA,
  TKRA,
  TKRAStatus,
  TReviewSession,
  TMeasureProgress,
  TPerformanceReport,
  TTypeReviewSessionStatus,
  TProgressPresenter
} from './types'
import { defineViewlets } from './viewlets'

export { performanceId } from '@hcengineering/performance'
export { performance as default }
export { performanceOperation } from './migration'

function defineTeam (builder: Builder): void {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.SpacePresenter, {
    presenter: performance.component.TeamSpacePresenter
  })
}

function defineReviewSession (builder: Builder): void {
  builder.createModel(TReviewSession, TDefaultReviewSessionData, TTypeReviewSessionStatus)

  builder.mixin(performance.class.ReviewSession, core.class.Class, view.mixin.SpacePresenter, {
    presenter: performance.component.ReviewSessionSpacePresenter
  })

  builder.createDoc(
    core.class.SpaceTypeDescriptor,
    core.space.Model,
    {
      name: performance.string.PerformanceApplication,
      description: performance.string.Description,
      icon: performance.icon.ReviewSession,
      baseClass: performance.class.ReviewSession,
      availablePermissions: [
        core.permission.UpdateSpace,
        core.permission.ArchiveSpace,
        core.permission.ForbidDeleteObject,
        core.permission.CreateObject,
        core.permission.UpdateObject
      ]
    },
    performance.descriptor.ReviewSessionType
  )

  builder.createDoc(
    core.class.SpaceType,
    core.space.Model,
    {
      name: 'Default review session type',
      descriptor: performance.descriptor.ReviewSessionType,
      roles: 0,
      targetClass: performance.mixin.DefaultReviewSessionData
    },
    performance.spaceType.ReviewSessionType
  )

  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: performance.class.ReviewSession,
    descriptor: view.viewlet.Table,
    configOptions: {
      hiddenKeys: ['modifiedOn', 'modifiedBy', 'createdOn', 'createdBy', 'type']
    },
    config: ['name', 'description', 'reviewSessionStart', 'reviewSessionEnd', 'members', 'status'],
    viewOptions: {
      groupBy: [],
      orderBy: [],
      other: [
        {
          key: 'hideArchived',
          type: 'toggle',
          defaultValue: true,
          actionTarget: 'options',
          action: view.function.HideArchived,
          label: view.string.HideArchived
        }
      ]
    }
  })

  builder.mixin(performance.class.ReviewSession, core.class.Class, view.mixin.IgnoreActions, {
    actions: [tracker.action.EditRelatedTargets, tracker.action.NewRelatedIssue]
  })

  builder.mixin(performance.class.TypeReviewSessionStatus, core.class.Class, view.mixin.AttributePresenter, {
    presenter: performance.component.ReviewSessionStatusPresenter
  })

  builder.mixin(performance.class.TypeReviewSessionStatus, core.class.Class, view.mixin.AttributeEditor, {
    inlineEditor: performance.component.ReviewSessionStatusEditor
  })

  builder.mixin(performance.class.TypeReviewSessionStatus, core.class.Class, view.mixin.AttributeFilter, {
    component: view.component.ValueFilter
  })
}

function defineKRA (builder: Builder): void {
  builder.createModel(TKRA, TEmployeeKRA, TKRAStatus, TDefaultKRAData)

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.AttributePresenter, {
    presenter: performance.component.KRARefPresenter
  })

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.AttributeEditor, {
    inlineEditor: performance.component.KRAEditor
  })

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.ObjectFactory, {
    component: performance.component.CreateKRA
  })

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.ObjectPanel, {
    component: performance.component.EditKRA
  })

  builder.mixin(performance.class.ReviewSession, core.class.Class, workbench.mixin.SpaceView, {
    view: {
      class: performance.class.KRA,
      createItemDialog: performance.component.CreateKRA,
      createItemLabel: performance.string.CreateKraLabel
    }
  })

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: performance.component.KRAPresenter
  })

  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: performance.class.KRA,
    descriptor: view.viewlet.Table,
    config: [
      {
        key: '',
        label: performance.string.Title,
        presenter: performance.component.KRAPresenter
      },
      {
        key: '',
        label: performance.string.AssignedTo,
        presenter: performance.component.KRAWeightEditorWithPopup,
        props: {
          readonly: true
        }
      },
      'description',
      'kraStatus'
    ]
  })

  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: performance.class.EmployeeKRA,
    descriptor: view.viewlet.List,
    config: [
      {
        key: '$lookup.kra',
        label: performance.string.Title,
        presenter: performance.component.KRAPresenter
      },
      {
        key: '',
        label: performance.string.AssignedTo,
        presenter: performance.component.KRAWeightEditorWithPopup,
        props: {
          readonly: true
        }
      },
      {
        key: 'weight',
        displayProps: {
          fixed: 'left'
        },
        props: {
          readonly: true
        }
      }
    ]
  })

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: 'Drafting',
      ofAttribute: performance.attribute.KRAStatus,
      category: task.statusCategory.UnStarted
    },
    performance.kraStatus.Drafting
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: 'Need Changes',
      ofAttribute: performance.attribute.KRAStatus,
      category: task.statusCategory.Active
    },
    performance.kraStatus.NeedChanges
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: 'Approved',
      ofAttribute: performance.attribute.KRAStatus,
      category: task.statusCategory.Won
    },
    performance.kraStatus.Approved
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: 'Cancelled',
      ofAttribute: performance.attribute.KRAStatus,
      category: task.statusCategory.Lost
    },
    performance.kraStatus.Cancelled
  )
}

function defineReport (builder: Builder): void {
  builder.createModel(TPerformanceReport)

  builder.mixin(performance.class.PerformanceReport, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: performance.component.ReportPresenter
  })

  builder.mixin(performance.class.PerformanceReport, core.class.Class, view.mixin.ObjectPanel, {
    component: performance.component.ReportPanel
  })

  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: performance.class.PerformanceReport,
    descriptor: view.viewlet.Table,
    config: [
      {
        key: '',
        presenter: performance.component.ReportPresenter,
        label: performance.string.Reviewee
      }
    ],
    viewOptions: {
      groupBy: [],
      orderBy: [],
      other: []
    }
  })
}

function defineSpaceType (builder: Builder): void {
  const kraStatuses: Ref<KRAStatus>[] = []
  for (const statusId of Object.values(performance.kraStatus)) {
    kraStatuses.push(statusId)
  }
  const kraCategories: Ref<StatusCategory>[] = []
  for (const category of Object.values(performance.kraStatusCategory)) {
    kraCategories.push(category)
  }

  builder.createDoc(
    task.class.TaskType,
    core.space.Model,
    {
      parent: performance.ids.ClassingProjectType,
      statuses: kraStatuses,
      descriptor: performance.descriptor.KRAType,
      name: 'KRA',
      kind: 'task',
      ofClass: performance.class.KRA,
      targetClass: performance.mixin.DefaultKRAData,
      statusClass: performance.class.KRAStatus,
      statusCategories: kraCategories,
      allowedAsChildOf: [performance.taskTypes.KRA],
      icon: tracker.icon.Issue
    },
    performance.taskTypes.KRA
  )

  builder.createDoc(
    task.class.ProjectType,
    core.space.Model,
    {
      name: 'Classic project',
      descriptor: performance.descriptor.ReviewSessionType,
      description: '',
      tasks: [performance.taskTypes.KRA],
      roles: 0,
      classic: true,
      statuses: kraStatuses.map((s) => ({ _id: s, taskType: performance.taskTypes.KRA })),
      targetClass: performance.mixin.DefaultReviewSessionData
    },
    performance.ids.ClassingProjectType
  )

  // Review Session
  // builder.createDoc(
  //   core.class.Status,
  //   core.space.Model,
  //   {
  //     name: 'Drafting',
  //     ofAttribute: performance.attribute.ReviewSessionAttribute
  //   },
  //   performance.reviewSessionStatus.Drafting
  // )

  // builder.createDoc(
  //   core.class.Status,
  //   core.space.Model,
  //   {
  //     name: 'In Progress',
  //     ofAttribute: performance.attribute.ReviewSessionAttribute
  //   },
  //   performance.reviewSessionStatus.InProgress
  // )

  // builder.createDoc(
  //   core.class.Status,
  //   core.space.Model,
  //   {
  //     name: 'Concluded',
  //     ofAttribute: performance.attribute.ReviewSessionAttribute
  //   },
  //   performance.reviewSessionStatus.Concluded
  // )
}

function defineApplication (builder: Builder): void {
  builder.createDoc<Application>(
    workbench.class.Application,
    core.space.Model,
    {
      label: performance.string.PerformanceApplication,
      alias: performanceId,
      navHeaderComponent: performance.component.TeamSwitchHeader,
      icon: performance.icon.ReviewSession,
      // component: performance.component.PerformanceApplication,
      hidden: false,
      navigatorModel: {
        spaces: [
          {
            id: 'active-review-session',
            visibleIf: performance.function.IsActiveReviewSessionOfCurrentTeam,
            icon: performance.icon.Active,
            label: performance.string.ActiveReviewSessions,
            spaceClass: performance.class.ReviewSession,
            specials: [
              {
                id: 'dashboard',
                label: performance.string.PerformanceDashboard,
                component: performance.component.PerformanceDashboard
              },
              {
                id: 'kras',
                label: performance.string.KRA,
                component: performance.component.AllKRAs
              },
              {
                id: 'my-kras',
                label: performance.string.MyKRAs,
                component: performance.component.MyKRAs
              },
              {
                id: 'my-reports',
                position: 'bottom',
                label: performance.string.PerformanceReports,
                component: workbench.component.SpecialView,
                componentProps: {
                  _class: performance.class.PerformanceReport
                }
              }
            ]
          },
          {
            id: 'review-session',
            visibleIf: performance.function.IsInactiveReviewSessionOfCurrentTeam,
            label: performance.string.ReviewSessions,
            spaceClass: performance.class.ReviewSession,
            specials: [
              {
                id: 'kras',
                label: performance.string.KRA,
                component: performance.component.AllKRAs
              },
              {
                id: 'my-kras',
                label: performance.string.MyKRAs,
                component: performance.component.MyKRAs
              },
              {
                id: 'my-reports',
                position: 'bottom',
                label: performance.string.PerformanceReports,
                component: workbench.component.SpecialView,
                componentProps: {
                  _class: performance.class.PerformanceReport
                }
              }
            ]
          }
        ],
        specials: [
          {
            id: 'all-review-sessions',
            label: performance.string.AllReviewSessions,
            component: performance.component.AllReviewSessions,
            componentProps: {
              _class: performance.class.ReviewSession
            }
          }
        ]
      }
    },
    performance.app.Performance
  )
}

function defineActivity (builder: Builder): void {
  builder.mixin(performance.class.ReviewSession, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(performance.class.KRA, core.class.Class, activity.mixin.ActivityDoc, {})

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: performance.class.PerformanceReport,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: performance.class.KRA,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(activity.class.DocUpdateMessageViewlet, core.space.Model, {
    objectClass: performance.class.KRA,
    action: 'create',
    icon: performance.icon.KRA,
    valueAttr: 'title'
  })

  builder.createDoc(activity.class.DocUpdateMessageViewlet, core.space.Model, {
    objectClass: performance.class.KRA,
    action: 'update',
    icon: tracker.icon.Issue
  })
}

function defineSortAndGrouping (builder: Builder): void {
  builder.mixin(performance.class.KRAStatus, core.class.Class, view.mixin.SortFuncs, {
    func: performance.function.KRAStatusSort
  })

  builder.mixin(performance.class.KRAStatus, core.class.Class, view.mixin.AllValuesFunc, {
    func: performance.function.GetAllKRAStates
  })
}

export function createModel (builder: Builder): void {
  builder.createModel(TMeasureProgress)
  builder.createModel(TProgressPresenter)
  defineTeam(builder)
  defineReviewSession(builder)
  defineKRA(builder)
  defineReport(builder)
  defineActivity(builder)
  defineSortAndGrouping(builder)
  defineViewlets(builder)

  defineApplication(builder)

  builder.createDoc(core.class.DomainIndexConfiguration, core.space.Model, {
    domain: DOMAIN_PERFORMANCE,
    disabled: [
      { modifiedOn: 1 },
      { modifiedBy: 1 },
      { createdBy: 1 },
      { attachedToClass: 1 },
      { createdOn: -1 },
      { attachedTo: 1 }
    ]
  })

  defineSpaceType(builder)
}
