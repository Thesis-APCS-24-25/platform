<script lang="ts">
  import { Button, ButtonSize, EditBox, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import { NumberPresenter } from '@hcengineering/view-resources'
  import KraWeightEditBoxPopup from './KRAWeightEditBoxPopup.svelte'
  import { Data, getCurrentAccount, Ref, WithLookup } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { EmployeeKRA, KRAStatus, ReviewSession } from '@hcengineering/performance'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'
  import { checkTeamPermission } from '../../utils/team'
  import kraTeam, { Member } from '@hcengineering/kra-team'

  export let value: EmployeeKRA | Data<EmployeeKRA> | WithLookup<EmployeeKRA>
  export let space: Ref<ReviewSession> | undefined = undefined
  const assignee: Ref<Member> = value.assignee

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
  export let doCheckPermission: boolean = true

  async function updateWeight (newWeight: number): Promise<void> {
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

  async function onchange (ev: Event): Promise<void> {
    const newWeight = (ev.target as HTMLInputElement).valueAsNumber
    await updateWeight(newWeight)
  }

  $: if (space !== undefined) {
    if (value.status === KRAStatus.Approved) {
      readonly = true
    } else if (value.assignee !== getCurrentAccount().person) {
      void checkTeamPermission(client, space, kraTeam.permission.AssignWeightForAll).then((res) => {
        readonly = readonly || (doCheckPermission && !res)
      })
    } else {
      readonly = false
    }
  }
  let otherWeights: EmployeeKRA[] = []
  const weightQ = createQuery()
  $: weightQ.query(
    performance.class.EmployeeKRA,
    {
      assignee,
      space: (space ?? '') as Ref<ReviewSession>,
      _id: {
        $ne: _id
      }
    },
    (res) => {
      otherWeights = res
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
