//
// Copyright © 2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import chunter from '@hcengineering/chunter'
import contact, { type Employee, type Person } from '@hcengineering/contact'
import {
  DOMAIN_MODEL,
  DateRangeMode,
  IndexKind,
  type MarkupBlobRef,
  type Domain,
  type Markup,
  type Ref,
  type RelatedDocument,
  type Timestamp,
  type Type,
  type RolesAssignment,
  type Role,
  type CollectionSize,
  Account
} from '@hcengineering/core'
import {
  ArrOf,
  Collection,
  Hidden,
  Index,
  Mixin,
  Model,
  Prop,
  ReadOnly,
  TypeCollaborativeDoc,
  TypeDate,
  TypeMarkup,
  TypeNumber,
  TypeRecord,
  TypeRef,
  TypeString,
  UX
} from '@hcengineering/model'
import attachment from '@hcengineering/model-attachment'
import core, { TAttachedDoc, TDoc, TStatus, TType } from '@hcengineering/model-core'
import task, { TTask, TProject as TTaskProject } from '@hcengineering/model-task'
import { getEmbeddedLabel, type IntlString } from '@hcengineering/platform'
import tags, { type TagElement } from '@hcengineering/tags'
import time, { type ToDo } from '@hcengineering/time'
import {
  type ProjectTargetPreference,
  type Issue,
  type IssueChildInfo,
  type IssueParentInfo,
  type IssuePriority,
  type IssueStatus,
  type IssueTemplate,
  type IssueTemplateChild,
  type Project,
  type RelatedClassRule,
  type RelatedIssueTarget,
  type RelatedSpaceRule,
  type TimeReportDayType,
  type TimeSpendReport,
  type Goal,
  type Kpi,
  type RatingScale,
  type KpiReport
} from '@hcengineering/kra'
import kra from './plugin'
import { type TaskType } from '@hcengineering/task'

import preference, { TPreference } from '@hcengineering/model-preference'

export const DOMAIN_KRA = 'kra' as Domain

@Model(kra.class.Goal, core.class.AttachedDoc, DOMAIN_KRA)
export class TGoal extends TAttachedDoc implements Goal {
  @Prop(TypeString(), kra.string.Name)
    name!: string

  @Prop(TypeString(), kra.string.Description)
    description!: string
}

@Model(kra.class.Kpi, kra.class.Goal)
export class TKpi extends TGoal implements Kpi {
  @Prop(TypeString(), kra.string.Target)
    target!: number

  @Prop(TypeString(), kra.string.Unit)
    unit!: string

  @Prop(TypeString(), kra.string.Value)
    reports!: number
}

@Model(kra.class.KpiReport, core.class.AttachedDoc, DOMAIN_KRA)
export class TKpiReport extends TAttachedDoc implements KpiReport {
  @Prop(TypeRef(kra.class.Kpi), kra.string.Kpi)
  declare attachedTo: Ref<Kpi>

  @Prop(TypeDate(), kra.string.Date)
    date!: Timestamp

  @Prop(TypeString(), kra.string.Value)
    value!: number

  @Prop(TypeRef(contact.mixin.Employee), contact.string.Employee)
    employee!: Ref<Employee>
}

@Model(kra.class.RatingScale, kra.class.Goal)
export class TRatingScale extends TGoal implements RatingScale {
  @Prop(TypeNumber(), kra.string.Name)
    value!: number | null

  @Prop(TypeString(), kra.string.Comment)
    comment!: string
}

@Model(kra.class.IssueStatus, core.class.Status)
@UX(kra.string.IssueStatus, undefined, undefined, 'rank', 'name')
export class TIssueStatus extends TStatus implements IssueStatus { }
/**
 * @public
 */

export function TypeIssuePriority (): Type<IssuePriority> {
  return { _class: kra.class.TypeIssuePriority, label: kra.string.TypeIssuePriority }
}
/**
 * @public
 */

@Model(kra.class.TypeIssuePriority, core.class.Type, DOMAIN_MODEL)
export class TTypeIssuePriority extends TType { }
/**
 * @public
 */

@Model(kra.class.Project, task.class.Project)
@UX(kra.string.Project, kra.icon.Issues, 'Project', 'name')
export class TProject extends TTaskProject implements Project {
  @Prop(TypeString(), kra.string.ProjectIdentifier)
  @Index(IndexKind.FullText)
    identifier!: IntlString

  @Prop(TypeNumber(), kra.string.Number)
  @Hidden()
    sequence!: number

  @Prop(TypeRef(kra.class.IssueStatus), kra.string.DefaultIssueStatus)
    defaultIssueStatus!: Ref<IssueStatus>

  @Prop(TypeRef(contact.mixin.Employee), kra.string.DefaultAssignee)
    defaultAssignee!: Ref<Employee>

  declare defaultTimeReportDay: TimeReportDayType

  @Prop(Collection(kra.class.RelatedIssueTarget), kra.string.RelatedIssues)
    relatedIssueTargets!: number
}
/**
 * @public
 */

@Model(kra.class.RelatedIssueTarget, core.class.Doc, DOMAIN_KRA)
@UX(kra.string.RelatedIssues)
export class TRelatedIssueTarget extends TDoc implements RelatedIssueTarget {
  @Prop(TypeRef(kra.class.Project), kra.string.Project)
    target!: Ref<Project>

  rule!: RelatedClassRule | RelatedSpaceRule
}

/**
 * @public
 */
export function TypeReportedTime (): Type<number> {
  return { _class: kra.class.TypeReportedTime, label: kra.string.ReportedTime }
}

/**
 * @public
 */
export function TypeRemainingTime (): Type<number> {
  return { _class: kra.class.TypeRemainingTime, label: kra.string.RemainingTime }
}

/**
 * @public
 */
export function TypeEstimation (): Type<number> {
  return { _class: kra.class.TypeEstimation, label: kra.string.Estimation }
}

/**
 * @public
 */
@Model(kra.class.Issue, task.class.Task)
@UX(kra.string.Issue, kra.icon.Issue, 'TSK', 'title', undefined, kra.string.Issues)
export class TIssue extends TTask implements Issue {
  @Prop(TypeRef(kra.class.Issue), kra.string.Parent)
  declare attachedTo: Ref<Issue>

  @Prop(TypeString(), kra.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeCollaborativeDoc(), kra.string.Description)
  @Index(IndexKind.FullText)
    description!: MarkupBlobRef | null

  @Prop(TypeRef(kra.class.IssueStatus), kra.string.Status, {
    _id: kra.attribute.IssueStatus,
    iconComponent: kra.activity.StatusIcon
  })
  @Index(IndexKind.Indexed)
  declare status: Ref<IssueStatus>

  @Prop(TypeIssuePriority(), kra.string.Priority, {
    iconComponent: kra.activity.PriorityIcon
  })
  @Index(IndexKind.Indexed)
    priority!: IssuePriority

  @Prop(TypeNumber(), kra.string.Number)
  @Index(IndexKind.FullText)
  @ReadOnly()
  declare number: number

  @Prop(TypeRef(contact.class.Person), kra.string.Assignee)
  @Index(IndexKind.Indexed)
  declare assignee: Ref<Person> | null

  @Prop(Collection(kra.class.Issue), kra.string.SubIssues)
    subIssues!: number

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), kra.string.BlockedBy)
    blockedBy!: RelatedDocument[]

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), kra.string.RelatedTo)
  @Index(IndexKind.Indexed)
    relations!: RelatedDocument[]

  parents!: IssueParentInfo[]

  @Prop(Collection(tags.class.TagReference), kra.string.Labels)
  declare labels: number

  @Prop(TypeRef(kra.class.Project), kra.string.Project, { icon: kra.icon.Issues })
  @Index(IndexKind.Indexed)
  @ReadOnly()
  declare space: Ref<Project>

  @Prop(TypeDate(DateRangeMode.DATETIME), kra.string.DueDate)
  declare dueDate: Timestamp | null

  @Prop(TypeEstimation(), kra.string.Estimation)
    estimation!: number

  @Prop(TypeReportedTime(), kra.string.ReportedTime)
    reportedTime!: number

  @Prop(TypeRemainingTime(), kra.string.RemainingTime)
  @ReadOnly()
    remainingTime!: number

  @Prop(Collection(kra.class.TimeSpendReport), kra.string.TimeSpendReports)
    reports!: number

  declare childInfo: IssueChildInfo[]

  @Prop(Collection(time.class.ToDo), getEmbeddedLabel('Action Items'))
    todos?: CollectionSize<ToDo>
}
/**
 * @public
 */

@Model(kra.class.IssueTemplate, core.class.Doc, DOMAIN_KRA)
@UX(
  kra.string.IssueTemplate,
  kra.icon.IssueTemplates,
  'PROCESS',
  undefined,
  undefined,
  kra.string.IssueTemplates
)
export class TIssueTemplate extends TDoc implements IssueTemplate {
  @Prop(TypeString(), kra.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeMarkup(), kra.string.Description)
  @Index(IndexKind.FullText)
    description!: Markup

  @Prop(TypeIssuePriority(), kra.string.Priority)
    priority!: IssuePriority

  @Prop(TypeRef(contact.class.Person), kra.string.Assignee)
    assignee!: Ref<Person> | null

  @Prop(ArrOf(TypeRef(tags.class.TagElement)), kra.string.Labels)
    labels?: Ref<TagElement>[]

  @Prop(TypeRef(task.class.TaskType), task.string.TaskType)
    kind?: Ref<TaskType>

  declare space: Ref<Project>

  @Prop(TypeDate(DateRangeMode.DATETIME), kra.string.DueDate)
    dueDate!: Timestamp | null

  @Prop(TypeEstimation(), kra.string.Estimation)
    estimation!: number

  @Prop(ArrOf(TypeRef(kra.class.IssueTemplate)), kra.string.IssueTemplate)
    children!: IssueTemplateChild[]

  @Prop(Collection(chunter.class.ChatMessage), kra.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), kra.string.Attachments)
    attachments!: number

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), kra.string.RelatedTo)
    relations!: RelatedDocument[]
}
/**
 * @public
 */

@Model(kra.class.TimeSpendReport, core.class.AttachedDoc, DOMAIN_KRA)
@UX(kra.string.TimeSpendReport, kra.icon.TimeReport)
export class TTimeSpendReport extends TAttachedDoc implements TimeSpendReport {
  @Prop(TypeRef(kra.class.Issue), kra.string.Issue)
  declare attachedTo: Ref<Issue>

  @Prop(TypeRef(contact.mixin.Employee), contact.string.Employee)
    employee!: Ref<Employee>

  @Prop(TypeDate(), kra.string.TimeSpendReportDate)
    date!: Timestamp | null

  @Prop(TypeNumber(), kra.string.TimeSpendReportValue)
    value!: number

  @Prop(TypeString(), kra.string.TimeSpendReportDescription)
    description!: string
}

@UX(core.string.Number)
@Model(kra.class.TypeReportedTime, core.class.Type)
export class TTypeReportedTime extends TType { }

@UX(core.string.Number)
@Model(kra.class.TypeEstimation, core.class.Type)
export class TTypeEstimation extends TType { }

@UX(core.string.Number)
@Model(kra.class.TypeRemainingTime, core.class.Type)
export class TTypeRemainingTime extends TType { }

@Model(kra.class.ProjectTargetPreference, preference.class.Preference)
export class TProjectTargetPreference extends TPreference implements ProjectTargetPreference {
  @Prop(TypeRef(core.class.Space), core.string.Space)
  declare attachedTo: Ref<Project>

  @Prop(TypeDate(), kra.string.LastUpdated)
    usedOn!: Timestamp

  @Prop(TypeRecord(), getEmbeddedLabel('Properties'))
    props?: { key: string, value: any }[]
}

@Mixin(kra.mixin.ClassicProjectTypeData, kra.class.Project)
@UX(getEmbeddedLabel('Classic project'), kra.icon.Issues)
export class TClassicProjectTypeData extends TProject implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

@Mixin(kra.mixin.IssueTypeData, kra.class.Issue)
@UX(getEmbeddedLabel('Issue'), kra.icon.Issue)
export class TIssueTypeData extends TIssue { }
