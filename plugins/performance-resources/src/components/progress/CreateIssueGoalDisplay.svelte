<script lang="ts">
  import { Goal, Kpi, RatingScale } from '@hcengineering/kra'
  import { Button, IconClose } from '@hcengineering/ui'
  import { createQuery } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Ref, WithLookup } from '@hcengineering/core'
  import IconKpi from './IconKpi.svelte'
  import IconRatingScale from './IconRatingScale.svelte'

  export let goal: Ref<Goal>
  export let onRemove: () => void = () => {}

  const goalQuery = createQuery()

  let _goal: Goal | null = null

  $: goalQuery.query(
    kra.class.Goal,
    {
      _id: goal
    },
    (res) => {
      if (res.length > 0) {
        _goal = res[0]
      } else {
        _goal = null
      }
    },
    {
      lookup: {
        unit: kra.class.Unit
      }
    }
  )

  let kpi: WithLookup<Kpi> | null = null
  let ratingScale: RatingScale | null = null

  $: if (_goal !== null) {
    if (_goal._class === kra.class.Kpi) {
      kpi = _goal as WithLookup<Kpi>
      ratingScale = null
    } else if (_goal._class === kra.class.RatingScale) {
      ratingScale = _goal as RatingScale
      kpi = null
    }
  }
</script>

{#if _goal}
  <div class="container">
    <div class="icon">
      {#if kpi}
        <IconKpi size="medium" />
      {:else if ratingScale}
        <IconRatingScale size="medium" />
      {/if}
    </div>
    <div class="title">
      <div>{_goal?.name}</div>
    </div>
    <Button
      icon={IconClose}
      showTooltip={{ label: kra.string.RemoveGoal, direction: 'bottom' }}
      kind={'ghost'}
      size={'small'}
      on:click={onRemove}
    />
  </div>
{/if}

<style lang="scss">
  .icon {
    display: flex;
    // align-items: center;
    // justify-content: center;
    margin-right: 0.5rem;
    margin-left: 0.25rem;
  }

  .container {
    width: fit-content;
    display: flex;
    flex-direction: row;
    padding: 0.25rem;
    align-items: center;
    border-radius: 0.25rem;
    border: 1px solid var(--theme-button-border);
    background-color: var(--theme-surface);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .title {
    padding: 0 0.5rem;
    margin: 0 0.25rem;
    border-left: 1px solid var(--theme-button-border);
    border-right: 1px solid var(--theme-button-border);
  }

  .title > div:first-child {
    color: var(--theme-caption-color);
  }
</style>
