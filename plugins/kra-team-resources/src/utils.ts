import { type Person, type PersonAccount } from '@hcengineering/contact'
import core, {
  type Account,
  type Arr,
  generateId,
  type Ref,
  type Role,
  type RolesAssignment,
  type SpaceType
} from '@hcengineering/core'
import kraTeam, { type TeamType, type Team } from '@hcengineering/kra-team'
import { type Asset } from '@hcengineering/platform'
import { personAccountByPersonId, personByIdStore, personIdByAccountId } from '@hcengineering/contact-resources'
import { getClient } from '@hcengineering/presentation'
import { get, writable } from 'svelte/store'

export async function createNewTeam (
  name: string,
  description: string,
  isPrivate: boolean,
  spaceType: SpaceType,
  members: Arr<Ref<PersonAccount>>,
  owners: Array<Ref<Account>>,
  rolesAssignment: RolesAssignment,
  icon?: Asset,
  color?: number
): Promise<void> {
  const client = getClient()
  const teamId = generateId<Team>()

  await client.createDoc<Team>(
    kraTeam.class.Team,
    core.space.Space,
    {
      name,
      description,
      private: isPrivate,
      members: [], // will be added later
      owners,
      autoJoin: false,
      archived: false,
      type: kraTeam.spaceType.TeamType,
      icon,
      color
    },
    teamId
  )

  const persons = members
    .map((member) => {
      return get(personIdByAccountId).get(member)
    })
    .filter((person) => person !== undefined)

  for (const person of persons) {
    await addPersonToTeam(person, teamId)
  }

  await client.createMixin(teamId, kraTeam.class.Team, core.space.Space, spaceType.targetClass, rolesAssignment)
}

export const myTeams = writable<Team[]>([])

export async function addPersonToTeam (person: Ref<Person>, teamId: Ref<Team>): Promise<void> {
  const client = getClient()
  const member = get(personByIdStore).get(person)
  if (member === undefined) {
    return
  }
  const account = get(personAccountByPersonId).get(member._id)?.[0]
  if (account === undefined) {
    throw new Error('Account not found')
  }
  const team = await client.findOne(kraTeam.class.Team, {
    _id: teamId
  })
  if (team === undefined || team.members.includes(account._id)) {
    return
  }
  await client.updateDoc(kraTeam.class.Team, core.space.Space, team._id, {
    $push: {
      members: account._id
    }
  })
  const hierarchy = client.getHierarchy()
  if (!hierarchy.hasMixin(member, kraTeam.mixin.Member)) {
    await client.createMixin(member._id, member._class, member.space, kraTeam.mixin.Member, {})
  }
}

export async function removePersonsFromTeam (persons: Ref<Person> | Array<Ref<Person>>, team: Ref<Team>): Promise<void> {
  const client = getClient()
  if (!Array.isArray(persons)) {
    persons = [persons]
  }
  const accounts = persons
    .map((person) => get(personAccountByPersonId).get(person)?.[0])
    .filter((account) => account !== undefined)
  for (const account of accounts) {
    await client.updateDoc(kraTeam.class.Team, core.space.Space, team, {
      $pull: {
        members: account._id
      }
    })
  }
}

export async function getMembersWithRoles (
  team: Ref<Team> | Team
): Promise<Array<{ person: Ref<Person>, roles: Array<Ref<Role>> }> | undefined> {
  const client = getClient()
  if (typeof team === 'string') {
    const temp = await client.findOne(kraTeam.class.Team, {
      _id: team
    })
    if (temp === undefined) {
      return undefined
    }
    team = temp
  }
  const members = team.members
  const rolesAssignment = await getRolesAssignment(team)
  return members
    .map((accountRef) => {
      const roles = Object.entries(rolesAssignment).reduce((acc, [roleId, persons]) => {
        if (persons !== undefined && persons.includes(accountRef)) {
          acc.push(roleId as Ref<Role>)
        }
        return acc
      }, new Array<Ref<Role>>())
      const person = get(personIdByAccountId).get(accountRef as Ref<PersonAccount>)
      if (person !== undefined) {
        return {
          person,
          roles
        }
      }
      return undefined
    })
    .filter((member) => member !== undefined)
}

/**
 * Get the roles assignment for a team, if `typeType` is not provided, the default team type will be used.
 */
export async function getRolesAssignment (team: Team, typeType?: TeamType): Promise<RolesAssignment> {
  const client = getClient()
  const hierarchy = client.getHierarchy()
  if (typeType === undefined) {
    typeType = await client.findOne(core.class.SpaceType, {
      _id: kraTeam.spaceType.TeamType
    })
    if (typeType === undefined) {
      throw Error('Default space type should always be present')
    }
  }

  const asMixin = hierarchy.as(team, typeType.targetClass)

  const roles = await client.findAll(core.class.Role, { attachedTo: typeType._id })
  return roles.reduce<RolesAssignment>((prev, { _id }) => {
    prev[_id] = (asMixin as any)[_id] ?? []

    return prev
  }, {})
}
