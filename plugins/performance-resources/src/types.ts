import { ReviewSessionStatus } from '@hcengineering/performance'
import { type Asset, type IntlString } from '@hcengineering/platform'
import view from '@hcengineering/view'
import performance from './plugin'

export const defaultReviewSessionStatuses = [
  ReviewSessionStatus.Drafting,
  ReviewSessionStatus.InProgress,
  ReviewSessionStatus.Concluded
]

export const reviewSessionStatusAssets: Record<ReviewSessionStatus, { icon: Asset, label: IntlString }> = {
  [ReviewSessionStatus.Drafting]: {
    icon: view.icon.Edit,
    label: performance.string.Drafting
  },
  [ReviewSessionStatus.InProgress]: {
    icon: performance.icon.StatusInProgress,
    label: performance.string.InProgress
  },
  [ReviewSessionStatus.Concluded]: {
    icon: performance.icon.StatusConcluded,
    label: performance.string.Concluded
  }
}
