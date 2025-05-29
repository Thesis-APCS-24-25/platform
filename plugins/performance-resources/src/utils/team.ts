import kraTeam, { type Member, type Team } from '@hcengineering/kra-team'
import { get, writable } from 'svelte/store'
import { getClient } from '@hcengineering/presentation'
import { getCurrentAccount, type Ref } from '@hcengineering/core'
import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
import { type PersonAccount } from '@hcengineering/contact'

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
