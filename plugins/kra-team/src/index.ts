import { Asset, type Plugin, plugin } from '@hcengineering/platform'
import { Class, Mixin, Ref, SpaceType, SpaceTypeDescriptor, TypedSpace } from '@hcengineering/core'
import { Project, ProjectType, TaskType, TaskTypeDescriptor } from '@hcengineering/task'
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
    KraTemplates: '' as Asset,
    KraTemplate: '' as Asset,
    Teams: '' as Asset,
    Metrics: '' as Asset,
    Kras: '' as Asset,
    Member: '' as Asset
  },
  mixin: {
    TeamTypeData: '' as Ref<Mixin<Team>>,
    ClassicProjectTypeData: '' as Ref<Mixin<Project>>
  },
  descriptor: {
    TeamType: '' as Ref<SpaceTypeDescriptor>,
    ReviewSessionType: '' as Ref<TaskTypeDescriptor>
  },
  taskTypes: {
    ReviewSession: '' as Ref<TaskType>
  },
  spaceType: {
    TeamType: '' as Ref<SpaceType>
  }
})
