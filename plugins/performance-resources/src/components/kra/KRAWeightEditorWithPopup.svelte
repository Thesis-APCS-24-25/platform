<script lang="ts">
  import { IntlString } from '@hcengineering/platform'
  import { Button, ButtonSize, EditBox, eventToHTMLElement, Label, showPopup } from '@hcengineering/ui'
  import { EditBoxPopup, NumberPresenter } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import KraWeightEditBoxPopup from './KRAWeightEditBoxPopup.svelte'

  export let placeholder: IntlString
  export let value: number | undefined
  export let autoFocus: boolean = false
  export let onChange: (value: number | undefined) => void
  export let kind: 'no-border' | 'link' | 'button' = 'no-border'
  export let readonly = false
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'
  export let validateFunction: (value: number | undefined) => boolean = () => true

  let shown: boolean = false

  function _onchange (ev: Event): void {
    const value = (ev.target as HTMLInputElement).valueAsNumber
    if (Number.isFinite(value) && validateFunction(value)) {
      onChange(value)
    }
  }
</script>

{#if kind === 'button' || kind === 'link'}
  <Button
    icon={performance.icon.Weight}
    kind={kind === 'button' ? 'regular' : kind}
    {size}
    {justify}
    {width}
    disabled={readonly}
    on:click={(ev) => {
      if (!shown && !readonly) {
        showPopup(
          KraWeightEditBoxPopup,
          {
            value,
            format: 'number',
            otherWeights: [
              {
                value: 0,
                label: 'KRA 0'
              },
              {
                value: 1,
                label: 'KRA1jr1jl 1'
              },
              {
                value: 2,
                label: '3r31wel wel '
              },
              {
                value: 3,
                label: 'klrwl'
              },
              {
                value: 4,
                label: 'g4l erfb'
              }
            ]
          },
          eventToHTMLElement(ev),
          (res) => {
            if (Number.isFinite(res)) {
              value = res
              onChange(value)
            }
            shown = false
          }
        )
      }
    }}
  >
    <svelte:fragment slot="content">
      {#if value}
        <span class="caption-color overflow-label pointer-events-none"><NumberPresenter {value} /></span>
      {:else}
        <span class="content-dark-color pointer-events-none"><Label label={placeholder} /></span>
      {/if}
    </svelte:fragment>
  </Button>
{:else if readonly}
  {#if value != null}
    <span class="caption-color overflow-label"><NumberPresenter {value} /></span>
  {:else}
    <span class="content-dark-color"><Label label={placeholder} /></span>
  {/if}
{:else}
  <EditBox {placeholder} bind:value format={'number'} {autoFocus} on:change={_onchange} />
{/if}
