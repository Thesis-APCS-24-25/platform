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
import serverKraTeam from '@hcengineering/server-kra-team'
import contract from '@hcengineering/contact'

export { serverKraTeamId } from '@hcengineering/server-kra-team'

export function createModel (builder: Builder): void {
  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKraTeam.trigger.OnTeamMemberUpdate,
    txMatch: {
      objectClass: kraTeam.class.Team,
      _class: core.class.TxUpdateDoc
    }
  })
  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKraTeam.trigger.OnTeamRolesAssignmentUpdate,
    txMatch: {
      _class: core.class.TxMixin,
      mixin: kraTeam.mixin.TeamTypeData
    }
  })
  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKraTeam.trigger.OnTeamCreate,
    txMatch: {
      _class: core.class.TxCreateDoc,
      objectClass: kraTeam.class.Team
    }
  })
  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverKraTeam.trigger.OnPersonCreate,
    txMatch: {
      _class: core.class.TxCreateDoc,
      objectClass: contract.class.Person
    }
  })
}
