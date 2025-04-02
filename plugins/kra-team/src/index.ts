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

export const kraTeamId = 'kraTeamId' as Plugin

export interface Member extends PersonAccount {}

export interface Team extends TypedSpace, IconProps {
  members: Arr<Ref<Member>>
}

export interface TeamTypeDescriptor extends SpaceTypeDescriptor {}

export interface TeamType extends SpaceType {}

export type Weight = number

export interface KraTeamplate extends Doc, IconProps {
  name: string
  description: MarkupBlobRef | null
}

export default plugin(kraTeamId, {
  class: {
    Team: '' as Ref<Class<Team>>,
    KraTeamplate: '' as Ref<Class<KraTeamplate>>,
    Member: '' as Ref<Class<Member>>,
    TeamType: '' as Ref<Class<TeamType>>,
    TeamTypeDescriptor: '' as Ref<Class<TeamTypeDescriptor>>
  },
  icon: {
    KraTeamplates: '' as Asset,
    KraTeamplate: '' as Asset,
    Teams: '' as Asset,
    Metrics: '' as Asset,
    Kras: '' as Asset,
    Member: '' as Asset
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
