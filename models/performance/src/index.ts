import { ArrOf, Builder, Index, Mixin, Model, Prop, TypeDate, TypeRef, TypeString } from "@hcengineering/model";
import { KRA, KRAStatus, performanceId, ReviewSession, ReviewSessionStatus } from "@hcengineering/performance";
import { TProject, TTask } from "@hcengineering/model-task";
import tracker from '@hcengineering/model-tracker'
import performance from "./plugin";
import task from "@hcengineering/task";
import { Account, Arr, Domain, IndexKind, Ref, Role, RolesAssignment, Timestamp } from "@hcengineering/core";
import core, { TStatus } from "@hcengineering/model-core";
import workbench from "@hcengineering/model-workbench";
import view from "@hcengineering/model-view";

export { performanceId } from '@hcengineering/performance'
export { performance as default }

export const DOMAIN_PERFORMANCE = 'performance' as Domain

@Model(performance.class.ReviewSessionStatus, core.class.Status)
export class TReviewSessionStatus extends TStatus implements ReviewSessionStatus {}

@Model(performance.class.KRAStatus, core.class.Status)
export class TKRAStatus extends TStatus implements KRAStatus {}

@Model(performance.class.ReviewSession, task.class.Project)
export class TReviewSession extends TProject implements ReviewSession {
  @Prop(TypeRef(core.class.Status), performance.string.ReviewSessionStatus)
  reviewSessionStatus!: Ref<ReviewSessionStatus>;
  @Prop(TypeDate(), performance.string.ReviewSessionStart)
  reviewSessionStart!: Timestamp;
  @Prop(TypeDate(), performance.string.ReviewSessionEnd)
  reviewSessionEnd!: Timestamp;
  @Prop(ArrOf(TypeRef(performance.class.KRA)), performance.string.ReviewSessionKRAs)
  kras?: Arr<Ref<KRA>>;
}

@Model(performance.class.KRA, task.class.Task)
export class TKRA extends TTask implements KRA {
  @Prop(TypeString(), performance.string.Title)
  title!: string
  @Prop(TypeString(), performance.string.Description)
  @Index(IndexKind.FullText)
    declare description: string
  @Prop(TypeRef(core.class.Status), performance.string.KRAStatus)
  kraStatus!: Ref<KRAStatus>
}

@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}


export function createModel (builder: Builder): void {
  builder.createModel(TReviewSession, TKRA, TReviewSessionStatus, TKRAStatus, TDefaultReviewSessionData)

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
            label: performance.string.ReviewSessions,
            spaceClass: performance.class.ReviewSession,
            addSpaceLabel: performance.string.CreateReviewSessionLabel,
            createComponent: performance.component.CreateReviewSession,
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

  builder.createDoc(
    view.class.Viewlet, 
    core.space.Model, 
    {
      attachTo: performance.class.KRA,
      descriptor: view.viewlet.Table,
      config: ['title', 'description', 'kraStatus']
    },
  )

  builder.mixin(performance.class.ReviewSession, core.class.Class, view.mixin.SpacePresenter, {
    presenter: performance.component.ReviewSessionSpacePresenter
  })

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
