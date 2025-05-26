<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { onMount } from 'svelte'

  export let ratingScale: RatingScale

  const data = {
    name: ratingScale.name,
    description: ratingScale.description
  }

  const client = getClient()

  $: canSave = data.name.length > 0

  export async function save (): Promise<void> {
    if (canSave) {
      if (data.name === ratingScale.name && data.description === ratingScale.description) {
        return
      }

      await client.update(ratingScale, {
        name: data.name,
        description: data.description
      })
    }
  }

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<Card label={kra.string.EditRatingScale} okAction={save} okLabel={kra.string.Save} {canSave} width="medium" on:close>
  <div class="m-4">
    <EditBox
      kind="large-style"
      fullSize
      bind:value={data.name}
      placeholder={kra.string.AddNamePlaceholder}
      focusIndex={1}
    />
  </div>

  <div class="m-4">
    <EditBox
      kind="large-style"
      fullSize
      bind:value={data.description}
      placeholder={kra.string.IssueDescriptionPlaceholder}
      focusIndex={2}
    />
  </div>
</Card>
