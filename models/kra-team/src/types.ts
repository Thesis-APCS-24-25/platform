import { Mixin, Model, UX } from '@hcengineering/model'
import { type Member, type Team, type TeamType, type TeamTypeDescriptor } from '@hcengineering/kra-team'
import { TSpaceType, TSpaceTypeDescriptor, TTypedSpace } from '@hcengineering/model-core'

import kraTeam from './plugin'
import core, { Ref, type Role, type RolesAssignment } from '@hcengineering/core'
import { getEmbeddedLabel } from '@hcengineering/platform'
import contact from '@hcengineering/contact'
import { TPerson, TPersonAccount } from '@hcengineering/model-contact'

@Model(kraTeam.class.Team, core.class.TypedSpace)
@UX(kraTeam.string.Team, kraTeam.icon.Team, 'Team', 'name')
export class TTeam extends TTypedSpace implements Team {
}

@Mixin(kraTeam.mixin.TeamTypeData, kraTeam.class.Team)
@UX(getEmbeddedLabel('Default Team'), kraTeam.icon.Teams)
export class TTeamTypeData extends TTeam implements RolesAssignment {
  [key: Ref<Role>]: Ref<TPersonAccount>[]
}

@Model(kraTeam.class.TeamType, core.class.SpaceType)
export class TTeamType extends TSpaceType implements TeamType { }

@Mixin(kraTeam.mixin.Member, contact.class.Person)
export class TMember extends TPerson implements Member { }

@Model(kraTeam.class.TeamTypeDescriptor, core.class.SpaceTypeDescriptor)
export class TTeamTypeDescriptor extends TSpaceTypeDescriptor implements TeamTypeDescriptor { }
