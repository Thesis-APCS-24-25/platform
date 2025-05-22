import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/model-core'
import view from '@hcengineering/view'
import performance from '.'

export function defineViewlets (builder: Builder): void {
  builder.createDoc(
    view.class.ViewletDescriptor,
    core.space.Model,
    {
      label: view.string.List,
      icon: view.icon.List,
      component: performance.component.ListView
    },
    performance.viewlet.TaskList
  )
}
