import core, {
  type Account,
  type Arr,
  generateId,
  type Ref,
  type RolesAssignment
} from '@hcengineering/core'
import kraTeam, { type Member, type Team } from '@hcengineering/kra-team'
import { getClient } from '@hcengineering/presentation'
import { writable } from 'svelte/store'

export async function createNewTeam (
  name: string,
  description: string,
  isPrivate: boolean,
  members: Arr<Ref<Member>>,
  owners: Array<Ref<Account>>,
  rolesAssignment: RolesAssignment
): Promise<void> {
  const client = getClient()
  const teamId = generateId<Team>()

  await client.createDoc<Team>(kraTeam.class.Team, core.space.Space, {
    name,
    description,
    private: isPrivate,
    members,
    owners,
    autoJoin: false,
    archived: false,
    type: kraTeam.ids.ClassingProjectType
  })

  const spaceType = await client.getModel().findOne(core.class.SpaceType, { _id: kraTeam.spaceType.TeamType })
  if (spaceType == null) {
    throw new Error('Default space type not found')
  }
  await client.createMixin(teamId, kraTeam.class.Team, core.space.Space, spaceType.targetClass, rolesAssignment)
}

export const myTeams = writable<Team[]>([])
