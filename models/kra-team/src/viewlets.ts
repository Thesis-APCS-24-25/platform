import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/core'
import view from '@hcengineering/view'
import kraTeam from './plugin'

export function defineViewlets (builder: Builder): void {
  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: kraTeam.class.Team,
    descriptor: view.viewlet.Table,
    config: [
      'name',
      {
        key: 'members',
        props: {
          readonly: true
        }
      }
    ],
    options: {
      showArchived: true
    },
    viewOptions: {
      groupBy: [],
      orderBy: [],
      other: []
    }
  })

  builder.createDoc(view.class.Viewlet, core.space.Model, {
    attachTo: kraTeam.mixin.Member,
    descriptor: view.viewlet.Table,
    config: [
      {
        key: ''
      },
      {
        key: '',
        label: kraTeam.string.Roles,
        displayProps: {
          compression: true
        },
        presenter: kraTeam.component.MemberRolePresenter
      }
    ],
    viewOptions: {
      groupBy: [],
      orderBy: [],
      other: []
    }
  })
}
