import { type Builder } from '@hcengineering/model'

import kraTeam from './plugin'
import core from '@hcengineering/core'

import view from '@hcengineering/view'

export function definePresenters (builder: Builder): void {
  builder.mixin(core.class.Role, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: kraTeam.component.RolePresenter
  })
}
