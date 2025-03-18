import { Builder } from '@hcengineering/model'

import kraTeam from './plugin'
import core from '@hcengineering/core'

import view from '@hcengineering/view'

export function definePresenters(builder: Builder) {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.SpacePresenter, {
    presenter: kraTeam.component.TeamSpacePresenter
  })
}
