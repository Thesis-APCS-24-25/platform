<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import KpiProgressBar from '../ProgressBar.svelte'
  import { WithLookup } from '@hcengineering/core'

  export let kpi: WithLookup<Kpi>
  $: sum = kpi.progress
</script>

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
      <span class="unit"> {kpi.$lookup?.unit?.name}</span>
    </div>
    <KpiProgressBar value={sum ?? 0} max={kpi.target} />
  </div>
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

  .description {
    text-wrap: balance;
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
</style>
