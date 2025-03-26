<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import KpiProgressCircle from './KpiProgressCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'

  export let value: Kpi
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'

  function handleKpiEditorOpen(ev: MouseEvent) {
    console.log('KpiPresenter.handleKpiEditorOpen', ev)
  }
</script>

<GoalPresenterContainer {kind} {size}>
  {#if value.target > 0}
    <KpiProgressCircle value={value.value ?? 0 / value.target} />
  {/if}

  <span>
    <strong>{value.value}</strong>
    {#if value.unit}
      <span> {value.unit}</span>
    {/if}
    {#if value.target && value.target > 0}
      <span> / {value.target}</span>
    {/if}
  </span>
</GoalPresenterContainer>
