import view, { createAction } from '@hcengineering/model-view'
import performance from './plugin'
import { type Builder } from '@hcengineering/model'
import workbench from '@hcengineering/model-workbench'
import { ReviewSessionStatus } from '@hcengineering/performance'

export function defineActions (builder: Builder): void {
  createAction(builder, {
    action: view.actionImpl.ValueSelector,
    actionPopup: performance.component.SetProgressMenu,
    actionProps: {
      attribute: ''
    },
    label: performance.string.TrackProgress,
    icon: performance.icon.Progress,
    input: 'none',
    query: {
      progress: null
    },
    target: performance.class.PTask,
    category: view.category.Editor,
    context: {
      mode: ['context'],
      group: 'associate'
    }
  })
  createAction(builder, {
    action: view.actionImpl.ShowPopup,
    actionProps: {
      component: performance.component.RemoveProgressPopup,
      fillProps: {
        _object: 'object'
      }
    },
    query: {
      progress: { $ne: null }
    },
    label: performance.string.RemoveProgress,
    icon: performance.icon.Progress,
    input: 'none',
    target: performance.class.PTask,
    category: view.category.Editor,
    context: {
      mode: ['context'],
      group: 'associate'
    }
  })

  createAction(
    builder,
    {
      action: performance.actionImpl.DeleteReviewSession,
      label: workbench.string.Archive,
      icon: view.icon.Archive,
      input: 'focus',
      category: performance.category.Performance,
      target: performance.class.ReviewSession,
      visibilityTester: performance.function.CanArchiveSpace,
      query: {
        archived: false
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      },
      override: [view.action.Archive, view.action.Delete]
    },
    performance.action.DeleteReviewSession
  )
  createAction(
    builder,
    {
      action: performance.actionImpl.DeleteReviewSession,
      label: workbench.string.Delete,
      icon: view.icon.Delete,
      input: 'focus',
      category: performance.category.Performance,
      target: performance.class.ReviewSession,
      visibilityTester: performance.function.CanArchiveSpace,
      query: {
        archived: true,
        status: { $ne: ReviewSessionStatus.Concluded }
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      },
      override: [view.action.Archive, view.action.Delete]
    },
    performance.action.DeleteReviewSessionClean
  )
}
