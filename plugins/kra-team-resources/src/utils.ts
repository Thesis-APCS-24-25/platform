import {
  Account,
  Arr,
  generateId,
  reduceCalls,
  Ref,
  Role,
  RolesAssignment
} from '@hcengineering/core'
import kraTeam, { Member, Team } from '@hcengineering/kra-team'
import core from '@hcengineering/core'
import { Asset } from '@hcengineering/platform'
import { getClient } from '@hcengineering/presentation'

function createNewKra() {}

export async function createNewTeam(
  name: string,
  description: string,
  isPrivate: boolean,
  members: Arr<Ref<Member>>,
  owners: Ref<Account>[],
  rolesAssignment: RolesAssignment,
) {
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
    type: kraTeam.ids.ClassingProjectType,
  })

  const spaceType = await client
    .getModel()
    .findOne(core.class.SpaceType, { _id: kraTeam.spaceType.TeamType })
  if (!spaceType) {
    throw new Error('Default space type not found')
  }
  await client.createMixin(
    teamId,
    kraTeam.class.Team,
    core.space.Space,
    spaceType.targetClass,
    rolesAssignment
  )
}
