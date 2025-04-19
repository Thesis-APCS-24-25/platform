import kraTeam from '@hcengineering/kra-team'
import { loadMetadata } from '@hcengineering/platform'

const icons = require('../assets/icons.svg') as string // eslint-disable-line
loadMetadata(kraTeam.icon, {
  Team: `${icons}#teams`,
  Teams: `${icons}#teams`,
  Member: `${icons}#member`,
  Add: `${icons}#add`,
  Home: `${icons}#home`,
  MyTeams: `${icons}#my-teams`,
  AllTeams: `${icons}#all-teams`
})
