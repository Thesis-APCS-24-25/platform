<script lang="ts">
  import { getClient } from '@hcengineering/presentation'
  import Chart from './Chart.svelte'
  import performance, { ReviewSession } from '@hcengineering/performance'

  const client = getClient()

  let reviewSession: ReviewSession | undefined

  $: void client.findOne(
    performance.class.ReviewSession,
    {}
  ).then((res) => {
    reviewSession = res
  })
</script>

{#if reviewSession}
  <Chart
    {reviewSession}
  />
{:else}
  <span>None</span>
{/if}
