import core, { type Doc } from '@hcengineering/core'
import { getClient } from '@hcengineering/presentation'
import kraTeam from '@hcengineering/kra-team'
import { checkTeamPermission } from './utils/team'
import { type ReviewSession } from '@hcengineering/performance'

export async function canApproveKRA (doc?: Doc | Doc[]): Promise<boolean> {
  if (doc === undefined) {
    return false
  }

  const client = getClient()
  const targets = Array.isArray(doc) ? doc : [doc]
  const targetSpace = await client.findOne(
    core.class.Space,
    { _id: { $in: targets.map((t) => t.space) } }
  )
  if (targetSpace === undefined) return false
  const res = await checkTeamPermission(client, targetSpace as ReviewSession, kraTeam.permission.ApproveKra)
  return res
}
