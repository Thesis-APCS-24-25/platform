import kraTeam, { type Member, type Team } from '@hcengineering/kra-team'
import { get, writable } from 'svelte/store'
import { getClient } from '@hcengineering/presentation'
import core, { checkPermission, getCurrentAccount, type TypedSpace, type Ref, type Client, type Permission, type Role } from '@hcengineering/core'
import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
import { type PersonAccount } from '@hcengineering/contact'
import performance from '../plugin'
import { type ReviewSession } from '@hcengineering/performance'

export const currentMemberId = get(personIdByAccountId).get(getCurrentAccount()._id as Ref<PersonAccount>)

/**
 * Find all teams that a member belongs to.
 * @param {Ref<Member>} memberId - The ID of the member.
 * @returns {Promise<Team[]>} A promise that resolves to an array of teams.
 */
export async function findTeamsWithMember (memberId: Ref<Member>): Promise<Team[]> {
  const client = getClient()
  const id = get(personAccountByPersonId).get(memberId)?.[0]._id
  if (id === undefined) {
    return []
  }
  const teams = await client.findAll(kraTeam.class.Team, {
    members: {
      $all: [id]
    }
  })
  return teams
}

export const currentTeam = writable<Ref<Team> | undefined>(undefined)

export const checkTeamPermission = async (
  client: Client,
  reviewSession: Ref<ReviewSession> | ReviewSession,
  permission: Ref<Permission>
): Promise<boolean> => {
  const reviewSS =
    typeof reviewSession === 'string'
      ? await client.findOne(performance.class.ReviewSession, { _id: reviewSession })
      : reviewSession
  if (reviewSS === undefined) {
    return false
  }
  return await checkPermission(getClient(), permission, reviewSS.space as Ref<TypedSpace>)
}

export const checkRole = async (
  member: Ref<Member>,
  _id: Ref<Role>,
  _space: Ref<TypedSpace>,
  space?: TypedSpace
): Promise<boolean> => {
  const client = getClient()

  space = space ?? (await client.findOne(core.class.TypedSpace, { _id: _space }))
  const account = get(personAccountByPersonId).get(member)?.[0]._id
  const type = await client
    .getModel()
    .findOne(core.class.SpaceType, { _id: space?.type }, { lookup: { _id: { roles: core.class.Role } } })
  const mixin = type?.targetClass
  if (space === undefined || type === undefined || mixin === undefined) {
    return false
  }

  const asMixin = client.getHierarchy().as(space, mixin)
  return (asMixin as any)[_id]?.includes(account)
}
