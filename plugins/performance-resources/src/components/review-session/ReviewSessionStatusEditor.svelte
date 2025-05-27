<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Data } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
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

  import { defaultReviewSessionStatuses, reviewSessionStatusAssets } from '../../types'
  import { ReviewSession } from '@hcengineering/performance'
  import performance from '../../plugin'
  import view from '@hcengineering/view'

  export let value: ReviewSession['status'] | undefined
  export let object: ReviewSession | Data<ReviewSession>
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let disabled = false
  export let shouldShowAvatar: boolean = true
  export let accent: boolean = false

  const dispatch = createEventDispatcher()
  const client = getClient()

  $: itemsInfo = defaultReviewSessionStatuses.map((status) => ({
    id: status,
    isSelected: value === status,
    ...reviewSessionStatusAssets[status]
  }))

  function handlePopupOpen (event: MouseEvent): void {
    showPopup(
      SelectPopup,
      { value: itemsInfo, placeholder: performance.string.SetStatus },
      eventToHTMLElement(event),
      changeStatus
    )
  }

  async function changeStatus (newStatus: ReviewSession['status'] | null | undefined): Promise<void> {
    if (disabled || newStatus == null || value === newStatus) {
      return
    }

    value = newStatus
    dispatch('change', value)

    if (object !== undefined && '_id' in object) {
      await client.update(object, { status: newStatus })
    }
  }

  $: icon = value === undefined ? view.icon.Statuses : reviewSessionStatusAssets[value].icon
  $: label = value === undefined ? performance.string.SetStatus : reviewSessionStatusAssets[value].label
</script>

{#if kind === 'list'}
  <button
    class="flex-no-shrink clear-mins cursor-pointer content-pointer-events-none"
    {disabled}
    on:click={handlePopupOpen}
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
