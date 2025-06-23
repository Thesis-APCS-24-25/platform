<script lang="ts">
  import { DocumentQuery, Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import { Button, ButtonKind, ButtonSize, Label, LabelAndProps, showPopup } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { createQuery } from '@hcengineering/presentation'
  import KraEditorPopup from './KRAEditorPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import { Member } from '@hcengineering/kra-team'
  import { createEventDispatcher } from 'svelte'
  import { IntlString } from '@hcengineering/platform'

  export let value: Ref<KRA> | undefined = undefined
  export let assignee: Ref<Member> | null | undefined = undefined
  export let readonly = false
  export let kind: ButtonKind = 'primary'
  export let size: ButtonSize = 'large'
  export let shrink: number = 1
  export let width: string | undefined = undefined
  export let focusIndex: number = -1
  export let showTooltip: LabelAndProps | undefined = undefined
  export let allowDeselect: boolean = false
  export let placeholder: IntlString = performance.string.NoKRASelected

  const dispatch = createEventDispatcher()

  async function handleChange (kra: KRA): Promise<void> {
    if (kra == null) {
      value = undefined
      dispatch('change', undefined)
    } else {
      value = kra._id
      dispatch('change', kra._id)
    }
  }

  let kraDocQuery: DocumentQuery<KRA> = { _id: { $in: [performance.ids.NoKRARef] } }

  const employeeKRAQuery = createQuery()
  $: employeeKRAQuery.query(
    performance.class.EmployeeKRA,
    {
      assignee
    },
    async (result) => {
      if (result !== undefined && result.length > 0) {
        const krasOfAssignee: Ref<KRA>[] | undefined = result.map((it) => it.kra)
        if (!krasOfAssignee.includes(value)) {
          dispatch('change', performance.ids.NoKRARef)
        }
        kraDocQuery = {
          _id: { $in: krasOfAssignee }
        }
      } else {
        dispatch('change', performance.ids.NoKRARef)
        kraDocQuery = { _id: { $in: [performance.ids.NoKRARef] } }
      }
    }
  )
</script>

<Button
  {focusIndex}
  {kind}
  {size}
  {width}
  justify="left"
  disabled={readonly}
  {showTooltip}
  on:click={() => {
    showPopup(
      KraEditorPopup,
      {
        value,
        docQuery: kraDocQuery,
        allowDeselect
      },
      'top',
      handleChange
    )
  }}
>
  <svelte:fragment slot="content">
    {#if value !== undefined}
      <KraRefPresenter {value} type="text" {shrink} shouldShowAvatar />
    {:else}
      <Label label={placeholder} />
    {/if}
  </svelte:fragment>
</Button>
