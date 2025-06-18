<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Data } from '@hcengineering/core'
  import { EmployeeKRA, KRAStatus } from '@hcengineering/performance'
  import { getClient } from '@hcengineering/presentation'
  import {
    tooltip,
    Button,
    ButtonKind,
    ButtonSize,
    Icon,
    SelectPopup,
    eventToHTMLElement,
    showPopup,
    Label
  } from '@hcengineering/ui'
  import { defaultKRAStatuses, kraStatusAssets } from '../../types'
  import performance from '../../plugin'
  import LeaveKRACommentPopup from './LeaveKRACommentPopup.svelte'

  export let value: EmployeeKRA['status'] | undefined
  export let object: EmployeeKRA | Data<EmployeeKRA>
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'medium'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let disabled = false
  export let shouldShowAvatar: boolean = true
  export let accent: boolean = false

  const dispatch = createEventDispatcher()
  const client = getClient()

  $: itemsInfo = defaultKRAStatuses.map((status) => ({
    id: status,
    isSelected: value === status,
    ...kraStatusAssets[status]
  }))

  function handlePopupOpen (event: MouseEvent): void {
    showPopup(
      SelectPopup,
      { value: itemsInfo, placeholder: performance.string.SetStatus },
      eventToHTMLElement(event),
      changeStatus.bind(null, event)
    )
  }

  async function changeStatus (event: MouseEvent, newStatus: EmployeeKRA['status'] | null | undefined): Promise<void> {
    if (disabled || newStatus == null || value === newStatus) {
      return
    }

    if (newStatus === value) {
      return
    } else if (newStatus === KRAStatus.NeedChanges) {
      showPopup(LeaveKRACommentPopup, { object }, eventToHTMLElement(event), async (e) => {
        const submitted = e
        if (submitted === true) {
          value = newStatus
          dispatch('change', value)

          if ('_id' in object) {
            await client.update(object, { status: newStatus })
          }
        }
      })
      return
    }

    value = newStatus
    dispatch('change', value)

    if ('_id' in object) {
      await client.update(object, { status: newStatus })
    }
  }

  $: icon = value === undefined ? performance.icon.StatusDrafting : kraStatusAssets[value].icon
  $: label = value === undefined ? performance.string.Drafting : kraStatusAssets[value].label
</script>

{#if kind === 'list'}
  <button
    class="flex-no-shrink clear-mins cursor-pointer content-pointer-events-none"
    {disabled}
    on:click={handlePopupOpen}
    use:tooltip={{ label }}
  >
    <Icon {icon} {size} />
  </button>
{:else if kind === 'list-header'}
  <div class="flex-row-center pl-0-5">
    {#if shouldShowAvatar}
      <Icon {icon} {size} />
    {/if}
    <span class="overflow-label" class:ml-1-5={shouldShowAvatar} class:fs-bold={accent}><Label {label} /></span>
  </div>
{:else}
  <Button
    {label}
    {kind}
    {icon}
    {justify}
    {size}
    {width}
    {disabled}
    showTooltip={{ label: performance.string.SetStatus }}
    on:click={handlePopupOpen}
  />
{/if}
