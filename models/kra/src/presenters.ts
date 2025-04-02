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

import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/model-core'
import view, { classPresenter } from '@hcengineering/model-view'
import notification from '@hcengineering/notification'
import kra from './plugin'

/**
 * Define presenters
 */
export function definePresenters(builder: Builder): void {
  //
  // Issue
  //
  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.IssuePresenter
  })

  builder.mixin(kra.class.Issue, core.class.Class, notification.mixin.NotificationObjectPresenter, {
    presenter: kra.component.NotificationIssuePresenter
  })

  builder.mixin(kra.class.Issue, core.class.Class, view.mixin.PreviewPresenter, {
    presenter: kra.component.IssuePreview
  })

  //
  // Issue Template
  //
  builder.mixin(kra.class.IssueTemplate, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.IssueTemplatePresenter
  })

  //
  // Issue Status
  //
  builder.mixin(kra.class.IssueStatus, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.StatusPresenter
  })

  builder.mixin(kra.class.IssueStatus, core.class.Class, view.mixin.AttributePresenter, {
    presenter: kra.component.StatusRefPresenter
  })

  //
  // Time Spend Report
  //
  builder.mixin(kra.class.TimeSpendReport, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.TimeSpendReport
  })

  //
  // Type Issue Priority
  //
  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.PriorityPresenter
  })

  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.AttributePresenter, {
    presenter: kra.component.PriorityRefPresenter
  })

  builder.mixin(kra.class.TypeIssuePriority, core.class.Class, view.mixin.AttributeEditor, {
    inlineEditor: kra.component.PriorityInlineEditor
  })

  //
  // Project
  //
  builder.mixin(kra.class.Project, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kra.component.ProjectPresenter
  })

  builder.mixin(kra.class.Project, core.class.Class, view.mixin.SpacePresenter, {
    presenter: kra.component.ProjectSpacePresenter
  })

  classPresenter(
    builder,
    kra.class.TypeReportedTime,
    kra.component.TimePresenter,
    kra.component.ReportedTimeEditor
  )

  classPresenter(
    builder,
    kra.class.TypeEstimation,
    kra.component.TimePresenter,
    kra.component.EstimationValueEditor
  )

  classPresenter(
    builder,
    kra.class.TypeRemainingTime,
    kra.component.TimePresenter,
    kra.component.EstimationValueEditor
  )

  classPresenter(builder, kra.class.Kpi, kra.component.KpiPresenter, kra.component.KpiEditor)

  classPresenter(
    builder,
    kra.class.RatingScale,
    kra.component.RatingScalePresenter,
    kra.component.RatingScaleEditor
  )
}
