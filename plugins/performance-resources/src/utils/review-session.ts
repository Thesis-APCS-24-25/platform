import performance, { KRAStatus, ReviewSessionStatus, type ReviewSession } from '@hcengineering/performance'
import { type Timestamp, type Ref, type TxOperations, type Space, type Client } from '@hcengineering/core'
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
import { type PersonAccount } from '@hcengineering/contact'
import { type Member } from '@hcengineering/kra-team'
import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
import { getMembersWithRoles } from '@hcengineering/kra-team-resources'
import kraTeam from '@hcengineering/kra-team'

export async function createReviewSession (
  client: TxOperations,
  name: string,
  description: string,
  reviewSessionStart: Timestamp,
  reviewSessionEnd: Timestamp,
  team: Ref<Space>,
  type: Ref<ProjectType>,
  identifier: string,
  allowMembersToCommentOnReport?: boolean
): Promise<Ref<ReviewSession>> {
  const reviewSessionRef = await client.createDoc(performance.class.ReviewSession, team, {
    sequence: 0,
    reviewSessionStart,
    reviewSessionEnd,
    name,
    description,
    identifier,
    status: ReviewSessionStatus.Drafting,
    private: false,
    archived: false,
    members: [],
    type,
    allowMembersToCommentOnReport
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
      await ops.update(session, { status: ReviewSessionStatus.Drafting })
    } else {
      await ops.update(session, { status: ReviewSessionStatus.InProgress, archived: false })
    }
  }

  await ops.commit()
}

export async function deactivateReviewSession (team: Ref<Space>, reviewSession: Ref<ReviewSession>): Promise<void> {
  const client = getClient()

  await client.updateDoc(performance.class.ReviewSession, team, reviewSession, {})
}

export async function endReviewSession (team: Ref<Space>, reviewSession: Ref<ReviewSession>): Promise<void> {
  const client = getClient()

  await client.updateDoc(performance.class.ReviewSession, team, reviewSession, {
    status: ReviewSessionStatus.Concluded,
    archived: true
  })
}

export const getActiveReviewSession = async (team: Ref<Space>): Promise<Ref<ReviewSession> | null> => {
  const client = getClient()

  const sessions = await client.findAll(performance.class.ReviewSession, {
    space: team,
    status: ReviewSessionStatus.InProgress
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

export async function IsActiveReviewSessionOfCurrentTeam (space: Space): Promise<boolean> {
  const ofTeam = await IsReviewSessionOfCurrentTeam(space)
  if (!ofTeam) {
    return false
  }
  const activeSession = space as ReviewSession
  if ('status' in activeSession && activeSession.status === ReviewSessionStatus.InProgress) {
    return true
  }
  return false
}

export async function IsInactiveReviewSessionOfCurrentTeam (space: Space): Promise<boolean> {
  const ofTeam = await IsReviewSessionOfCurrentTeam(space)
  if (!ofTeam) {
    return false
  }
  const activeSession = space as ReviewSession
  const client = getClient()
  return (
    client.getHierarchy().isDerived(activeSession._class, performance.class.ReviewSession) &&
    activeSession.status !== ReviewSessionStatus.InProgress
  )
}

export async function allKRAApproved (client: Client, reviewSession: ReviewSession): Promise<boolean> {
  const team = get(currentTeam)
  if (team === undefined) {
    return false
  }
  const excludedEmployees = await getMembersWithRoles(team).then(
    (members) =>
      members
        ?.filter(({ roles }) => roles.includes(kraTeam.role.TeamManager))
        .map(({ person }) => person as Ref<Member>) ?? []
  )

  const kras = await client.findAll(performance.class.EmployeeKRA, {
    space: reviewSession._id
  })
  return kras.every((kra) => Boolean(excludedEmployees.includes(kra.assignee)) || kra.status === KRAStatus.Approved)
}

export async function doKRAWeightCheck (
  client: Client,
  reviewSession: ReviewSession
): Promise<Map<Ref<Member>, boolean>> {
  const kraWeights = await client.findAll(performance.class.EmployeeKRA, {
    space: reviewSession._id
  })

  const team = get(currentTeam)
  if (team === undefined) {
    return new Map<Ref<Member>, boolean>()
  }
  const excludedEmployees = await getMembersWithRoles(team).then(
    (members) =>
      members
        ?.filter(({ roles }) => roles.includes(kraTeam.role.TeamManager))
        .map(({ person }) => person as Ref<Member>) ?? []
  )

  const members = reviewSession.members ?? []
  let mapped: Map<Ref<Member>, number> = members.reduce((acc, member) => {
    const person = get(personIdByAccountId).get(member as Ref<PersonAccount>)
    if (person === undefined) {
      return acc
    }
    acc.set(person, 0)
    return acc
  }, new Map<Ref<Member>, number>())

  mapped = kraWeights.reduce((acc, kra) => {
    acc.set(kra.assignee, (acc.get(kra.assignee) ?? 0) + kra.weight)
    return acc
  }, mapped)
  const data: Array<[Ref<Member>, number]> = []
  mapped.forEach((weight, employee) => {
    data.push([employee, weight])
  })
  return data.reduce((acc, [employee, weight]) => {
    acc.set(employee, (Boolean(excludedEmployees.includes(employee))) || Math.abs(weight - 100) === 0)
    return acc
  }, new Map<Ref<Member>, boolean>())
}

export async function startReviewSession (reviewSession: ReviewSession): Promise<void> {
  const client = getClient()

  await client.updateDoc(performance.class.ReviewSession, reviewSession.space, reviewSession._id, {
    status: ReviewSessionStatus.InProgress
  })
}
