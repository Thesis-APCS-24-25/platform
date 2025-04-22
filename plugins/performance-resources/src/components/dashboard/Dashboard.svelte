<script lang="ts">
  import { getClient, SpaceSelector } from '@hcengineering/presentation'
  import Chart from './Chart.svelte'
  import { ReviewSession } from '@hcengineering/performance'
  import { Ref, SortingOrder } from '@hcengineering/core'
  import performance from '../../plugin'

  const client = getClient()

  let _space: Ref<ReviewSession>

  $: void client.findOne(
    performance.class.ReviewSession,
    {},
    {
      sort: {
        modifiedOn: SortingOrder.Descending
      }
    }
  ).then((res) => {
    if (res !== undefined) {
      _space = res._id
    }
  })
</script>

<div>
  <SpaceSelector
    _class={performance.class.ReviewSession}
    label={performance.string.ReviewSessionName}
    bind:space={_space}
    kind={'regular'}
    size={'small'}
  />
  {#if _space}
    <Chart
      space={_space}
    />
  {:else}
    <span>None</span>
  {/if}
</div>
