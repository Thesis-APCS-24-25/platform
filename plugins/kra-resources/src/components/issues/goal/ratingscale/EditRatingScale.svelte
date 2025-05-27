<script lang="ts">
  import { Goal, Issue, Project, RatingScale } from '@hcengineering/kra'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { onMount } from 'svelte'

  export let canSave = false
  export let issue: Ref<Issue> | undefined = undefined
  export let space: Ref<Project> | undefined = undefined
  export let ratingScale: RatingScale | undefined = undefined

  const data = {
    name: ratingScale?.name ?? '',
    description: ratingScale?.description ?? ''
  }

  const client = getClient()

  export async function save (): Promise<Ref<Goal> | undefined> {
    if (canSave) {
      if (space !== undefined && issue !== undefined) {
        const id = await client.createDoc(kra.class.RatingScale, space, {
          name: data.name,
          description: data.description,
          reports: 0,
          unit: kra.ids.RatingScaleUnit
        })
        return id
      } else if (ratingScale !== undefined) {
        await client.update(ratingScale, {
          name: data.name,
          description: data.description
        })
      }
    }
  }

  $: canSave = data.name.length > 0

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<div class="m-1">
  <EditBox
    label={kra.string.Name}
    kind="default"
    fullSize
    bind:value={data.name}
    placeholder={kra.string.AddNamePlaceholder}
    focusIndex={1}
  />
</div>

<div class="m-1">
  <EditBox
    label={kra.string.Description}
    kind="default"
    fullSize
    bind:value={data.description}
    placeholder={kra.string.IssueDescriptionPlaceholder}
    focusIndex={2}
  />
</div>
