import {
  ArrOf,
  Collection,
  Hidden,
  Index,
  Mixin,
  Model,
  Prop,
  TypeDate,
  TypeNumber,
  TypeRef,
  TypeString,
  UX
} from '@hcengineering/model'

import performance from './plugin'
import core, { TClass, TDoc, TType } from '@hcengineering/model-core'
import type {
  ActionItemFactory,
  EmployeeKRA,
  KRA,
  KRAStatus,
  MeasureProgress,
  PerformanceReport,
  PerformanceReview,
  ProgressPresenter,
  ReviewSession,
  ReviewSessionStatus,
  WithKRA
} from '@hcengineering/performance'
import { TProject, TTask } from '@hcengineering/model-task'
import task, { type Task } from '@hcengineering/task'
import {
  Account,
  type Arr,
  type Domain,
  IndexKind,
  Ref,
  type Role,
  type RolesAssignment,
  type Timestamp,
  type Type
} from '@hcengineering/core'
import contact, { type PersonAccount } from '@hcengineering/contact'
import { type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import kraTeam, { type Member } from '@hcengineering/kra-team'
import chunter from '@hcengineering/model-chunter'

export const DOMAIN_PERFORMANCE = 'performance' as Domain

export function TypeReviewSessionStatus (): Type<ReviewSessionStatus> {
  return { _class: performance.class.TypeReviewSessionStatus, label: performance.string.ReviewSessionStatus }
}

@Model(performance.class.TypeReviewSessionStatus, core.class.Type, DOMAIN_PERFORMANCE)
export class TTypeReviewSessionStatus extends TType { }

@Mixin(performance.mixin.MeasureProgress, core.class.Class)
export class TMeasureProgress extends TClass implements MeasureProgress {
  calculate!: Resource<(task: Ref<Task>) => Promise<number | undefined>>
}

@Mixin(performance.mixin.ProgressPresenter, core.class.Class)
export class TProgressPresenter extends TClass implements ProgressPresenter {
  presenter!: AnyComponent
}

@Mixin(performance.mixin.ActionItemFactory, core.class.Class)
export class TActionItemFactory extends TClass implements ActionItemFactory {
  component!: AnyComponent
}

@Model(performance.class.ReviewSession, task.class.Project)
export class TReviewSession extends TProject implements ReviewSession {
  @Prop(TypeDate(), performance.string.ReviewSessionStart)
    reviewSessionStart!: Timestamp

  @Prop(TypeDate(), performance.string.ReviewSessionEnd)
    reviewSessionEnd!: Timestamp

  @Prop(TypeReviewSessionStatus(), performance.string.ReviewSessionStatus)
    status?: ReviewSessionStatus

  @Prop(TypeNumber(), task.string.TaskNumber)
  @Hidden()
    sequence!: number

  @Prop(TypeString(), performance.string.Identifier)
    identifier!: string
}

@Model(performance.class.KRA, task.class.Task, DOMAIN_PERFORMANCE)
export class TKRA extends TTask implements KRA {
  @Prop(TypeString(), performance.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeString(), performance.string.Description)
  declare description: string

  @Prop(ArrOf(TypeRef(kraTeam.mixin.Member)), performance.string.AssignedTo)
    assignedTo!: Arr<Ref<Member>>
}

@Model(performance.class.EmployeeKRA, core.class.Doc, DOMAIN_PERFORMANCE)
@UX(performance.string.EmployeeKRA, performance.icon.EmployeeKRA)
export class TEmployeeKRA extends TDoc implements EmployeeKRA {
  @Prop(TypeRef(kraTeam.mixin.Member), performance.string.Assignee)
  declare assignee: Ref<Member>

  @Prop(TypeNumber(), performance.string.KRAWeight)
    weight!: number

  @Prop(TypeRef(performance.class.KRA), performance.string.AttachedKRA)
    kra!: Ref<KRA>

  @Prop(TypeKRAStatus(), performance.string.KRAStatus)
    status!: KRAStatus

  @Prop(Collection(chunter.class.ChatMessage), performance.string.Comments)
    comments!: number
}

export function TypeKRAStatus (): Type<KRAStatus> {
  return { _class: performance.class.TypeKRAStatus, label: performance.string.KRAStatus }
}

@Model(performance.class.TypeKRAStatus, core.class.Type, DOMAIN_PERFORMANCE)
@UX(performance.string.KRAStatus)
export class TTypeKRAStatus extends TType { }

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
export class TDefaultKRAData extends TKRA { }
