<script lang="ts">
    import { Data, Ref, Space, Timestamp } from '@hcengineering/core'
    import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
    import {
      Button,
      createFocusManager,
      DatePresenter,
      EditBox,
      FocusHandler,
      getPlatformColorDef,
      IconWithEmoji,
      showPopup,
      themeStore
    } from '@hcengineering/ui'
    import view from '@hcengineering/view'
    import { IconPicker, ObjectBox } from '@hcengineering/view-resources'
    import { createEventDispatcher } from 'svelte'
  
    import performance from '../plugin'
    import { createReviewSession } from '../utils/ReviewSessionUtils'
  
    // export function canClose (): boolean {
    //   return object.title === ''
    // }
  
    // export let space: Ref<Space>
  
    const dispatch = createEventDispatcher()
    let client = getClient()
    let name: string = ''
    let description: string = ''
    let startDate: Timestamp
    let endDate: Timestamp
  
    // $: if (_space !== space) _parent = undefined
    $: canSave = true
  
    // function chooseIcon (): void {
    //   const { icon, color } = object
    //   const icons = [performance.icon.Document, performance.icon.Teamspace]
    //   showPopup(IconPicker, { icon, color, icons }, 'top', (result) => {
    //     if (result !== undefined && result !== null) {
    //       object.icon = result.icon
    //       object.color = result.color
    //     }
    //   })
    // }
  
    async function create (): Promise<void> {
      await createReviewSession(client, name, description, startDate, endDate, performance.descriptor.ReviewSessionType)
      dispatch('close', name)
    }
  
    const manager = createFocusManager()
  </script>
  
  <FocusHandler {manager} />
  
  <Card
    label={performance.string.CreateReviewSession}
    okAction={create}
    {canSave}
    on:close={() => {
      dispatch('close')
    }}
    on:changeContent
  >
    <div class="flex-row-center clear-mins">
      <EditBox
        placeholder={performance.string.ReviewSessionNamePlaceholder}
        bind:value={name}
        kind={'large-style'}
        autoFocus
        focusIndex={1}
      />
    </div>
    <div class="flex-row-center clear-mins">
      <EditBox
        placeholder={performance.string.ReviewSessionDescriptionPlaceholder}
        bind:value={description}
        kind={'large-style'}
        autoFocus
        focusIndex={1}
      />
    </div>
    <div class="flex-row-center clear-mins">
      <DatePresenter
        kind={'regular'}
        size={'large'}
        bind:value={startDate}
        editable
      />
    </div>
    <div class="flex-row-center clear-mins">
      <DatePresenter
        kind={'regular'}
        size={'large'}
        bind:value={endDate}
        editable
      />
    </div>
  </Card>
  