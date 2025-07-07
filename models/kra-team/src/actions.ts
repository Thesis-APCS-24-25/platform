import { type Builder } from '@hcengineering/model'
import kraTeam from './plugin'
import core from '@hcengineering/model-core'
import view from '@hcengineering/view'
import { createAction } from '@hcengineering/model-view'
import contact from '@hcengineering/model-contact'

export function defineActions (builder: Builder): void {
  builder.mixin(kraTeam.class.Team, core.class.Class, view.mixin.IgnoreActions, {
    actions: [view.action.Leave, view.action.Join]
  })

  builder.mixin(kraTeam.mixin.Member, core.class.Class, view.mixin.IgnoreActions, {
    actions: [
      view.action.Delete,
      contact.action.KickEmployee,
      contact.action.MergePersons,
      contact.action.ResendInvite,
      contact.action.PublicLink
    ]
  })

  createAction(builder, {
    action: kraTeam.actionImpl.RemoveMember,
    label: kraTeam.string.RemoveMember,
    icon: contact.icon.KickUser,
    input: 'any',
    target: kraTeam.mixin.Member,
    context: { mode: 'context' },
    visibilityTester: kraTeam.function.ShouldDisplayRemoveMemberAction,
    category: view.category.Editor
  })
}
