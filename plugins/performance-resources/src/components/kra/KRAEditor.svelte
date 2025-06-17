<script lang="ts">
  import { DocumentQuery, Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import { Button, ButtonKind, ButtonSize, showPopup } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { createQuery } from '@hcengineering/presentation'
  import { Task } from '@hcengineering/task'
  import KraEditorPopup from './KRAEditorPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import { Member } from '@hcengineering/kra-team'

  export let value: Ref<KRA>
  export let onChange: ((ref: Ref<KRA> | undefined) => void | Promise<void>) | undefined
  export let readonly = false
  export let kind: ButtonKind = 'primary'
  export let size: ButtonSize = 'large'
  export let shrink: number = 1
  export let width: string | undefined = undefined
  export let object: Task

  async function handleChange(kra: KRA): Promise<void> {
    if (onChange !== undefined && kra !== undefined) {
      await onChange(kra._id)
    }
  }

  let kraDocQuery: DocumentQuery<KRA> = { _id: { $in: [performance.ids.NoKRARef] } }

  const employeeKRAQuery = createQuery()
  $: employeeKRAQuery.query(
    performance.class.EmployeeKRA,
    {
      assignee: object.assignee ?? ('' as Ref<Member>)
    },
    async (result) => {
      if (result !== undefined && result.length > 0) {
        const krasOfAssignee: Ref<KRA>[] | undefined = result.map((it) => it.kra)
        if (!krasOfAssignee.includes(value)) {
          if (onChange !== undefined) {
            await onChange(performance.ids.NoKRARef)
          }
        }
        kraDocQuery = {
          _id: { $in: krasOfAssignee }
        }
      } else {
        if (onChange !== undefined) {
          await onChange(performance.ids.NoKRARef)
        }
        kraDocQuery = { _id: { $in: [performance.ids.NoKRARef] } }
      }
    }
  )
</script>

{#if kind === 'list'}
  <Button
    {kind}
    {size}
    {width}
    justify="left"
    disabled={readonly}
    on:click={() => {
      showPopup(
        KraEditorPopup,
        {
          value,
          docQuery: kraDocQuery
        },
        'top',
        handleChange
      )
    }}
  >
    <svelte:fragment slot="content">
      <KraRefPresenter {value} type="text" {shrink} shouldShowAvatar />
    </svelte:fragment>
  </Button>
{:else}
  <Button
    {kind}
    {size}
    justify="left"
    {width}
    disabled={readonly}
    on:click={() => {
      showPopup(
        KraEditorPopup,
        {
          value,
          docQuery: kraDocQuery
        },
        'top',
        handleChange
      )
    }}
  >
    <svelte:fragment slot="content">
      <KraRefPresenter {value} type="text" {shrink} shouldShowAvatar />
    </svelte:fragment>
  </Button>
{/if}
