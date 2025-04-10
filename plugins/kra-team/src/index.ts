import { Asset, type Plugin, plugin } from '@hcengineering/platform'
import {
  Account,
  Arr,
  AttachedDoc,
  Class,
  Doc,
  MarkupBlobRef,
  Mixin,
  Ref,
  SpaceType,
  SpaceTypeDescriptor,
  TypedSpace
} from '@hcengineering/core'
import { IconProps } from '@hcengineering/view'
import { PersonAccount } from '@hcengineering/contact'
import { Project, ProjectType, ProjectTypeDescriptor, TaskType, TaskTypeDescriptor } from '@hcengineering/task'

export const kraTeamId = 'kraTeam' as Plugin

export interface Member extends PersonAccount {}

export interface Team extends Project {
  members: Arr<Ref<Member>>
}

export interface TeamTypeDescriptor extends ProjectTypeDescriptor {}

export interface TeamType extends ProjectType {}

export type Weight = number

export interface KraTemplate extends Doc, IconProps {
  name: string
  description: MarkupBlobRef | null
}

export default plugin(kraTeamId, {
  class: {
    Team: '' as Ref<Class<Team>>,
    KraTemplate: '' as Ref<Class<KraTemplate>>,
    Member: '' as Ref<Class<Member>>,
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
    ClassicProjectTypeData: '' as Ref<Mixin<Project>>,
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
  },
  ids: {
    ClassingProjectType: '' as Ref<ProjectType>
  }
})
