<script lang="ts">
  import { Issue, Kpi } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from '../GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportsPopup from './KpiReportsPopup.svelte'
  import { WithLookup } from '@hcengineering/core'
  import { calculateResult } from '../../../../utils/goal'

  export let value: WithLookup<Kpi>
  export let issue: WithLookup<Issue>
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'

  $: sum = calculateResult(value, undefined)

  function handleOpenEditor (sum: number, e: MouseEvent): void {
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

{#await sum then sum}
  <GoalPresenterContainer {kind} {size} onClick={handleOpenEditor.bind(null, sum ?? 0)}>
    {#if value.target > 0}
      <KpiProgressCircle value={sum ?? 0} max={value.target} />
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
{/await}
<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }
</style>
