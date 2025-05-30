<script lang="ts">
  import { IntlString } from '@hcengineering/platform'
  import { Button, ButtonSize, EditBox, eventToHTMLElement, Label, showPopup } from '@hcengineering/ui'
  import { NumberPresenter } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import KraWeightEditBoxPopup from './KRAWeightEditBoxPopup.svelte'
  import { PersonAccount } from '@hcengineering/contact'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { EmployeeKRA } from '@hcengineering/performance'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'

  export let value: WithLookup<EmployeeKRA>
  const employee: Ref<PersonAccount> = value.employee

  const client = getClient()
  const _id: Ref<EmployeeKRA> = value._id
  export let placeholder: IntlString
  export let autoFocus: boolean = false
  export let kind: 'no-border' | 'link' | 'button' | 'list' = 'link'
  export let readonly = false
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'
  export let validateFunction: (value: number | undefined) => boolean = () => true

  async function updateWeight (newWeight: number): Promise<void> {
    if (Number.isFinite(newWeight) && validateFunction(newWeight)) {
      await client.update(value, {
        weight: newWeight
      })
    }
  }

  let shown: boolean = false

  async function onchange (ev: Event): Promise<void> {
    const newWeight = (ev.target as HTMLInputElement).valueAsNumber
    await updateWeight(newWeight)
  }

  let otherWeights: { value: number, label: string }[] = []
  const weightQ = createQuery()
  weightQ.query(
    performance.class.EmployeeKRA,
    {
      employee,
      _id: { $ne: _id }
    },
    (res) => {
      if (res !== undefined) {
        otherWeights = res.map((item) => ({
          value: item.weight,
          label: item.$lookup?.kra?.title ?? ''
        }))
      }
    },
    {
      lookup: {
        kra: performance.class.KRA
      }
    }
  )
</script>
{#if kind === 'button' || kind === 'link' || kind === 'list'}
  <Button
    icon={kind === 'list' ? performance.icon.Weight : undefined}
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
            otherWeights,
            employee,
            value: value.weight
          },
          eventToHTMLElement(ev),
          async (res) => {
            if (res !== undefined) {
              await updateWeight(res)
            }
            shown = false
          }
        )
      }
    }}
  >
    <svelte:fragment slot="content">
      {#if value}
        <span class="caption-color overflow-label pointer-events-none"><KraWeightPresenter showPercent value={value.weight} /></span>
      {:else}
        <span class="content-dark-color pointer-events-none"><Label label={placeholder} /></span>
      {/if}
    </svelte:fragment>
  </Button>
{:else if readonly}
  {#if value != null}
    <span class="caption-color overflow-label"><NumberPresenter value={value.weight} /></span>
  {:else}
    <span class="content-dark-color"><Label label={placeholder} /></span>
  {/if}
{:else}
  <EditBox {placeholder} bind:value={value.weight} format={'number'} {autoFocus} on:change={onchange} />
{/if}
