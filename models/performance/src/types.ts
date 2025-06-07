import { ArrOf, Index, Mixin, Model, Prop, TypeBoolean, TypeDate, TypeNumber, TypeRef, TypeString } from '@hcengineering/model'

import performance from './plugin'
import core, { TClass, TDoc, TStatus, TType } from '@hcengineering/model-core'
import type { EmployeeKRA, KRA, KRAStatus, MeasureProgress, PerformanceReport, PerformanceReview, ProgressPresenter, ReviewSession, ReviewSessionStatus, WithKRA } from '@hcengineering/performance'
import { TProject, TTask } from '@hcengineering/model-task'
import task, { type Task } from '@hcengineering/task'
import { Account, type Arr, type Domain, IndexKind, Ref, type Role, type RolesAssignment, type Timestamp, type Type } from '@hcengineering/core'
import contact, { type PersonAccount } from '@hcengineering/contact'
import { type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'

export const DOMAIN_PERFORMANCE = 'performance' as Domain

export function TypeReviewSessionStatus (): Type<ReviewSessionStatus> {
  return { _class: performance.class.TypeReviewSessionStatus, label: performance.string.ReviewSessionStatus }
}

@Model(performance.class.TypeReviewSessionStatus, core.class.Type, DOMAIN_PERFORMANCE)
export class TTypeReviewSessionStatus extends TType {}

@Model(performance.class.KRAStatus, core.class.Status)
export class TKRAStatus extends TStatus implements KRAStatus {}

@Mixin(performance.mixin.MeasureProgress, core.class.Class)
export class TMeasureProgress extends TClass implements MeasureProgress {
  calculate!: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

@Mixin(performance.mixin.ProgressPresenter, core.class.Class)
export class TProgressPresenter extends TClass implements ProgressPresenter {
  presenter!: AnyComponent
}

@Model(performance.class.ReviewSession, task.class.Project)
export class TReviewSession extends TProject implements ReviewSession {
  @Prop(TypeDate(), performance.string.ReviewSessionStart)
    reviewSessionStart!: Timestamp

  @Prop(TypeDate(), performance.string.ReviewSessionEnd)
    reviewSessionEnd!: Timestamp

  @Prop(TypeReviewSessionStatus(), performance.string.ReviewSessionStatus)
    status?: ReviewSessionStatus
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

@Model(performance.class.PerformanceReport, core.class.Doc, DOMAIN_PERFORMANCE)
export class TPerformanceReport extends TDoc implements PerformanceReport {
  @Prop(TypeRef(contact.class.PersonAccount), performance.string.Reviewee)
    reviewee!: Ref<PersonAccount>

  @Prop(TypeRef(performance.class.ReviewSession), performance.string.ReviewSession)
    reviewSession!: Ref<ReviewSession>

  @Prop(ArrOf(TypeRef(performance.mixin.WithKRA)), performance.string.Tasks)
    tasks?: Arr<Ref<WithKRA>>

  @Prop(TypeNumber(), performance.string.ScorePreview)
    scorePreview?: number
}

@Model(performance.class.PerformanceReview, core.class.Doc, DOMAIN_PERFORMANCE)
export class TPerformanceReview extends TDoc implements PerformanceReview {
  @Prop(TypeRef(performance.class.PerformanceReport), performance.string.PerformanceReport)
    report!: Ref<PerformanceReport>

  @Prop(TypeString(), performance.string.ReviewContent)
    content!: string

  @Prop(TypeNumber(), performance.string.ReviewScore)
    score!: number
}

@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

@Mixin(performance.mixin.DefaultKRAData, performance.class.KRA)
export class TDefaultKRAData extends TKRA {}
