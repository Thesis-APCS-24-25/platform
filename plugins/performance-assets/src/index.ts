import { loadMetadata } from '@hcengineering/platform'
import performance from '@hcengineering/performance'

const icons = require('../assets/icons.svg') as string // eslint-disable-line
loadMetadata(performance.icon, {
  Unit: `${icons}#unit`,
  WriteReport: `${icons}#write-report`,
  Progress: `${icons}#progress`,
  EditReview: `${icons}#edit-review`,
  StatusApproved: `${icons}#status-approved`,
  StatusNeedChanges: `${icons}#status-need-changes`,
  StatusDrafting: `${icons}#status-drafting`,
  StatusCancelled: `${icons}#status-cancelled`,
  Weight: `${icons}#weight`,
  AssignKRA: `${icons}#assign-kra`,
  ReviewSession: `${icons}#review-session`,
  Active: `${icons}#active`,
  KRA: `${icons}#kra`,
  StatusInProgress: `${icons}#status-in-progress`,
  PerformanceReview: `${icons}#score`,
  StatusConcluded: `${icons}#status-concluded`,
  StartReviewSession: `${icons}#start-review-session`,
  ConcludeReviewSession: `${icons}#conclude-review-session`,
  EmployeeKRA: `${icons}#employee-kra`,
  TimeLeft: `${icons}#time-left`,
  Kpi: `${icons}#kpi`,
  BlockedTask: `${icons}#blocked-task`,
  Reports: `${icons}#reports`
})
