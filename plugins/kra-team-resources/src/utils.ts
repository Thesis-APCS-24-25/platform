import core, {
  type Account,
  type Arr,
  generateId,
  type Ref,
  type RolesAssignment,
  type SpaceType,
  type Role
} from '@hcengineering/core'
import kraTeam, { type TeamType, type Member, type Team } from '@hcengineering/kra-team'
import { type Asset } from '@hcengineering/platform'
import { getClient } from '@hcengineering/presentation'
import { writable } from 'svelte/store'
import { deepEqual } from 'fast-equals'

export async function createNewTeam (
  name: string,
  description: string,
  isPrivate: boolean,
  spaceType: SpaceType,
  members: Arr<Ref<Account>>,
  owners: Array<Ref<Account>>,
  rolesAssignment: RolesAssignment,
  icon?: Asset,
  color?: number
): Promise<void> {
  const client = getClient()
  const teamId = generateId<Team>()

  await client.createDoc<Team>(kraTeam.class.Team, core.space.Space, {
    name,
    description,
    private: isPrivate,
    members: members.map((member) => member as Ref<Member>),
    owners,
    autoJoin: false,
    archived: false,
    type: kraTeam.spaceType.TeamType,
    icon,
    color
  }, teamId)

  await client.createMixin(teamId, kraTeam.class.Team, core.space.Space, spaceType.targetClass, rolesAssignment)
}

export const myTeams = writable<Team[]>([])

export const currentTeam = writable<Ref<Team> | null>(null)

function getRolesAssignment (team?: Team, typeType?: TeamType, roles?: Role[]): RolesAssignment {
  if (team === undefined || typeType?.targetClass === undefined || roles === undefined) {
    return {}
  }

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const asMixin = hierarchy.as(team, typeType?.targetClass)

  return roles.reduce<RolesAssignment>((prev, { _id }) => {
    prev[_id] = (asMixin as any)[_id] ?? []

    return prev
  }, {})
}

/**
 * Assigns a role to a member in a team.
 * Role is null meaning that the member is removed from all roles.
 */
export async function assignRoleToMember (
  teamId: Ref<Team>,
  teamType: TeamType,
  roles: Role[],
  memberId: Ref<Member>,
  role?: Ref<Role>
): Promise<void> {
  const client = getClient()
  const team = await client.findOne(kraTeam.class.Team, {
    _id: teamId
  })
  if (team === undefined) {
    return
  }
  const currentAssignment = getRolesAssignment(team, teamType, roles)
  const newAssignment = Object.entries(currentAssignment).reduce<RolesAssignment>((acc, [key, members]) => {
    const updatedMembers = members?.filter((id) => id !== memberId) ?? []
    if (role !== null && key === role) {
      updatedMembers.push(memberId)
    }
    return { ...acc, [key]: updatedMembers }
  }, {})

  if (!deepEqual(newAssignment, currentAssignment)) {
    await client.updateMixin(team._id, kraTeam.class.Team, core.space.Space, teamType.targetClass, newAssignment)
  }
}
