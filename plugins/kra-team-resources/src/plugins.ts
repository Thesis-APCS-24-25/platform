import kraTeam, { kraTeamId } from '@hcengineering/kra-team'
import { type Asset, type IntlString, mergeIds } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'

export default mergeIds(kraTeamId, kraTeam, {
  string: {
    AllTeams: '' as IntlString,
    MyTeams: '' as IntlString,
    KraTemplate: '' as IntlString,
    Members: '' as IntlString,
    RoleLabel: '' as IntlString,
    TeamName: '' as IntlString,
    ChooseIcon: '' as IntlString,
    NewKraTemplate: '' as IntlString,
    KraNamePlaceholder: '' as IntlString,
    KraDescriptionPlaceholder: '' as IntlString,
    MetricsList: '' as IntlString,
    Team: '' as IntlString,
    TeamNamePlaceholder: '' as IntlString,
    TeamDescriptionPlaceholder: '' as IntlString,
    TeamMembers: '' as IntlString
  },
  icon: {
    AddMetric: '' as Asset,
    Add: '' as Asset,
    Home: '' as Asset
  },
  component: {
    AllTeams: '' as AnyComponent,
    MyTeams: '' as AnyComponent
  }
})
