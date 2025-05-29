<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, IModeSelector } from '@hcengineering/ui'
  import { ViewletDescriptor } from '@hcengineering/view'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { ParentsNavigationModel } from '@hcengineering/workbench'
  import performance from '../../plugin'

  export let space: Ref<Space> | undefined = undefined
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

  $: baseQuery = {
    ...baseQuery,
    space
  }
</script>

<SpecialView
  _class={performance.class.KRA}
  {space}
  {icon}
  {label}
  {createEvent}
  {createLabel}
  {createComponent}
  {createComponentProps}
  {createButton}
  {isCreationDisabled}
  {descriptors}
  {baseQuery}
  {modes}
  {navigationModel}
/>
