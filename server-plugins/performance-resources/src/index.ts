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

import { Account, PullArray, Ref, Tx, TxCreateDoc, TxUpdateDoc } from '@hcengineering/core'
import { TriggerControl } from '@hcengineering/server-core'
import performance, { PerformanceReport, ReviewSession, WithKRA } from '@hcengineering/performance'
import { Member, Team } from '@hcengineering/kra-team'
import kra from '@hcengineering/kra'
import contact from '@hcengineering/contact'

function addUpdates (control: TriggerControl, member: Ref<Account>, reviewSessions: ReviewSession[]): Tx[] {
  const result: Tx[] = []

  for (const rs of reviewSessions) {
    if (!rs.members.includes(member)) continue
    const pullTx = control.txFactory.createTxUpdateDoc(rs._class, rs.space, rs._id, {
      $pull: {
        members: member
      }
    })
    result.push(pullTx)
  }
  return result
}

/**
 * @public
 */
export async function OnTeamMemberUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const updateTx = tx as TxUpdateDoc<Team>
    const oldMembers = updateTx.operations.$pull?.members
    if (oldMembers !== undefined) {
      const reviewSessions = await control.findAll(control.ctx, performance.class.ReviewSession, {
        space: updateTx.objectId
      })
      const { $in } = oldMembers as PullArray<Ref<Member>>
      if ($in !== undefined) { // Multiple updates
        for (const mem in oldMembers) {
          result.push(...addUpdates(control, mem as Ref<Account>, reviewSessions))
        }
      } else {
        const oldMember = oldMembers as Ref<Account>
        result.push(...addUpdates(control, oldMember, reviewSessions))
      }
    }
  }

  return result
}

export async function OnCreateReport (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  console.log(txes)
  for (const tx of txes) {
    const createTx = tx as TxCreateDoc<PerformanceReport>
    const assignee = (await control.findAll(
      control.ctx,
      contact.class.PersonAccount,
      { _id: createTx.attributes.reviewee },
      { limit: 1 }
    ))[0]
    const tasks = (await control.findAll(control.ctx, kra.class.Issue,
      { assignee: assignee.person },
      { projection: { _id: 1 } }
    )) as WithKRA[]
    const taskRefs = tasks.map<Ref<WithKRA>>((task) => { return task._id })
    const pushTx = control.txFactory.createTxUpdateDoc(
      createTx.objectClass,
      createTx.objectSpace,
      createTx.objectId,
      {
        tasks: taskRefs
      }
    )
    result.push(pushTx)
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    OnTeamMemberUpdate,
    OnCreateReport
  }
})
