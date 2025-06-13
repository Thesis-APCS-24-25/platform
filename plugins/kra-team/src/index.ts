import { Asset, IntlString, type Plugin, plugin } from '@hcengineering/platform'
import { Class, Mixin, Permission, Ref, Role, SpaceType, SpaceTypeDescriptor, TypedSpace } from '@hcengineering/core'
import { IconProps } from '@hcengineering/view'
import { Person } from '@hcengineering/contact'

export const kraTeamId = 'kraTeam' as Plugin

export interface Member extends Person { }

export interface Team extends TypedSpace, IconProps { }

export interface TeamTypeDescriptor extends SpaceTypeDescriptor { }

export interface TeamType extends SpaceType { }

export type Weight = number

export default plugin(kraTeamId, {
  string: {
    NoMembers: '' as IntlString
  },
  class: {
    Member: '' as Ref<Class<Member>>,
    Team: '' as Ref<Class<Team>>,
    TeamType: '' as Ref<Class<TeamType>>,
    TeamTypeDescriptor: '' as Ref<Class<TeamTypeDescriptor>>
  },
  role: {
    TeamMember: '' as Ref<Role>,
    TeamManager: '' as Ref<Role>
  },
  icon: {
    Manager: '' as Asset,
    Team: '' as Asset,
    Teams: '' as Asset,
    Member: '' as Asset,
    Add: '' as Asset,
    Home: '' as Asset,
    MyTeams: '' as Asset,
    AllTeams: '' as Asset
  },
  mixin: {
    Member: '' as Ref<Mixin<Member>>,
    TeamTypeData: '' as Ref<Mixin<Team>>
  },
  descriptor: {
    TeamType: '' as Ref<SpaceTypeDescriptor>
  },
  permission: {
    ViewDashboard: '' as Ref<Permission>,
    CreateReviewSession: '' as Ref<Permission>,
    AssignWeightForAll: '' as Ref<Permission>,
    ApproveKra: '' as Ref<Permission>,
    CreateKra: '' as Ref<Permission>
  },
  spaceType: {
    TeamType: '' as Ref<SpaceType>
  }
})
