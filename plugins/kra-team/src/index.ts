import { Asset, type Plugin, plugin } from '@hcengineering/platform'
import { Class, Mixin, Ref, SpaceType, SpaceTypeDescriptor, TypedSpace } from '@hcengineering/core'
import { IconProps } from '@hcengineering/view'
import { PersonAccount } from '@hcengineering/contact'

export const kraTeamId = 'kraTeam' as Plugin

export interface Member extends PersonAccount { }

export interface Team extends TypedSpace, IconProps {
  members: Ref<Member>[]
}

export interface TeamTypeDescriptor extends SpaceTypeDescriptor { }

export interface TeamType extends SpaceType { }

export type Weight = number

export default plugin(kraTeamId, {
  class: {
    Member: '' as Ref<Class<Member>>,
    Team: '' as Ref<Class<Team>>,
    TeamType: '' as Ref<Class<TeamType>>,
    TeamTypeDescriptor: '' as Ref<Class<TeamTypeDescriptor>>
  },
  icon: {
    Team: '' as Asset,
    Teams: '' as Asset,
    Member: '' as Asset,
    Add: '' as Asset,
    Home: '' as Asset,
    MyTeams: '' as Asset,
    AllTeams: '' as Asset
  },
  mixin: {
    TeamTypeData: '' as Ref<Mixin<Team>>
  },
  descriptor: {
    TeamType: '' as Ref<SpaceTypeDescriptor>
  },
  spaceType: {
    TeamType: '' as Ref<SpaceType>
  }
})
