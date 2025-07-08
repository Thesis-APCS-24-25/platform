<script lang="ts">
  import performance, { Kpi, Progress } from '@hcengineering/performance'
  import BaseProgressBar from './BaseProgressBar.svelte'
  import KpiProgressBar from './kpi/KpiProgressBar.svelte'
  export let value: Progress

  const kpi = value._class === performance.class.Kpi ? (value as Kpi) : undefined
</script>

{#if kpi}
  <KpiProgressBar value={kpi} />
{:else}
  <BaseProgressBar {value} />
{/if}
