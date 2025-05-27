<script lang='ts'>
  import { Team } from '@hcengineering/kra-team'
  import TeamAndReviewSessionSelector from '../TeamAndReviewSessionSelector.svelte'
  import { ReviewSession } from '@hcengineering/performance'
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

  let team: Ref<Team> | undefined
  let reviewSession: Ref<ReviewSession> | undefined

</script>

<div class={'reports-header'}>
  <TeamAndReviewSessionSelector
    bind:team
    bind:reviewSession
  />
</div>
<SpecialView
  _class={performance.class.PerformanceReport}
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
    space: reviewSession
  }}
  {modes}
  {navigationModel}
/>

<style lang="scss">
  .reports-header {
    padding: 1rem;
    align-items: center;
  }
</style>
