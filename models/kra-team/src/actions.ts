import { type Builder } from '@hcengineering/model'
import kraTeam from './plugin'
import core from '@hcengineering/model-core'
import view from '@hcengineering/view'
import tracker from '@hcengineering/tracker'

export function defineActions (builder: Builder): void {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.IgnoreActions, {
    actions: [tracker.action.EditRelatedTargets]
  })
}
