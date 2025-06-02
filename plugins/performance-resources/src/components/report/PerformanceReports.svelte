<script lang='ts'>
  import { Doc, DocumentQuery, Ref, Space } from '@hcengineering/core'
  import performance from '../../plugin'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, IModeSelector } from '@hcengineering/ui'
  import { ViewletDescriptor } from '@hcengineering/view'
  import { ParentsNavigationModel } from '@hcengineering/workbench'

  export let currentSpace: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString
  export let createEvent: string | undefined = undefined
  export let createLabel: IntlString | undefined = undefined
  export let createComponent: AnyComponent | undefined = undefined
  export let createComponentProps: Record<string, any> = {}
  export let createButton: AnyComponent | undefined = undefined
  export let isCreationDisabled = false
  export let descriptors: Array<Ref<ViewletDescriptor>> | undefined = undefined
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined
  export let modes: IModeSelector<any> | undefined = undefined
  export let navigationModel: ParentsNavigationModel | undefined = undefined
</script>

<SpecialView
  _class={performance.class.PerformanceReport}
  space={currentSpace}
  {icon}
  {label}
  {createEvent}
  {createLabel}
  {createComponent}
  {createComponentProps}
  {createButton}
  {isCreationDisabled}
  {descriptors}
  baseQuery={{
    ...baseQuery,
    space: currentSpace
  }}
  {modes}
  {navigationModel}
/>
