import { ArrOf, Index, Mixin, Model, Prop, TypeDate, TypeRef, TypeString } from "@hcengineering/model";

import performance from "./plugin";
import core, { TStatus } from "@hcengineering/model-core";
import { KRA, KRAStatus, ReviewSession, ReviewSessionStatus } from "@hcengineering/performance";
import { TProject, TTask } from "@hcengineering/model-task";
import task from "@hcengineering/task";
import { Account, Arr, IndexKind, Ref, Role, RolesAssignment, Timestamp } from "@hcengineering/core";

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
  @Index(IndexKind.FullText)
  title!: string
  @Prop(TypeString(), performance.string.Description)
    declare description: string
  @Prop(TypeRef(core.class.Status), performance.string.KRAStatus)
  kraStatus!: Ref<KRAStatus>
}

@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

@Mixin(performance.mixin.DefaultKRAData, performance.class.KRA)
export class TDefaultKRAData extends TKRA {}