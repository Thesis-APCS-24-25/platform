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

import core from '@hcengineering/core/src/component'
import { type Builder } from '@hcengineering/model'
import kraTeam from '@hcengineering/kra-team'
import serverCore from '@hcengineering/server-core'
import serverPerformance from '@hcengineering/server-performance'
import performance, { ReviewSessionStatus } from '@hcengineering/performance'

export { serverPerformanceId } from '@hcengineering/server-performance'

export function createModel (builder: Builder): void {
  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnTeamMemberUpdate,
    txMatch: {
      objectClass: kraTeam.class.Team,
      _class: core.class.TxUpdateDoc
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnCreateReport,
    txMatch: {
      objectClass: performance.class.PerformanceReport,
      _class: core.class.TxCreateDoc
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnReviewSessionConclusion,
    txMatch: {
      objectClass: performance.class.ReviewSession,
      _class: core.class.TxUpdateDoc,
      'operations.status': ReviewSessionStatus.Concluded
    },
    isAsync: true
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnCreateReviewSession,
    txMatch: {
      _class: core.class.TxCreateDoc,
      objectClass: performance.class.ReviewSession
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnProgressUpdate,
    txMatch: {
      objectClass: { $in: [performance.class.Progress, performance.class.ProgressReport] }
    }
  })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverPerformance.trigger.OnProgressRemove,
    txMatch: {
      _class: core.class.TxRemoveDoc,
      objectClass: performance.class.Progress
    }
  })
}
