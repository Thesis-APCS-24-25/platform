import core, {
  type Account,
  type Arr,
  generateId,
  type Ref,
  type RolesAssignment,
  type SpaceType
} from '@hcengineering/core'
import kraTeam, { type Member, type Team } from '@hcengineering/kra-team'
import { type Asset } from '@hcengineering/platform'
import { getClient } from '@hcengineering/presentation'
import { writable } from 'svelte/store'

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
