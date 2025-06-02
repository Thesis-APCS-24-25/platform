<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Report, Unit } from '@hcengineering/kra'
  import { createQuery } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Button, ButtonSize, EditBox, eventToHTMLElement, Label, showPopup } from '@hcengineering/ui'
  import { IntlString } from '@hcengineering/platform'
  import { EditBoxPopup, NumberPresenter } from '@hcengineering/view-resources'

  export let value: WithLookup<Report>
  export let readonly: boolean = false
  // export let label: IntlString
  export let placeholder: IntlString
  export let autoFocus: boolean = false
  // export let maxWidth: string = '10rem'
  export let onChange: (value: number | undefined) => void
  export let kind: 'no-border' | 'link' | 'button' = 'button'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'

  const attachedTo = value.$lookup?.attachedTo

  let unit: Unit | undefined = undefined
  const unitQuery = createQuery()
  unitQuery.query(kra.class.Unit, { _id: attachedTo?.unit }, (res) => {
    if (res.length > 0) {
      unit = res[0]
    }
  })

  function _onchange (ev: Event): void {
    const value = (ev.target as HTMLInputElement).valueAsNumber
    if (Number.isFinite(value)) {
      onChange(value)
    }
  }

  let shown: boolean = false
</script>

{#if unit?.prefix === true}
  <span class="unit">
    {unit.symbol}
  </span>
{/if}

{#if kind === 'button' || kind === 'link'}
  <Button
    kind={kind === 'button' ? 'regular' : kind}
    {size}
    {justify}
    {width}
    disabled={readonly}
    on:click={(ev) => {
      if (!shown && !readonly) {
        showPopup(EditBoxPopup, { value, format: 'number' }, eventToHTMLElement(ev), (res) => {
          if (Number.isFinite(res)) {
            value = res
            onChange(value.value)
          }
          shown = false
        })
      }
    }}
  >
    <svelte:fragment slot="content">
      {#if value != null}
        <span class="caption-color overflow-label pointer-events-none"><NumberPresenter value={value.value} /></span>
      {:else}
        <span class="content-dark-color pointer-events-none"><Label label={placeholder} /></span>
      {/if}
    </svelte:fragment>
  </Button>
{:else if readonly}
  {#if value != null}
    <span class="caption-color overflow-label"><NumberPresenter value={value.value} /></span>
  {:else}
    <span class="content-dark-color"><Label label={placeholder} /></span>
  {/if}
{:else}
  <EditBox {placeholder} bind:value={value.value} format={'number'} {autoFocus} on:change={_onchange} />
{/if}
{#if unit?.prefix === false}
  <span class="unit">
    {unit.symbol}
  </span>
{/if}

<style lang="scss">
  .unit {
    font-weight: bold;
  }
</style>
