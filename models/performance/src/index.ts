import { Builder } from "@hcengineering/model";
import { KRAStatus, performanceId, ReviewSessionStatus } from "@hcengineering/performance";
import tracker from '@hcengineering/model-tracker'
import activity from '@hcengineering/activity'
import chunter from '@hcengineering/chunter'
import kraTeam from '@hcengineering/model-kra-team'
import performance from "./plugin";
import task from "@hcengineering/task";
import { Domain, Ref, StatusCategory } from "@hcengineering/core";
import core from "@hcengineering/model-core";
import workbench from "@hcengineering/model-workbench";
import view from "@hcengineering/model-view";
import { TDefaultKRAData, TDefaultReviewSessionData, TKRA, TKRAStatus, TReviewSession, TReviewSessionStatus } from "./types";

export { performanceId } from '@hcengineering/performance'
export { performance as default }
export { performanceOperation } from './migration'

export const DOMAIN_PERFORMANCE = 'performance' as Domain

function defineTeam(builder: Builder): void {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.SpacePresenter, {
    presenter: performance.component.TeamSpacePresenter
  })
}

function defineReviewSession(builder: Builder): void {
  builder.createModel(TReviewSession, TReviewSessionStatus, TDefaultReviewSessionData)

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
        core.permission.ForbidDeleteObject
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

  builder.createDoc(
    view.class.Viewlet, 
    core.space.Model, 
    {
      attachTo: performance.class.ReviewSession,
      descriptor: view.viewlet.Table,
      config: ['name', 'description', 'reviewSessionStatus','reviewSessionStart', 'reviewSessionEnd'],
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
    },
  )

  builder.mixin(performance.class.ReviewSession, core.class.Class, view.mixin.IgnoreActions, {
    actions: [tracker.action.EditRelatedTargets, tracker.action.NewRelatedIssue]
  })

  builder.createDoc(
    performance.class.ReviewSessionStatus,
    core.space.Model,
    {
      name: "Drafting",
      ofAttribute: performance.attribute.ReviewSessionAttribute
    },
    performance.reviewSessionStatus.Drafting
  )

  builder.createDoc(
    performance.class.ReviewSessionStatus,
    core.space.Model,
    {
      name: "InProgress",
      ofAttribute: performance.attribute.ReviewSessionAttribute
    },
    performance.reviewSessionStatus.InProgress
  )

  builder.createDoc(
    performance.class.ReviewSessionStatus,
    core.space.Model,
    {
      name: "Concluded",
      ofAttribute: performance.attribute.ReviewSessionAttribute
    },
    performance.reviewSessionStatus.Concluded
  )

}

function defineKRA(builder: Builder): void {
  builder.createModel(TKRA, TKRAStatus, TDefaultKRAData)

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
      createItemLabel: performance.string.CreateKraLabel,
    }
  })

  builder.createDoc(
    view.class.Viewlet, 
    core.space.Model, 
    {
      attachTo: performance.class.KRA,
      descriptor: view.viewlet.Table,
      config: [
        {
          key: '',
          label: performance.string.Title,
          presenter: performance.component.KRAPresenter,
        }
        , 'description', 'assignee', 'kraStatus']
    },
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: "Drafting",
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    performance.kraStatus.Drafting
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: "NeedChanges",
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    performance.kraStatus.NeedChanges
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: "Approved",
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    performance.kraStatus.Approved
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: "InProgress",
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    performance.kraStatus.InProgress
  )

  builder.createDoc(
    performance.class.KRAStatus,
    core.space.Model,
    {
      name: "Archived",
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    performance.kraStatus.Archived
  )
}

function defineSpaceType(builder: Builder): void {
  let kraStatuses: Ref<KRAStatus>[] = []
  for (const statusId of Object.values(performance.kraStatus)) {
    kraStatuses.push(statusId)
  }
  let kraCategories: Ref<StatusCategory>[] = []
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
  let reviewSessionStatuses: Ref<ReviewSessionStatus>[] = []
  for (const statusId of Object.values(performance.reviewSessionStatus)) {
    reviewSessionStatuses.push(statusId)
  }
  let reviewSessionCategories: Ref<StatusCategory>[] = []
  for (const category of Object.values(performance.reviewStatusCategory)) {
    reviewSessionCategories.push(category)
  }
  builder.createDoc(
    task.class.TaskType,
    core.space.Model,
    {
      parent: performance.ids.ClassingProjectType,
      statuses: kraStatuses,
      descriptor: kraTeam.descriptor.ReviewSessionType,
      name: 'ReviewSession',
      kind: 'task',
      ofClass: performance.class.ReviewSession,
      targetClass: performance.mixin.DefaultReviewSessionData,
      statusClass: performance.class.ReviewSessionStatus,
      statusCategories: reviewSessionCategories,
      allowedAsChildOf: [kraTeam.taskTypes.ReviewSession],
      icon: tracker.icon.Issue
    },
    kraTeam.taskTypes.ReviewSession
  )

  builder.createDoc(
    task.class.ProjectType,
    core.space.Model,
    {
      name: 'Classic project',
      descriptor: kraTeam.descriptor.TeamType,
      description: '',
      tasks: [kraTeam.taskTypes.ReviewSession],
      roles: 0,
      classic: true,
      statuses: reviewSessionStatuses.map((s) => ({ _id: s, taskType: kraTeam.taskTypes.ReviewSession })),
      targetClass: kraTeam.mixin.TeamTypeData
    },
    kraTeam.ids.ClassingProjectType
  )
}

function defineApplication(builder: Builder): void {
  builder.createDoc(
    workbench.class.Application,
    core.space.Model,
    {
      label: performance.string.PerformanceApplication,
      alias: performanceId,
      hidden: false,
      navHeaderComponent: performance.component.NewReviewSessionHeader,
      navigatorModel: {
        spaces: [
          {
            id: 'review-sessions',
            label: kraTeam.string.Teams,
            spaceClass: kraTeam.class.Team,
            addSpaceLabel: kraTeam.string.CreateTeam,
            createComponent: kraTeam.component.CreateTeam,
            specials: []
          }
        ],
        specials: [
          {
            id: 'review-session-browser',
            component: workbench.component.SpecialView,
            componentProps: {
              _class: performance.class.ReviewSession,
            },
            label: performance.string.MyReviewSessions,
            spaceClass: performance.class.ReviewSession,
            addSpaceLabel: performance.string.CreateReviewSessionLabel,
            position: 'top'
          },
          {
            id: 'kras',
            component: workbench.component.SpecialView,
            componentProps: {
              _class: performance.class.KRA
            },
            label: performance.string.MyKRAs,
            spaceClass: performance.class.KRA,
            addSpaceLabel: performance.string.CreateKraLabel,
            position: 'top'
          }
        ]
      }
    },
    performance.app.Performance
  )
}

function defineActivity(builder: Builder): void {
  builder.mixin(performance.class.ReviewSession, core.class.Class, activity.mixin.ActivityDoc, {})
  builder.mixin(performance.class.KRA, core.class.Class, activity.mixin.ActivityDoc, {})


  builder.createDoc(activity.class.ActivityExtension, core.space.Model, {
    ofClass: performance.class.KRA,
    components: { input: { component: chunter.component.ChatMessageInput } }
  })

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: performance.class.KRA,
      action: 'create',
      icon: performance.icon.KRA,
      valueAttr: 'title'
    }
  )

  builder.createDoc(
    activity.class.DocUpdateMessageViewlet,
    core.space.Model,
    {
      objectClass: performance.class.KRA,
      action: 'update',
      icon: tracker.icon.Issue,
    }
  )
}

function defineSortAndGrouping(builder: Builder): void {
  builder.mixin(performance.class.KRAStatus, core.class.Class, view.mixin.SortFuncs, {
    func: performance.function.KRAStatusSort
  })

  builder.mixin(performance.class.ReviewSessionStatus, core.class.Class, view.mixin.SortFuncs, {
    func: performance.function.ReviewSessionStatusSort
  })

  builder.mixin(performance.class.KRAStatus, core.class.Class, view.mixin.AllValuesFunc, {
    func: performance.function.GetAllKRAStates
  })

  builder.mixin(performance.class.ReviewSessionStatus, core.class.Class, view.mixin.AllValuesFunc, {
    func: performance.function.GetAllReviewSessionStates
  })
}

export function createModel (builder: Builder): void {
  defineTeam(builder)
  defineReviewSession(builder)
  defineKRA(builder)
  defineSpaceType(builder)
  defineActivity(builder)
  defineSortAndGrouping(builder)

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
}
