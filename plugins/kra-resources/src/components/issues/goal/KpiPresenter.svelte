<script lang="ts">
  import { Issue, Kpi, KpiReport } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize, eventToHTMLElement, Loading, showPopup } from '@hcengineering/ui'
  import { getKpiReports } from '../../../utils/goal'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import KpiReportsPopup from './KpiReportsPopup.svelte'

  export let value: Kpi
  export let issue: Issue
  export let sum: number | undefined = undefined
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'

  $: if (sum === undefined) {
    getKpiReports(value, (res) => {
      sum = res.reduce((acc, it) => acc + it.value, 0)
    })
  }

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
{/if}

<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }
</style>
