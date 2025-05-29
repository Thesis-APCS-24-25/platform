<script lang="ts">
  import { Ref, Class, Doc, Space, DocumentQuery } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { AnyComponent, IModeSelector } from '@hcengineering/ui'
  import { ViewletDescriptor } from '@hcengineering/view'
  import { ParentsNavigationModel } from '@hcengineering/workbench'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { currentTeam } from '../../utils/team'

  export let _class: Ref<Class<Doc>>
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
    space: $currentTeam
  }
</script>

<SpecialView
  {_class}
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
