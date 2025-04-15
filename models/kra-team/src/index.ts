import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/core'
import workbench from '@hcengineering/workbench'
import kraTeam from './plugin'
import {
  TKraTemplate,
  TMember,
  TTeam,
  TTeamType,
  TTeamTypeDescriptor
} from './types'
import { defineViewlets } from './viewlets'
import { definePresenters } from './presenters'
import { definePermissions } from './permissions'
import { defineSpaceTypes } from './spacetypes'

export { kraTeamId } from '@hcengineering/kra-team'

export { TKraTemplate, TTeam, TTeamTypeData, TTeamType, TTeamTypeDescriptor } from './types'
export { kraTeam as default }

function defineApplication (builder: Builder): void {
  builder.createDoc(workbench.class.Application, core.space.Model, {
    label: kraTeam.string.Team,
    icon: kraTeam.icon.Team,
    hidden: false,
    alias: 'kra-team',
    component: kraTeam.component.Team
  })
}

export function createModel (builder: Builder): void {
  builder.createModel(TTeam, TKraTemplate, TTeamType, TTeamTypeDescriptor, TMember)
  definePermissions(builder)
  defineSpaceTypes(builder)
  defineViewlets(builder)
  definePresenters(builder)
  defineApplication(builder)
}
