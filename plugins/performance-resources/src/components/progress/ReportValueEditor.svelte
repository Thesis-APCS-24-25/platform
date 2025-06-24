<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { ProgressReport, Unit } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { Button, ButtonSize, EditBox, eventToHTMLElement, Label, showPopup } from '@hcengineering/ui'
  import { IntlString } from '@hcengineering/platform'
  import { EditBoxPopup, NumberPresenter } from '@hcengineering/view-resources'
  import ValueWithUnit from './unit/ValueWithUnit.svelte'

  export let value: WithLookup<ProgressReport>
  export let readonly: boolean = false
  // export let label: IntlString
  export let placeholder: IntlString
  export let autoFocus: boolean = false
  // export let maxWidth: string = '10rem'

  const onChange: (value: number | undefined) => Promise<void> = async (v) => {
    const client = getClient()
    if (value !== undefined) {
      await client.update(value, {
        value: v
      })
    }
  }
  export let kind: 'no-border' | 'link' | 'button' = 'no-border'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'

  const attachedTo = value.$lookup?.attachedTo

  let unit: Unit | undefined = undefined
  const unitQuery = createQuery()
  // TODO: This should be moved to a more generic place, such as viewlet definition
  $: if (attachedTo !== undefined && 'unit' in attachedTo) {
    const _id = attachedTo.unit as Ref<Unit>
    unitQuery.query(performance.class.Unit, { _id }, (res) => {
      if (res.length > 0) {
        unit = res[0]
      }
    })
  }

  async function _onchange (ev: Event): Promise<void> {
    const value = (ev.target as HTMLInputElement).valueAsNumber
    if (Number.isFinite(value)) {
      await onChange(value)
    }
  }

  let shown: boolean = false
</script>

{#if kind === 'button' || kind === 'link'}
  <Button
    kind={kind === 'button' ? 'regular' : kind}
    {size}
    {justify}
    {width}
    padding={kind === 'link' ? '0' : '0 .75rem'}
    disabled={readonly}
    on:click={(ev) => {
      if (!shown && !readonly) {
        showPopup(EditBoxPopup, { value: value.value, format: 'number' }, eventToHTMLElement(ev), async (res) => {
          if (Number.isFinite(res)) {
            await onChange(res)
          }
          shown = false
        })
      }
    }}
  >
    <svelte:fragment slot="icon">
      {#if unit?.prefix === true}
        <span class="unit m-1">
          {unit.symbol}
        </span>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="iconRight">
      {#if unit?.prefix === false}
        <span class="unit m-1">
          {unit.symbol}
        </span>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="content">
      {#if value != null}
        <span class="caption-color overflow-label pointer-events-none"><NumberPresenter value={value.value} /></span>
      {:else}
        <span class="content-dark-color pointer-events-none"><Label label={placeholder} /></span>
      {/if}
    </svelte:fragment>
  </Button>
{:else if readonly}
  {#if value != null && unit != null}
    <ValueWithUnit {unit} value={value.value} />
  {:else if value != null}
    <span class="caption-color overflow-label"><NumberPresenter value={value.value} /></span>
  {:else}
    <span class="content-dark-color"><Label label={placeholder} /></span>
  {/if}
{:else}
  {#if unit?.prefix === true}
    <span class="unit m-1">
      {unit.symbol}
    </span>
  {/if}
  <EditBox {placeholder} bind:value={value.value} format={'number'} {autoFocus} on:change={_onchange} />
  {#if unit?.prefix === false}
    <span class="unit m-1">
      {unit?.symbol}
    </span>
  {/if}
{/if}

<style lang="scss">
  .unit {
    font-weight: bold;
  }
</style>
