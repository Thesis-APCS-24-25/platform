<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { createEventDispatcher } from 'svelte'
  import { Button, EditBox, ListView, IconCheck, resizeObserver } from '@hcengineering/ui'
  import type { EditStyle } from '@hcengineering/ui'
  import FixedColumn from '../../../../view-resources/src/components/FixedColumn.svelte'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'

  export let value: number | undefined
  export let otherWeights: {
    value: number
    label: string
  }[] = []
  export let placeholder: IntlString
  export let kind: EditStyle = 'editbox'

  const dispatch = createEventDispatcher()

  function _onkeypress (ev: KeyboardEvent): void {
    if (ev.key === 'Enter') dispatch('close', value)
  }

  function calculateRemaining (value: number): number {
    const total = otherWeights.reduce((acc, item) => acc + item.value, 0)
    const result = 1 - total - value
    return result < 0 ? 0 : result
  }

  let valueInPercent = value !== undefined ? value * 100 : undefined
  const round = (num: number): number => Math.round(num * 100) / 100
  $: value = valueInPercent !== undefined ? round(valueInPercent / 100) : undefined
  $: remaining = calculateRemaining(typeof value === 'number' ? value : 0)
</script>

<div class="selectPopup" use:resizeObserver={() => dispatch('changeContent')}>
  <div class="flex-row-center justify-stretch p-2">
    <div class="overflow-label flex-grow">
      <EditBox
        label={performance.string.Weight}
        maxDigitsAfterPoint={0}
        bind:value={valueInPercent}
        {placeholder}
        format="number"
        {kind}
        select
        on:keypress={_onkeypress}
        maxWidth={'10rem'}
      />
    </div>
    <div class="ml-2">
      <Button icon={IconCheck} size={'small'} on:click={() => dispatch('close', value)} />
    </div>
  </div>
  <ListView items={otherWeights} count={otherWeights.length}>
    <svelte:fragment slot="item" let:item={itemIndex}>
      {@const item = otherWeights[itemIndex]}
      <div class="flex-between p-text-2">
        <FixedColumn justify={'left'} addClass={'fs-bold'} key="weight-label">
          {item.label}
        </FixedColumn>

        <FixedColumn justify={'left'} addClass={'fs-bold'} key="weight-value">
          <KraWeightPresenter value={item.value} {placeholder} kind={'no-border'} showPercent readonly />
        </FixedColumn>
      </div>
    </svelte:fragment>
  </ListView>
  <div class="flex-col items-end m-4">
    <span>Remaining: <KraWeightPresenter value={remaining} showPercent /></span>
  </div>
</div>
