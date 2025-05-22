import kraTeam, { type Member, type Team } from '@hcengineering/kra-team'
import { team as currentTeam } from '../store'
import { get } from 'svelte/store'
import { getClient } from '@hcengineering/presentation'
import { getCurrentAccount, type Ref } from '@hcengineering/core'
import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
import { type PersonAccount } from '@hcengineering/contact'

export const currentMemberId = get(personIdByAccountId).get(
  getCurrentAccount()._id as Ref<PersonAccount>
)

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

/**
 * Get the current team from the store or query it from the server.
 * @returns {Promise<Team | undefined>} The current team or undefined if not found.
 */
export async function getOrInitCurrentTeam (): Promise<Team | undefined> {
  const client = getClient()
  let cur: Team | undefined = await client.findOne(kraTeam.class.Team, {
    _id: get(currentTeam)
  })
  // query and get the first star team
  if (cur === undefined && currentMemberId !== undefined) {
    const teams = await findTeamsWithMember(currentMemberId)
    cur = teams.at(0)
    if (cur !== undefined) {
      currentTeam.set(cur._id)
    }
  }
  return cur
}

export async function switchCurrentTeam (team: Team | Ref<Team>): Promise<void> {
  if (typeof team === 'string') {
    const client = getClient()
    const findTeam = await client.findOne(kraTeam.class.Team, {
      _id: team
    })
    if (findTeam === undefined) {
      throw new Error(`Team ${team} not found`)
    }
    team = findTeam
  }
  const cur = await getOrInitCurrentTeam()
  if (cur !== undefined && team._id === cur._id) {
    return
  }
  currentTeam.set(team._id)
}
