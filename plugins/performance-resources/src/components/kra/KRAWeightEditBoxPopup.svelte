<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { createEventDispatcher } from 'svelte'
  import { Button, EditBox, ListView, IconCheck, resizeObserver, Label } from '@hcengineering/ui'
  import type { EditStyle } from '@hcengineering/ui'
  import FixedColumn from '../../../../view-resources/src/components/FixedColumn.svelte'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'
  import { Data } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'
  import KraRefPresenter from './KRARefPresenter.svelte'

  export let value: number | undefined
  export let otherWeights: Data<EmployeeKRA>[] = []
  export let placeholder: IntlString
  export let kind: EditStyle = 'editbox'

  const dispatch = createEventDispatcher()

  $: remaining = calculateRemaining(typeof value === 'number' ? value : 0)

  function onSubmit (): void {
    if (remaining < 0) return
    dispatch('close', value)
  }

  function _onkeypress (ev: KeyboardEvent): void {
    if (ev.key === 'Enter') {
      onSubmit()
    }
  }

  function calculateRemaining (value: number): number {
    const total = otherWeights.reduce((acc, item) => acc + item.weight, 0)
    const result = 100 - total - value
    return result
  }
</script>

<div class="antiCard" use:resizeObserver={() => dispatch('changeContent')}>
  <div class="antiCard-header flex-row-center justify-stretch p-2">
    <div class="overflow-label flex-grow">
      <EditBox
        label={performance.string.Weight}
        maxDigitsAfterPoint={0}
        bind:value={value}
        {placeholder}
        format="number"
        kind='ghost'
        select
        on:keypress={_onkeypress}
        maxWidth={'10rem'}
      />
    </div>
    <div class="ml-2">
      <Button icon={IconCheck} disabled={remaining < 0} size={'small'} on:click={onSubmit} />
    </div>
  </div>
  <ListView items={otherWeights} count={otherWeights.length}>
    <svelte:fragment slot="item" let:item={itemIndex}>
      {@const item = otherWeights[itemIndex]}
      <div class="flex-between p-text-2 flex-gap-4">
        <FixedColumn justify={'left'} addClass={'fs-bold'} key="weight-label">
          <KraRefPresenter value={item.kra} kind='list'/>
        </FixedColumn>

        <FixedColumn justify={'right'} addClass={'fs-bold'} key="weight-value">
          <KraWeightPresenter value={item.weight} {placeholder} kind={'no-border'} showPercent readonly />
        </FixedColumn>
      </div>
    </svelte:fragment>
  </ListView>
  <div class="flex-col items-end m-4 text-right">
    <span>
      <Label label={performance.string.RemainingWeight}/>:
      <KraWeightPresenter value={remaining} showPercent />
      <span class="error-color">
        {#if remaining < 0}
          <Label
            label={performance.string.TotalWeightOverflow}
          />
        {/if}
      </span>
    </span>
  </div>
</div>
