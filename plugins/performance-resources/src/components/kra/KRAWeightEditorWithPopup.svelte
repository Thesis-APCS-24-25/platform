<script lang="ts">
  import { IntlString } from '@hcengineering/platform'
  import { Button, ButtonSize, EditBox, eventToHTMLElement, Label, showPopup } from '@hcengineering/ui'
  import { NumberPresenter } from '@hcengineering/view-resources'
  import KraWeightEditBoxPopup from './KRAWeightEditBoxPopup.svelte'
  import { PersonAccount } from '@hcengineering/contact'
  import { checkPermission, Data, getCurrentAccount, Ref, TypedSpace, WithLookup } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { EmployeeKRA, ReviewSession } from '@hcengineering/performance'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'
  import kraTeam from '@hcengineering/kra-team'
  import { canAssignKRAs } from '../../utils/team'

  export let value: EmployeeKRA | Data<EmployeeKRA> | WithLookup<EmployeeKRA>
  export let space: Ref<ReviewSession> | undefined = undefined
  const employee: Ref<PersonAccount> = value.employee

  const client = getClient()
  const _id: Ref<EmployeeKRA> | undefined = '_id' in value ? value._id : undefined
  export let autoFocus: boolean = false
  export let kind: 'no-border' | 'link' | 'button' | 'list' = 'link'
  export let readonly = false
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'fit-content'
  export let doUpdate: boolean = true
  export let validateFunction: (value: number | undefined) => boolean = () => true
  export let onUpdate: (value: number) => void = () => {}
  export let doCheckPermission: boolean = false

  async function updateWeight(newWeight: number): Promise<void> {
    if (Number.isFinite(newWeight) && validateFunction(newWeight)) {
      onUpdate(newWeight)
      if ('_id' in value && doUpdate) {
        await client.update(value, {
          weight: newWeight
        })
      }
    }
  }

  let shown: boolean = false

  async function onchange(ev: Event): Promise<void> {
    const newWeight = (ev.target as HTMLInputElement).valueAsNumber
    await updateWeight(newWeight)
  }

  let canAssign = false
  $: if (space !== undefined) {
    void canAssignKRAs(client, space).then((res) => {
      canAssign = res
    })
  }
  $: readonly = readonly || (doCheckPermission && !canAssign && value.employee !== getCurrentAccount()._id)
  let otherWeights: EmployeeKRA[] = []
  const weightQ = createQuery()
  $: weightQ.query(
    performance.class.EmployeeKRA,
    {
      employee,
      space,
      _id: { $ne: _id }
    },
    (res) => {
      if (res !== undefined) {
        otherWeights = res.filter((item) => item.space === space)
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
      <span class="caption-color overflow-label pointer-events-none"
        ><KraWeightPresenter showPercent value={value.weight} /></span
      >
    </svelte:fragment>
  </Button>
{:else if readonly}
  <span class="caption-color overflow-label"><NumberPresenter value={value.weight} /></span>
{:else}
  <EditBox bind:value={value.weight} format={'number'} {autoFocus} on:change={onchange} />
{/if}
