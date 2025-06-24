import { createAction } from '@hcengineering/model-view'
import view from '@hcengineering/view'
import performance from './plugin'
import { type Builder } from '@hcengineering/model'

export function defineActions(builder: Builder): void {
  createAction(builder, {
    action: view.actionImpl.ValueSelector,
    actionPopup: performance.component.SetProgressMenu,
    actionProps: {
      attribute: ''
    },
    label: performance.string.SetProgress,
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
}
