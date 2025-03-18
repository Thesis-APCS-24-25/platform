import kraTeam, { kraTeamId } from '@hcengineering/kra-team'
import { Asset, IntlString, mergeIds } from '@hcengineering/platform'
import { AnyComponent } from '@hcengineering/ui'

export default mergeIds(kraTeamId, kraTeam, {
  icon: {
    Team: '' as Asset
  },
  string: {
    Team: '' as IntlString,
    Teams: '' as IntlString,
    AllTeams: '' as IntlString,
    CreateTeam: '' as IntlString,
    Description: '' as IntlString,
    Metrics: '' as IntlString,
    Name: '' as IntlString,
    KRATemplates: '' as IntlString,
    Members: '' as IntlString
  },
  component: {
    AllTeams: '' as AnyComponent,
    MemberPresenter: '' as AnyComponent,
    CreateTeam: '' as AnyComponent,
    Members: '' as AnyComponent,
    KraTemplates: '' as AnyComponent,
    TeamSpacePresenter: '' as AnyComponent
  }
})
