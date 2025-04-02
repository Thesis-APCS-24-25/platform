import {
  ArrOf,
  Mixin,
  Model,
  Prop,
  TypeCollaborativeDoc,
  TypeRef,
  TypeString,
  UX
} from '@hcengineering/model'
import {
  KraTemplate,
  Team,
  Member,
  TeamType,
  TeamTypeDescriptor
} from '@hcengineering/kra-team'
import {
  TAccount,
  TAttachedDoc,
  TDoc,
  TSpaceType,
  TSpaceTypeDescriptor,
  TTypedSpace
} from '@hcengineering/model-core'

import kraTeam from './plugin'
import core, { Arr, Class, MarkupBlobRef, Ref, Role, RolesAssignment } from '@hcengineering/core'
import { getEmbeddedLabel } from '@hcengineering/platform'
import contact from '@hcengineering/contact'
import { TPersonAccount } from '@hcengineering/model-contact'

@Model(kraTeam.class.Team, core.class.TypedSpace)
@UX(kraTeam.string.Team, kraTeam.icon.Team, 'Team', 'name')
export class TTeam extends TTypedSpace implements Team {
  declare members: Arr<Ref<Member>>
}

@Model(kraTeam.class.KraTemplate, core.class.Doc)
export class TKraTemplate extends TDoc implements KraTemplate {
  @Prop(TypeString(), kraTeam.string.Name)
  name!: string

  @Prop(TypeCollaborativeDoc(), kraTeam.string.Description)
  description!: MarkupBlobRef | null
}

@Mixin(kraTeam.mixin.TeamTypeData, kraTeam.class.Team)
@UX(getEmbeddedLabel('Default Team'), kraTeam.icon.Kras)
export class TTeamTypeData extends TTeam implements RolesAssignment {
  [key: Ref<Role>]: Ref<Member>[]
}

@Model(kraTeam.class.TeamType, core.class.SpaceType)
export class TTeamType extends TSpaceType implements TeamType {}

@Model(kraTeam.class.Member, contact.class.PersonAccount)
export class TMember extends TPersonAccount implements Member {}

@Model(kraTeam.class.TeamTypeDescriptor, core.class.SpaceTypeDescriptor)
export class TTeamTypeDescriptor extends TSpaceTypeDescriptor implements TeamTypeDescriptor {}
