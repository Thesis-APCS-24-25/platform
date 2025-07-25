import {
  ArrOf,
  Collection,
  Hidden,
  Index,
  Mixin,
  Model,
  Prop,
  TypeBoolean,
  TypeDate,
  TypeMarkup,
  TypeNumber,
  TypeRef,
  TypeString,
  UX
} from '@hcengineering/model'

import performance from './plugin'
import core, { TAttachedDoc, TClass, TDoc, TType } from '@hcengineering/model-core'
import type {
  ActionItemFactory,
  EmployeeKRA,
  KRA,
  KRAStatus,
  MeasureProgress,
  PerformanceReport,
  // PerformanceReview,
  ProgressPresenter,
  ReviewSession,
  ReviewSessionStatus,
  Unit,
  PTask,
  Progress,
  ProgressReport,
  Kpi
} from '@hcengineering/performance'
import modelTask, { TProject, TTask } from '@hcengineering/model-task'
import task, { type Task } from '@hcengineering/task'
import {
  Account,
  type Arr,
  type CollectionSize,
  DateRangeMode,
  type Domain,
  IndexKind,
  type Markup,
  Ref,
  type RelatedDocument,
  type Role,
  type RolesAssignment,
  type Timestamp,
  type Type
} from '@hcengineering/core'
import contact, { type Person, type PersonAccount } from '@hcengineering/contact'
import { type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import kraTeam, { type Member } from '@hcengineering/kra-team'
import chunter from '@hcengineering/model-chunter'

export const DOMAIN_PERFORMANCE = 'performance' as Domain

@Model(performance.class.Unit, core.class.Doc, DOMAIN_PERFORMANCE)
export class TUnit extends TDoc implements Unit {
  @Prop(TypeString(), performance.string.Symbol)
    symbol!: string

  @Prop(TypeBoolean(), performance.string.Unit)
    prefix!: boolean

  @Prop(TypeString(), performance.string.Name)
    name!: string
}

@Model(performance.class.PTask, task.class.Task)
export class TPTask extends TTask implements PTask {
  @Prop(TypeString(), performance.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeDate(DateRangeMode.DATE), performance.string.StartDate)
  @Index(IndexKind.Indexed)
    startDate!: Timestamp | null

  @Prop(TypeDate(DateRangeMode.DATE), task.string.DueDate, { editor: modelTask.component.DueDateEditor })
  @Index(IndexKind.Indexed)
  declare dueDate: Timestamp | null

  @Prop(TypeRef(performance.class.KRA), performance.string.KRA)
  @Index(IndexKind.Indexed)
    kra!: Ref<KRA> | null

  @Prop(TypeRef(performance.class.Progress), performance.string.Progress)
    progress!: Ref<Progress> | null

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), performance.string.BlockedBy)
    blockedBy!: RelatedDocument[]

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), performance.string.RelatedTo)
  @Index(IndexKind.Indexed)
    relations!: RelatedDocument[]
}

@Model(performance.class.Progress, core.class.Doc, DOMAIN_PERFORMANCE)
export class TProgress extends TDoc implements Progress {
  @Prop(TypeRef(performance.class.PTask), performance.string.Task)
    task!: Ref<PTask>

  @Prop(TypeString(), performance.string.Name)
    name!: string

  @Prop(TypeString(), performance.string.Description)
    description!: string

  @Prop(TypeNumber(), performance.string.Value)
    reports!: CollectionSize<ProgressReport>

  @Prop(TypeNumber(), performance.string.Progress)
    progress!: number | null
}

@Model(performance.class.ProgressReport, core.class.AttachedDoc, DOMAIN_PERFORMANCE)
export class TProgressReport extends TAttachedDoc implements ProgressReport {
  @Prop(TypeRef(performance.class.Progress), performance.string.Progress)
  declare attachedTo: Ref<Progress>

  @Prop(TypeDate(), performance.string.ReportDate)
    date!: Timestamp

  @Prop(TypeNumber(), performance.string.Value)
    value!: number

  @Prop(TypeRef(contact.mixin.Employee), performance.string.ReportBy)
    reportBy!: Ref<Person>

  @Prop(TypeMarkup(), performance.string.Comment)
    note!: string
}

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

@Model(performance.class.KRA, task.class.Task)
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

  @Prop(TypeRef(contact.class.PersonAccount), performance.string.Reviewer)
    reviewer!: Ref<PersonAccount> | null

  @Prop(TypeRef(performance.class.ReviewSession), performance.string.ReviewSession)
    reviewSession!: Ref<ReviewSession>

  @Prop(ArrOf(TypeRef(performance.class.PTask)), performance.string.Tasks)
    tasks?: Arr<Ref<PTask>>

  @Prop(TypeNumber(), performance.string.ScorePreview)
    scorePreview!: number | null

  @Prop(TypeNumber(), performance.string.Score)
    score!: number | null

  @Prop(TypeMarkup(), performance.string.ReviewContent)
    content!: Markup | null
}

// @Model(performance.class.PerformanceReview, core.class.Doc, DOMAIN_PERFORMANCE)
// export class TPerformanceReview extends TDoc implements PerformanceReview {
//   @Prop(TypeRef(performance.class.PerformanceReport), performance.string.PerformanceReport)
//     report!: Ref<PerformanceReport>
//
//   @Prop(TypeString(), performance.string.ReviewContent)
//     content!: string
//
//   @Prop(TypeNumber(), performance.string.ReviewScore)
//     score!: number
// }
//
@Mixin(performance.mixin.DefaultReviewSessionData, performance.class.ReviewSession)
export class TDefaultReviewSessionData extends TReviewSession implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

@Mixin(performance.mixin.DefaultKRAData, performance.class.KRA)
export class TDefaultKRAData extends TKRA { }

@Model(performance.class.Kpi, performance.class.Progress)
export class TKpi extends TProgress implements Kpi {
  @Prop(TypeRef(performance.class.Unit), performance.string.Unit)
    unit!: Ref<Unit>

  @Prop(TypeNumber(), performance.string.Target)
    target!: number
}
