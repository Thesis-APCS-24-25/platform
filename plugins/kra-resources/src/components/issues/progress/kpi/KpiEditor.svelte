<script lang="ts">
  import performance, { Kpi, ProgressReport } from '@hcengineering/performance'
  import KpiProgressBar from '../ProgressBar.svelte'
  import { WithLookup } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import ReportsBreakdown from '../ReportsBreakdown.svelte'
  import { Loading } from '@hcengineering/ui'

  export let kpi: WithLookup<Kpi>
  $: sum = kpi.progress

  let unit = kpi.$lookup?.unit
  const unitQuery = createQuery()
  const reportQuery = createQuery()
  let reports: ProgressReport[] | undefined = undefined
  $: if (unit === undefined) {
    unitQuery.query(
      performance.class.Unit,
      {
        _id: kpi.unit
      },
      (res) => {
        unit = res.at(0)
      },
      { limit: 1 }
    )
  }

  $: reportQuery.query(
    performance.class.ProgressReport,
    {
      attachedTo: kpi._id
    },
    (res) => {
      reports = res as ProgressReport[]
    },
    {
      limit: 100
    }
  )
</script>

<div class="flex-col flex-gap-2">
  <div class="flex-row-center p-4 gap-4">
    <div class="flex-col header">
      <div class="fs-title text-xl">
        {kpi.name}
      </div>
    </div>

    <div class="kpi-box flex-col items-end">
      <div class="value">
        <span class="value-value">{sum}</span>
        <span class="value-target"> / {kpi.target}</span>
        <span class="unit">({unit?.name})</span>
      </div>
    </div>
  </div>
  {#if reports}
    <ReportsBreakdown {reports} target={kpi.target} _class={performance.class.Kpi}/>
  {:else}
    <Loading />
  {/if}
</div>

<style>
  .value {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .header {
    flex-grow: 3;
  }

  .value-value {
    color: var(--theme-primary-color, #4c6ef5);
  }

  .kpi-box {
    flex-grow: 1;
    border: 1px solid transparent;
    padding: 0.25rem;
    border-radius: 0.25rem;
    gap: 0.5rem;
    min-width: 10rem;
    color: var(--theme-content-color, #333);
  }
  .unit {
    color: var(--theme-secondary-color, #666);
    font-style: italic;
  }
</style>
