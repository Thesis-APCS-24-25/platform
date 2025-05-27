import { loadMetadata } from '@hcengineering/platform'
import performance from '@hcengineering/performance'

const icons = require('../assets/icons.svg') as string // eslint-disable-line
loadMetadata(performance.icon, {
  Weight: `${icons}#weight`,
  AssignKRA: `${icons}#assign-kra`,
  ReviewSession: `${icons}#review-session`,
  Active: `${icons}#active`,
  KRA: `${icons}#kra`,
  StatusInProgress: `${icons}#status-in-progress`
})
