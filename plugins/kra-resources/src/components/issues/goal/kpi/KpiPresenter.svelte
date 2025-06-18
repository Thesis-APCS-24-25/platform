<script lang="ts">
  import { Issue, Kpi } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from '../GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportsPopup from './KpiReportsPopup.svelte'
  import { WithLookup } from '@hcengineering/core'
  import kra from '../../../../plugin'

  export let value: WithLookup<Kpi>
  export let issue: WithLookup<Issue>
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let readonly: boolean | undefined = false

  $: sum = value.progress

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

<GoalPresenterContainer disabled={readonly} {kind} {size} onClick={handleOpenEditor.bind(null, sum ?? 0)} showTooltip={{
  label: kra.string.KpiName,
  props: {
    name: value.name
  }
}}>
  {#if value.target > 0}
    <KpiProgressCircle value={sum ?? 0} max={value.target} />
  {/if}
  <div class="separator"></div>

  {#if value.$lookup?.unit?.prefix === true}
    <span class="unit-symbol">{value.$lookup.unit.symbol}</span>
  {/if}
  <strong class="kpi-num">{sum}</strong>
  {#if value.$lookup?.unit?.prefix === false}
    <span class="unit-symbol">{value.$lookup.unit.symbol}</span>
  {/if}
  {#if value.target > 0}
    <span class="kpi-num"> / {value.target}</span>
  {/if}
</GoalPresenterContainer>

<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }

  .unit-symbol {
    margin: 0 0.25rem;
    color: var(--theme-halfcontent-color);
  }

  .kpi-num {
    color: var(--theme-halfcontent-color);
  }
</style>
