<script lang="ts">
  import kra from '../../../plugin'
  import { Goal, Issue, Project, Kpi, RatingScale } from '@hcengineering/kra'
  import { DropdownIntlItem, Label } from '@hcengineering/ui'
  import EditKpi from './kpi/EditKpi.svelte'
  import EditRatingScale from './ratingscale/EditRatingScale.svelte'
  import { Ref } from '@hcengineering/core'

  export let issue: Ref<Issue>
  export let space: Ref<Project>
  export let canEditIssue: boolean = true

  const items: DropdownIntlItem[] = [
    {
      id: 'kpi',
      label: kra.string.Kpi
    },
    {
      id: 'rating-scale',
      label: kra.string.RatingScale
    }
  ]

  let selected: DropdownIntlItem['id'] = 'kpi'

  let canSaveKpi = false
  let canSaveRatingScale = false
</script>

<div class="container">
  <div class="header">
    {#each items as item}
      {@const isSelected = item.id === selected}
      <button
        class="header-item"
        class:selected={isSelected}
        on:click={() => {
          selected = item.id
        }}
      >
        <Label label={item.label} />
      </button>
    {/each}
  </div>

  {#if selected === 'kpi'}
    <EditKpi {space} bind:canSave={canSaveKpi} {issue} {canEditIssue} />
  {:else if selected === 'rating-scale'}
    <EditRatingScale {space} bind:canSave={canSaveRatingScale} {issue} {canEditIssue} />
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    background-color: var(--theme-bg-color);
  }

  //
  // .header {
  //   display: flex;
  //   justify-content: flex-start;
  //   margin-bottom: -0.5rem;
  //   padding-bottom: 0.5rem;
  //   padding-left: 0.5rem;
  //   padding-right: 0.5rem;
  //   border-top-left-radius: 0.25rem;
  //   border-top-right-radius: 0.25rem;
  //   background-color: var(--theme-bg-dark-color);
  // }
  .header {
    display: flex;
    flex-direction: row;
    justify-items: center;
    padding: 0 1rem;
    background-color: var(--hc-color-background-secondary);
    border-bottom: 1px solid var(--hc-color-border);
  }

  .header-item {
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;

    &.selected {
      background-color: var(--theme-button-pressed);
      border-bottom: 2px solid grey;
    }

    &:hover {
      border-bottom: 2px solid grey;
    }
  }

  .content {
    flex-grow: 1;
  }

  .hidden {
    display: none;
  }
</style>
