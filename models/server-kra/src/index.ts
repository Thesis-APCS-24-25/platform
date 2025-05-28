//
// Copyright © 2022 Hardcore Engineering Inc.
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

import contact from '@hcengineering/contact'
import core from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import kra from '@hcengineering/model-kra'
import notification from '@hcengineering/notification'
import serverCore from '@hcengineering/server-core'
import serverNotification from '@hcengineering/server-notification'
import serverKra from '@hcengineering/server-kra'
import serverView from '@hcengineering/server-view'

export { serverKraId } from '@hcengineering/server-kra'

export function createModel (builder: Builder): void {
  builder.mixin(kra.class.Issue, core.class.Class, serverNotification.mixin.HTMLPresenter, {
    presenter: serverKra.function.IssueHTMLPresenter
  })

  builder.mixin(kra.class.Issue, core.class.Class, serverNotification.mixin.TextPresenter, {
    presenter: serverKra.function.IssueTextPresenter
  })

  builder.mixin(kra.class.Issue, core.class.Class, serverNotification.mixin.NotificationPresenter, {
    presenter: serverKra.function.IssueNotificationContentProvider
  })

  builder.mixin(kra.class.Issue, core.class.Class, serverView.mixin.ServerLinkIdProvider, {
    encode: serverKra.function.IssueLinkIdProvider
  })

  builder.mixin(kra.class.Issue, core.class.Class, serverCore.mixin.SearchPresenter, {
    iconConfig: {
      component: kra.component.IssueSearchIcon,
      fields: [['status'], ['space']]
    },
    shortTitle: [['identifier']],
    title: [['title']]
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKra.trigger.OnIssueUpdate,
    txMatch: {
      objectClass: { $in: [kra.class.Issue, kra.class.TimeSpendReport] }
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKra.trigger.OnGoalUpdate,
    txMatch: {
      objectClass: { $in: [kra.class.Goal, kra.class.Report] }
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKra.trigger.OnProjectRemove,
    txMatch: {
      _class: core.class.TxRemoveDoc,
      objectClass: kra.class.Project
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKra.trigger.OnWorkspaceOwnerAdded,
    txMatch: {
      objectClass: contact.class.PersonAccount
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKra.trigger.OnGoalRemove,
    txMatch: {
      _class: core.class.TxRemoveDoc,
      objectClass: kra.class.Goal
    }
  })

  builder.mixin(
    kra.ids.AssigneeNotification,
    notification.class.NotificationType,
    serverNotification.mixin.TypeMatch,
    {
      func: serverNotification.function.IsUserEmployeeInFieldValueTypeMatch
    }
  )
}
