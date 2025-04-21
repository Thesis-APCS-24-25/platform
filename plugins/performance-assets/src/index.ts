import { loadMetadata } from '@hcengineering/platform'
import performance from '@hcengineering/performance'

const icons = require('../assets/icons.svg') as string // eslint-disable-line
loadMetadata(performance.icon, {
  ReviewSession: `${icons}#review-session`,
  KRA: `${icons}#kra`
})
