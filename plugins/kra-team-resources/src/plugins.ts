import kraTeam, { kraTeamId } from '@hcengineering/kra-team'
import { type IntlString, mergeIds } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'

export default mergeIds(kraTeamId, kraTeam, {
  string: {
    Role: '' as IntlString,
    CreateTeam: '' as IntlString,
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
    TeamMembers: '' as IntlString,
    AddMember: '' as IntlString,
    Add: '' as IntlString,
    ChooseMember: '' as IntlString
  },
  component: {
    AllMembers: '' as AnyComponent,
    MyTeams: '' as AnyComponent
  }
})
