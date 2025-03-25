import { ArrOf, Builder, Index, Mixin, Model, Prop, TypeDate, TypeRef, TypeString } from "@hcengineering/model";
import { KRA, KRAStatus, performanceId, ReviewSession } from "@hcengineering/performance";
import { TProject, TTask } from "@hcengineering/model-task";
import performance from "./plugin";
import task from "@hcengineering/task";
import { Account, Arr, IndexKind, Ref, Role, RolesAssignment, Timestamp } from "@hcengineering/core";
import core, { TStatus } from "@hcengineering/model-core";
import workbench from "@hcengineering/model-workbench";
import view from "@hcengineering/view";

export { performanceId } from '@hcengineering/performance'
export { performance as default }

// @Model(performance.class.ReviewSessionStatus, core.class.Status)
// export class TReviewSessionStatus extends TStatus implements ReviewSessionStatus {}

@Model(performance.class.KRAStatus, core.class.Status)
export class TKRAStatus extends TStatus implements KRAStatus {}

@Model(performance.class.ReviewSession, task.class.Project)
export class TReviewSession extends TProject implements ReviewSession {
  // @Prop(TypeRef(core.class.Status), performance.string.ReviewSessionStatus)
  // reviewSessionStatus!: ReviewSessionStatus;
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
  kraStatus!: KRAStatus
}

@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}


export function createModel (builder: Builder): void {
  builder.createModel(TReviewSession, TKRA)

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
        spaces: [ ],
        specials: [
          {
            id: 'review-sessions',
            component: workbench.component.SpecialView,
            componentProps: {
              _class: performance.class.ReviewSession
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
      config: ['name', 'description', 'reviewSessionStart', 'reviewSessionEnd']
    },
  )

  builder.createDoc(
    view.class.Viewlet, 
    core.space.Model, 
    {
      attachTo: performance.class.KRA,
      descriptor: view.viewlet.Table,
      config: ['title']
    },
  )
}
