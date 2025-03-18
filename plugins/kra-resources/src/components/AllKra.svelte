<script lang="ts">
  import { FilterBar, SpaceHeader, ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  import kra from '../plugin'
  import { DocumentQuery, Ref, Space, WithLookup } from '@hcengineering/core'
  import { Kra } from '@hcengineering/kra'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import CreateKra from './CreateKra.svelte'

  export let space: Ref<Space> | undefined = undefined
  export let query: DocumentQuery<Kra> = {}

  let viewlet: WithLookup<Viewlet> | undefined = undefined
  const viewlets: WithLookup<Viewlet>[] | undefined = undefined
  let viewOptions: ViewOptions | undefined

  let search = ''
  let searchQuery: DocumentQuery<Kra> = { ...query }
  function updateSearchQuery(search: string): void {
    searchQuery = search === '' ? { ...query } : { ...query, $search: search }
  }
  $: if (query) updateSearchQuery(search)
  let resultQuery: DocumentQuery<Kra> = { ...searchQuery }
</script>

<SpaceHeader
  _class={kra.class.Kra}
  showLabelSelector={$$slots.label_selector}
  viewletQuery={{ attachTo: kra.class.Kra }}
  {viewlets}
  {viewlet}
  label={'hello'}
  search={''}
  {space}
>
  <svelte:fragment slot="label_selector">
    <slot name="label_selector" />
  </svelte:fragment>

  <svelte:fragment slot="type_selector">
    <slot name="type_selector" {viewlet} />
  </svelte:fragment>
</SpaceHeader>

{#if viewlet && viewOptions}
  <ViewletContentView
    _class={kra.class.Kra}
    {viewlet}
    query={resultQuery}
    {space}
    {viewOptions}
    createItemDialog={CreateKra}
    createItemDialogProps={{ shouldSaveDraft: true }}
  />
{/if}
