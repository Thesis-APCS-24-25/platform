<script lang="ts">
  import { Button, IconAdd, SearchInput, showPopup, Header } from '@hcengineering/ui'
  import kraTeam from '../plugins'
  import NewKraTemplate from './NewKraTemplate.svelte'
  export let search = ''

  function showCreateDialog (_e: MouseEvent): void {
    showPopup(NewKraTemplate, {})
  }
</script>

<Header adaptive={'freezeActions'}>
  <svelte:fragment slot="beforeTitle">
    <!-- <ViewletSelector bind:viewlet bind:viewlets viewletQuery={{ attachTo: tracker.class.Component }} /> -->
    <!-- <ViewletSettingButton bind:viewOptions bind:viewlet /> -->
  </svelte:fragment>

  <!-- <Breadcrumbs items={[{ icon: tracker.icon.Component, label }, { label: title }]} /> -->

  <svelte:fragment slot="search">
    <SearchInput bind:value={search} collapsed />
    <!-- <FilterButton _class={tracker.class.Component} {space} /> -->
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={IconAdd} label={kraTeam.string.KraTemplate} kind="primary" on:click={showCreateDialog} />
  </svelte:fragment>
</Header>
