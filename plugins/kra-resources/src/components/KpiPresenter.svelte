<script lang="ts">
  import { Kpi, KpiReport } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { getKpiReports } from '../utils/goal'

  export let value: Kpi
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'

  let kpiReports: KpiReport[] = []

  $: getKpiReports(value, (res) => {
    kpiReports = res
  })

  $: sum = kpiReports.reduce((acc, it) => acc + it.value, 0)
  $: ratio = (sum / value.target) > 1 ? 1 : sum / value.target

</script>

<GoalPresenterContainer {kind} {size}>
  {#if value.target > 0}
    <KpiProgressCircle value={ratio} />
  {/if}

  <div class="separator"></div>

  <span>
    <strong>{sum}</strong>
    {#if value.unit}
      <span> {value.unit}</span>
    {/if}
    {#if value.target > 0}
      <span> / {value.target}</span>
    {/if}
  </span>

</GoalPresenterContainer>

<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }
</style>
