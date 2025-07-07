import { type Builder } from '@hcengineering/model'
import { performanceId } from '@hcengineering/performance'
import activity from '@hcengineering/activity'
import chunter from '@hcengineering/chunter'
import kraTeam from '@hcengineering/model-kra-team'
import performance from './plugin'
import task from '@hcengineering/task'
import { type Status, type Ref, type StatusCategory } from '@hcengineering/core'
import core from '@hcengineering/model-core'
import workbench, { type Application } from '@hcengineering/model-workbench'
import view, { classPresenter, createAction } from '@hcengineering/model-view'
import {
  DOMAIN_PERFORMANCE,
  TDefaultKRAData,
  TDefaultReviewSessionData,
  TEmployeeKRA,
  TKRA,
  TReviewSession,
  TPerformanceReport,
  TTypeReviewSessionStatus,
  // TPerformanceReview,
  TActionItemFactory,
  TTypeKRAStatus,
  TProgress,
  TProgressReport,
  TPTask,
  TUnit,
  TKpi
} from './types'
import { defineViewlets } from './viewlets'
import { defineActions } from './actions'

export { performanceId } from '@hcengineering/performance'
export { performance as default }
export { performanceOperation } from './migration'
export { TPTask }

function defineTeam (builder: Builder): void {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.SpacePresenter, {
    presenter: performance.component.TeamSpacePresenter
  })
}

function defineProgress (builder: Builder): void {
  //
  // Unit
  //
  builder.mixin(performance.class.Unit, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: performance.component.UnitPresenter
  })

  classPresenter(builder, performance.class.Progress, performance.component.ProgressPresenter)

  classPresenter(
    builder,
    performance.class.Progress,
    performance.component.ProgressPresenter,
    performance.component.ProgressEditor
  )

  builder.mixin(performance.class.Progress, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: performance.component.ProgressObjectPresenter
  })
}

function defineReviewSession (builder: Builder): void {
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
      hiddenKeys: ['modifiedOn', 'modifiedBy', 'createdOn', 'createdBy', 'type', 'private', 'owners', 'autojoin']
    },
    config: [
      'name',
      'reviewSessionStart',
      'reviewSessionEnd',
      'members',
      {
        key: 'status',
        props: {
          readonly: true
        }
      }
    ],
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
  builder.mixin(performance.class.TypeKRAStatus, core.class.Class, view.mixin.AttributePresenter, {
    presenter: performance.component.KRAStatusPresenter
  })

  builder.mixin(performance.class.EmployeeKRA, core.class.Class, view.mixin.ListHeaderExtra, {
    presenters: [performance.component.EmployeeKRATotalWeightStat]
  })

  builder.mixin(performance.class.PTask, core.class.Class, view.mixin.ListHeaderExtra, {
    presenters: [performance.component.PTaskKRAStat]
  })

  builder.mixin(performance.class.EmployeeKRA, core.class.Class, view.mixin.IgnoreActions, {
    actions: [view.action.Open, view.action.OpenInNewTab]
  })

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

  builder.mixin(performance.class.KRA, core.class.Class, view.mixin.AllValuesFunc, {
    func: performance.function.GetAllKRAs
  })

  // builder.mixin(performance.class.ReviewSession, core.class.Class, workbench.mixin.SpaceView, {
  //   view: {
  //     class: performance.class.KRA,
  //     createItemDialog: performance.component.CreateKRA,
  //     createItemLabel: performance.string.CreateKraLabel
  //   }
  // })
  //
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
          // readonly: true
        }
      },
      'description'
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
          // readonly: true
        }
      },
      {
        key: 'weight',
        displayProps: {
          fixed: 'left'
        },
        props: {
          // readonly: true
        }
      }
    ]
  })

  createAction(
    builder,
    {
      action: performance.actionImpl.ApproveKRA,
      label: performance.string.ApproveKRA,
      icon: performance.icon.StatusApproved,
      input: 'any',
      category: performance.category.Performance,
      target: performance.class.EmployeeKRA,
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      },
      visibilityTester: performance.function.CanApproveKRA
    },
    performance.action.ApproveKRA
  )

  builder.createDoc(
    view.class.ActionCategory,
    core.space.Model,
    { label: performance.string.PerformanceApplication, visible: true },
    performance.category.Performance
  )
}

function defineReport (builder: Builder): void {
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
      },
      {
        key: '',
        presenter: performance.component.ScorePresenter,
        label: performance.string.ScorePreview
      },
      {
        key: 'score',
        presenter: performance.component.ScorePresenter,
        label: performance.string.GradedScore
      }
    ],
    viewOptions: {
      groupBy: [],
      orderBy: [],
      other: []
    }
  })
  //
  // builder.mixin(performance.class.PerformanceReview, core.class.Class, view.mixin.ObjectPresenter, {
  //   presenter: performance.component.ReviewPresenter
  // })
}

function defineSpaceType (builder: Builder): void {
  const kraStatuses: Ref<Status>[] = []
  const kraCategories: Ref<StatusCategory>[] = []

  builder.createDoc(
    task.class.TaskType,
    core.space.Model,
    {
      parent: performance.ids.ClassingProjectType,
      statuses: [],
      descriptor: performance.descriptor.KRAType,
      name: 'KRA',
      kind: 'task',
      ofClass: performance.class.KRA,
      targetClass: performance.mixin.DefaultKRAData,
      statusClass: performance.class.TypeKRAStatus,
      statusCategories: kraCategories,
      allowedAsChildOf: [performance.taskTypes.KRA],
      icon: task.icon.Task
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
      component: performance.component.PerformanceApplication,
      hidden: false
    },
    performance.app.Performance
  )
}

function defineActivity (builder: Builder): void {
  builder.mixin(performance.class.ReviewSession, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(performance.class.EmployeeKRA, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(performance.class.PerformanceReport, core.class.Class, activity.mixin.ActivityDoc, {})

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: performance.class.EmployeeKRA,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(activity.class.DocUpdateMessageViewlet, core.space.Model, {
    objectClass: performance.class.EmployeeKRA,
    action: 'create',
    icon: performance.icon.KRA,
    valueAttr: 'kra'
  })

  builder.createDoc(activity.class.DocUpdateMessageViewlet, core.space.Model, {
    objectClass: performance.class.PerformanceReport,
    action: 'update'
    // config: {
    //   reviewer: {
    //     icon: performance.icon.Reviewer,
    //   },
    //   content: {
    //     icon: performance.icon.Review,
    //   },
    //   score: {
    //     icon: performance.icon.Score,
    //   }
    // }
    // component: performance.component.ReportUpdateMessage
  })

  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: performance.class.PerformanceReport,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(
    chunter.class.ChatMessageViewlet,
    core.space.Model,
    {
      messageClass: chunter.class.ChatMessage,
      objectClass: performance.class.EmployeeKRA,
      label: chunter.string.LeftComment
    },
    performance.ids.EmployeeKRAMessageViewlet
  )

  builder.createDoc(
    chunter.class.ChatMessageViewlet,
    core.space.Model,
    {
      messageClass: chunter.class.ChatMessage,
      objectClass: performance.class.PerformanceReport,
      label: chunter.string.LeftComment
    },
    performance.ids.PerformanceReportMessageViewlet
  )

  builder.createDoc(activity.class.DocUpdateMessageViewlet, core.space.Model, {
    objectClass: performance.class.EmployeeKRA,
    action: 'update',
    icon: performance.icon.KRA
  })
}

export function createModel (builder: Builder): void {
  builder.createModel(
    TProgress,
    TKpi,
    TProgressReport,
    TPTask,
    TUnit,
    TTypeKRAStatus,
    TPerformanceReport,
    // TPerformanceReview,
    TKRA,
    TEmployeeKRA,
    TDefaultKRAData,
    TActionItemFactory,
    TTypeKRAStatus,
    TReviewSession,
    TDefaultReviewSessionData,
    TTypeReviewSessionStatus
  )
  defineTeam(builder)
  defineReviewSession(builder)
  defineProgress(builder)
  defineKRA(builder)
  defineActivity(builder)
  defineViewlets(builder)
  defineReport(builder)
  defineActions(builder)

  defineApplication(builder)

  builder.mixin(performance.class.Unit, core.class.Class, view.mixin.ObjectFactory, {
    component: performance.component.AddUnitPopup
  })

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
