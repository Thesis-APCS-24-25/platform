<script lang="ts">
  import { Issue, Kpi, Report } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize, eventToHTMLElement, Loading, showPopup } from '@hcengineering/ui'
  import KpiReportsPopup from './KpiReportsPopup.svelte'
  import { WithLookup } from '@hcengineering/core'
  import { calculateKpiResult, getReports } from '../../../utils/goal'

  export let value: WithLookup<Kpi>
  export let issue: WithLookup<Issue>
  export let sum: number | undefined = undefined
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'

  let kpiReports: Report[] = []
  $: getReports (value, (res) => {
    kpiReports = res
  })
  $: sum = calculateKpiResult(kpiReports)

  function handleOpenEditor (e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      KpiReportsPopup,
      {
        issue,
        kpi: value,
        sum
      },
      eventToHTMLElement(e)
    )
  }
</script>

{#if sum === undefined}
  <Loading />
{:else}
  <GoalPresenterContainer {kind} {size} onClick={handleOpenEditor}>
    {#if value.target > 0}
      <KpiProgressCircle value={sum} max={value.target} />
    {/if}

    <div class="separator"></div>

    {#if value.$lookup?.unit?.prefix === true}
      <span> {value.$lookup.unit.symbol}</span>
    {/if}
    <strong>{sum}</strong>
    {#if value.$lookup?.unit?.prefix === false}
      <span> {value.$lookup.unit.symbol}</span>
    {/if}
    {#if value.target > 0}
      <span> / {value.target}</span>
    {/if}
  </GoalPresenterContainer>
{/if}

<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }
</style>
