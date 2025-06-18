import { KRAStatus, ReviewSessionStatus } from '@hcengineering/performance'
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

export const defaultKRAStatuses = [
  KRAStatus.Drafting,
  KRAStatus.NeedChanges,
  KRAStatus.Approved
  // NOTE: We do not know what to do with Cancelled KRAs yet, so we do not include them in the default statuses
  // KRAStatus.Cancelled
]

export const kraStatusAssets: Record<KRAStatus, { icon: Asset, label: IntlString }> = {
  [KRAStatus.Drafting]: {
    icon: performance.icon.StatusDrafting,
    label: performance.string.Drafting
  },
  [KRAStatus.NeedChanges]: {
    icon: performance.icon.StatusNeedChanges,
    label: performance.string.NeedChanges
  },
  [KRAStatus.Approved]: {
    icon: performance.icon.StatusApproved,
    label: performance.string.Approved
  },
  [KRAStatus.Cancelled]: {
    icon: performance.icon.StatusCancelled,
    label: performance.string.Cancelled
  }
}
