import { Builder } from '@hcengineering/model'
import core, { AccountRole } from '@hcengineering/core'
import workbench from '@hcengineering/workbench'
import kraTeam from './plugin'
import {
  TKraTemplate,
  TMember,
  TMetric,
  TTeam,
  TTeamType,
  TTeamTypeData,
  TTeamTypeDescriptor
} from './types'
import { defineViewlets } from './viewlets'
import view from '@hcengineering/view'
import { definePresenters } from './presenters'

export { kraTeamId } from '@hcengineering/kra-team'

export {
  TKraTemplate,
  TMetric,
  TTeam,
  TTeamTypeData,
  TTeamType,
  TTeamTypeDescriptor
} from './types'
export default './plugin'

function defineApplication(builder: Builder) {
  builder.createDoc(workbench.class.Application, core.space.Model, {
    label: kraTeam.string.Team,
    icon: kraTeam.icon.Team,
    hidden: false,
    alias: '',
    navigatorModel: {
      specials: [
        {
          id: 'all-teams',
          label: kraTeam.string.AllTeams,
          spaceClass: kraTeam.class.Team,
          accessLevel: AccountRole.User,
          component: workbench.component.SpecialView,
          icon: kraTeam.icon.Team,
          componentProps: {
            _class: kraTeam.class.Team,
            icon: view.icon.List,
            label: kraTeam.string.AllTeams
          }
        }
      ],
      spaces: [
        {
          id: 'teams',
          label: kraTeam.string.Teams,
          spaceClass: kraTeam.class.Team,
          addSpaceLabel: kraTeam.string.CreateTeam,
          createComponent: kraTeam.component.CreateTeam,
          specials: [
            {
              id: 'kra-template',
              label: kraTeam.string.KRATemplates,
              spaceClass: kraTeam.class.KraTeamplate,
              component: kraTeam.component.KraTemplates,
              icon: kraTeam.icon.KraTeamplate
            },
            {
              id: 'members',
              label: kraTeam.string.Members,
              spaceClass: kraTeam.class.Member,
              component: kraTeam.component.Members,
              icon: kraTeam.icon.Member
            }
          ]
        }
      ]
    }
  })
}

function defineSpaceTypes(builder: Builder): void {
  builder.createModel(TTeamTypeData)
  builder.createDoc(
    kraTeam.class.TeamTypeDescriptor,
    core.space.Model,
    {
      name: kraTeam.string.Team,
      description: kraTeam.string.Description,
      icon: kraTeam.icon.Team,
      baseClass: kraTeam.class.Team,
      availablePermissions: []
    },
    kraTeam.descriptor.TeamType
  )

  builder.createDoc(
    kraTeam.class.TeamType,
    core.space.Model,
    {
      name: 'Default Team',
      descriptor: kraTeam.descriptor.TeamType,
      roles: 0,
      targetClass: kraTeam.mixin.TeamTypeData
    },
    kraTeam.spaceType.TeamType
  )
}

export function createModel(builder: Builder): void {
  builder.createModel(TTeam, TMetric, TKraTemplate, TTeamType, TTeamTypeDescriptor, TMember)
  defineSpaceTypes(builder)
  defineViewlets(builder)
  definePresenters(builder)
  defineApplication(builder)
}
