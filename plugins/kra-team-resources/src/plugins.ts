import kraTeam, { kraTeamId } from '@hcengineering/kra-team'
import { Asset, IntlString, mergeIds } from '@hcengineering/platform'

export default mergeIds(kraTeamId, kraTeam, {
  string: {
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
    TeamMembers: '' as IntlString,
  },
  icon: {
    AddMetric: '' as Asset,
    Add: '' as Asset,
    Home: '' as Asset,
  }
})
