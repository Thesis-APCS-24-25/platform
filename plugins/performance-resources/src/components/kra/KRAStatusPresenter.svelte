<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Data } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'
  import { getClient } from '@hcengineering/presentation'
  import { tooltip } from '@hcengineering/ui'
  import {
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
  import testManagement from '../../plugin'

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
      { value: itemsInfo, placeholder: testManagement.string.SetStatus },
      eventToHTMLElement(event),
      changeStatus
    )
  }

  async function changeStatus (newStatus: EmployeeKRA['status'] | null | undefined): Promise<void> {
    if (disabled || newStatus == null || value === newStatus) {
      return
    }

    value = newStatus
    dispatch('change', value)

    if ('_id' in object) {
      await client.update(object, { status: newStatus })
    }
  }

  $: icon = value === undefined ? testManagement.icon.StatusDrafting : kraStatusAssets[value].icon
  $: label = value === undefined ? testManagement.string.Drafting : kraStatusAssets[value].label
</script>

{#if kind === 'list'}
  <button
    class="flex-no-shrink clear-mins cursor-pointer content-pointer-events-none"
    {disabled}
    on:click={handlePopupOpen}
    use:tooltip={{ label }}
  >
    <Icon {icon} {size}/>
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
    showTooltip={{ label: testManagement.string.SetStatus }}
    on:click={handlePopupOpen}
  />
{/if}
