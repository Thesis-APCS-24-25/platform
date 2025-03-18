<script lang="ts">
  import { DocumentQuery, WithLookup } from '@hcengineering/core'
  import type { IntlString } from '@hcengineering/platform'
  import { isCreateAllowed } from '@hcengineering/presentation'
  import { Button, IconAdd, Breadcrumbs, SearchInput, showPopup, Header } from '@hcengineering/ui'
  import { ViewOptions, Viewlet } from '@hcengineering/view'
  import { FilterBar, FilterButton, ViewletSelector, ViewletSettingButton } from '@hcengineering/view-resources'
  import kra from '../plugin'
  import CreateKra from './CreateKra.svelte'
  import { Kra } from '@hcengineering/kra'
  import KraContent from './kra/KraContent.svelte'

  export let label: IntlString
  export let query: DocumentQuery<Kra> = {}
  export let search = ''

  let viewlet: WithLookup<Viewlet> | undefined
  let viewlets: Array<WithLookup<Viewlet>> | undefined

  let viewOptions: ViewOptions | undefined

  const space = typeof query.space === 'string' ? query.space : undefined

  function showCreateDialog (): void {
    showPopup(CreateKra, { space, targetElement: null }, 'top')
  }

  $: searchQuery = search === '' ? { ...query } : { ...query, $search: search }
  $: resultQuery = { ...searchQuery }
</script>

<Header hideActions={false}>
  <svelte:fragment slot="beforeTitle">
    <ViewletSelector bind:viewlet bind:viewlets viewletQuery={{ attachTo: kra.class.Kra }} />
    <ViewletSettingButton bind:viewOptions bind:viewlet />
  </svelte:fragment>

  <Breadcrumbs items={[{ icon: kra.icon.Kra, label }, { label }]} />

  <svelte:fragment slot="search">
    <SearchInput bind:value={search} collapsed />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={IconAdd} label={kra.string.KRA} kind="primary" on:click={showCreateDialog} />
  </svelte:fragment>
</Header>
<FilterBar
  _class={kra.class.Kra}
  {space}
  query={searchQuery}
  {viewOptions}
  on:change={({ detail }) => (resultQuery = detail)}
/>
{#if viewlet !== undefined && viewOptions}
  <KraContent {viewlet} query={{ ...resultQuery }} {space} {viewOptions} />
{/if}
