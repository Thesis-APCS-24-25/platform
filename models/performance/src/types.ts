import { ArrOf, Index, Mixin, Model, Prop, TypeDate, TypeNumber, TypeRef, TypeString } from '@hcengineering/model'

import performance from './plugin'
import core, { TClass, TDoc, TStatus } from '@hcengineering/model-core'
import type { EmployeeKRA, KRA, KRAStatus, MeasureProgress, ReviewSession } from '@hcengineering/performance'
import { TProject, TTask } from '@hcengineering/model-task'
import task, { type Task } from '@hcengineering/task'
import { Account, type Arr, type Domain, IndexKind, Ref, type Role, type RolesAssignment, type Timestamp } from '@hcengineering/core'
import contact, { type PersonAccount } from '@hcengineering/contact'
import { type Resource } from '@hcengineering/platform'

export const DOMAIN_PERFORMANCE = 'performance' as Domain

// @Model(performance.class.ReviewSessionStatus, core.class.Status)
// export class TReviewSessionStatus extends TStatus implements ReviewSessionStatus {}

@Model(performance.class.KRAStatus, core.class.Status)
export class TKRAStatus extends TStatus implements KRAStatus {}

@Mixin(performance.mixin.MeasureProgress, core.class.Class)
export class TMeasureProgress extends TClass implements MeasureProgress {
  calculate!: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

@Model(performance.class.ReviewSession, task.class.Project)
export class TReviewSession extends TProject implements ReviewSession {
  // @Prop(TypeRef(core.class.Status), performance.string.ReviewSessionStatus)
  //   reviewSessionStatus!: Ref<ReviewSessionStatus>

  @Prop(TypeDate(), performance.string.ReviewSessionStart)
    reviewSessionStart!: Timestamp

  @Prop(TypeDate(), performance.string.ReviewSessionEnd)
    reviewSessionEnd!: Timestamp

  kras?: Arr<Ref<KRA>>
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

@Model(performance.class.EmployeeKRA, core.class.Doc, DOMAIN_PERFORMANCE)
export class TEmployeeKRA extends TDoc implements EmployeeKRA {
  @Prop(TypeRef(performance.class.KRA), performance.string.AttachedKRA)
    kra!: Ref<KRA>

  @Prop(TypeRef(contact.class.PersonAccount), performance.string.AttachedEmployee)
    employee!: Ref<PersonAccount>

  @Prop(TypeNumber(), performance.string.KRAWeight)
    weight!: number
}

@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

@Mixin(performance.mixin.DefaultKRAData, performance.class.KRA)
export class TDefaultKRAData extends TKRA {}
