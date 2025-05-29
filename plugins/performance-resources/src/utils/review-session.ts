import performance, { type ReviewSession } from '@hcengineering/performance'
import { getCurrentAccount, type Timestamp, type Ref, type TxOperations, type Space } from '@hcengineering/core'
import type { ProjectType } from '@hcengineering/task'
import {
  EastSideColor,
  FeijoaColor,
  FernColor,
  FlamingoColor,
  MalibuColor,
  MediumTurquoiseColor,
  MoodyBlueColor,
  SalmonColor,
  SeaBuckthornColor,
  SeagullColor
} from '@hcengineering/ui'
import { getClient } from '@hcengineering/presentation'
import { currentTeam } from './team'
import { get } from 'svelte/store'

export async function createReviewSession (
  client: TxOperations,
  name: string,
  description: string,
  reviewSessionStart: Timestamp,
  reviewSessionEnd: Timestamp,
  team: Ref<Space>,
  type: Ref<ProjectType>,
  active: boolean = false
): Promise<Ref<ReviewSession>> {
  const reviewSessionRef = await client.createDoc(performance.class.ReviewSession, team, {
    active,
    reviewSessionStart,
    reviewSessionEnd,
    name,
    description,
    private: false,
    archived: false,
    members: [getCurrentAccount()._id],
    type
  })

  return reviewSessionRef
}

export function getReviewSessionAvailableColors (): string[] {
  return [
    FernColor,
    SeaBuckthornColor,
    FlamingoColor,
    MalibuColor,
    MoodyBlueColor,
    FeijoaColor,
    EastSideColor,
    MediumTurquoiseColor,
    SalmonColor,
    SeagullColor
  ]
}

export async function activateReviewSession (team: Ref<Space>, reviewSession: Ref<ReviewSession>): Promise<void> {
  const client = getClient()

  const sessions = await client.findAll(performance.class.ReviewSession, {
    space: team
  })

  const ops = client.apply()
  for (const session of sessions) {
    if (session._id !== reviewSession) {
      await ops.update(session, { active: false })
    } else {
      await ops.update(session, { active: true })
    }
  }

  await ops.commit()
}

export async function deactivateReviewSession (team: Ref<Space>, reviewSession: Ref<ReviewSession>): Promise<void> {
  const client = getClient()

  await client.updateDoc(performance.class.ReviewSession, team, reviewSession, {
    active: false
  })
}

export async function endReviewSession (team: Ref<Space>, reviewSession: Ref<ReviewSession>): Promise<void> {
  const client = getClient()

  await client.updateDoc(performance.class.ReviewSession, team, reviewSession, {
    active: false,
    archived: true
  })
}

export const getActiveReviewSession = async (team: Ref<Space>): Promise<Ref<ReviewSession> | null> => {
  const client = getClient()

  const sessions = await client.findAll(performance.class.ReviewSession, {
    space: team,
    active: true
  })

  if (sessions.length > 0) {
    return sessions[0]._id
  }

  return null
}

export async function IsReviewSessionOfCurrentTeam (space: Space): Promise<boolean> {
  const team = get(currentTeam)
  if (space.space !== team) {
    return false
  }
  return true
}
