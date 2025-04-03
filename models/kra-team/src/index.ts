import { Builder } from '@hcengineering/model'
import core, { AccountRole } from '@hcengineering/core'
import workbench from '@hcengineering/workbench'
import kraTeam from './plugin'
import {
  TKraTemplate,
  TMember,
  TTeam,
  TTeamType,
  TTeamTypeData,
  TTeamTypeDescriptor
} from './types'
import { defineViewlets } from './viewlets'
import view from '@hcengineering/view'
import { definePresenters } from './presenters'
import { definePermissions } from './permissions'
import { defineSpaceTypes } from './spacetypes'

export { kraTeamId } from '@hcengineering/kra-team'

export { TKraTemplate, TTeam, TTeamTypeData, TTeamType, TTeamTypeDescriptor } from './types'
export { kraTeam as default }

function defineApplication(builder: Builder) {
  builder.createDoc(workbench.class.Application, core.space.Model, {
    label: kraTeam.string.Team,
    icon: kraTeam.icon.Team,
    hidden: false,
    alias: 'kra-team',
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
              spaceClass: kraTeam.class.KraTemplate,
              component: kraTeam.component.KraTemplates,
              icon: kraTeam.icon.KraTemplate
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

export function createModel(builder: Builder): void {
  builder.createModel(TTeam, TKraTemplate, TTeamType, TTeamTypeDescriptor, TMember)
  definePermissions(builder)
  defineSpaceTypes(builder)
  defineViewlets(builder)
  definePresenters(builder)
  defineApplication(builder)
}
