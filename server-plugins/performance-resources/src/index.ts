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
import performance, { PerformanceReport, ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
import kraTeam, { Team } from '@hcengineering/kra-team'
import { PersonAccount } from '@hcengineering/contact'
import { addUpdates, prepareReport } from './utils'
import { OnProgressRemove, OnProgressUpdate } from './progress'

/**
 * @public
 */
export async function OnTeamMemberUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const updateTx = tx as TxUpdateDoc<Team>
    if (updateTx.operations.$pull != null) {
      const oldMembers = updateTx.operations.$pull.members
      if (oldMembers !== undefined) {
        const reviewSessions = await control.findAll(control.ctx, performance.class.ReviewSession, {
          space: updateTx.objectId,
          status: ReviewSessionStatus.Drafting
        })
        const { $in } = oldMembers as PullArray<Ref<Account>>
        if ($in !== undefined) { // Multiple updates
          for (const mem in oldMembers) {
            result.push(...addUpdates(control, mem as Ref<Account>, reviewSessions, true))
          }
        } else {
          const oldMember = oldMembers as Ref<Account>
          result.push(...addUpdates(control, oldMember, reviewSessions, true))
        }
      }
    } else if (updateTx.operations.$push != null) {
      const newMember = updateTx.operations.$push.members
      if (newMember !== undefined) {
        const reviewSessions = await control.findAll(control.ctx, performance.class.ReviewSession, {
          space: updateTx.objectId,
          status: ReviewSessionStatus.Drafting
        })
        result.push(...addUpdates(control, newMember as Ref<Account>, reviewSessions, false))
      }
    }
  }

  return result
}

export async function OnCreateReport (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const createTx = tx as TxCreateDoc<PerformanceReport>

    result.push(await prepareReport(control, createTx))

    const allReports = await control.findAll(
      control.ctx,
      performance.class.PerformanceReport,
      {
        reviewee: createTx.attributes.reviewee,
        reviewSession: createTx.attributes.reviewSession
      }
    )
    const previousReport = allReports
      .filter((value) => value._id !== createTx.objectId)
    result.push(...previousReport.map((value) => control.txFactory.createTxRemoveDoc(
      value._class,
      value.space,
      value._id
    )))
    for (const value of previousReport) {
      const reviews = (await control.findAll(
        control.ctx,
        performance.class.PerformanceReview,
        {
          report: value._id
        }
      ))

      result.push(...reviews.map((value) => control.txFactory.createTxUpdateDoc(
        performance.class.PerformanceReview,
        value.space,
        value._id,
        { report: createTx.objectId }
      )))
    }
  }

  return result
}

export async function OnReviewSessionConclusion (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const updateTx = tx as TxUpdateDoc<ReviewSession>
    if (updateTx.operations.status !== ReviewSessionStatus.Concluded) continue

    const rs = (await control.findAll(control.ctx, performance.class.ReviewSession, {
      _id: updateTx.objectId
    }))[0]
    for (const member of rs.members) {
      const report = control.txFactory.createTxCreateDoc(
        performance.class.PerformanceReport,
        rs._id,
        {
          reviewee: member as Ref<PersonAccount>,
          reviewSession: rs._id
        }
      )
      result.push(report)
    }
  }

  return result
}

export async function OnCreateReviewSession (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const createTx = tx as TxCreateDoc<ReviewSession>

    const members = (await control.findAll(control.ctx, kraTeam.class.Team,
      { _id: createTx.objectSpace as Ref<Team> },
      { limit: 1 }
    ))[0].members
    const updateTx = control.txFactory.createTxUpdateDoc(
      createTx.objectClass,
      createTx.objectSpace,
      createTx.objectId,
      {
        members
      }
    )

    result.push(updateTx)
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    OnTeamMemberUpdate,
    OnCreateReport,
    OnReviewSessionConclusion,
    OnCreateReviewSession,
    OnProgressUpdate,
    OnProgressRemove
  }
})
