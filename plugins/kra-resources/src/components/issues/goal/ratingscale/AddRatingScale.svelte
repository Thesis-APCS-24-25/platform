<script lang="ts">
  import { Goal, Issue, Project } from '@hcengineering/kra'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { onMount } from 'svelte'

  export let canSave = false
  export let issue: Ref<Issue>
  export let space: Ref<Project>

  const data = {
    name: '',
    description: ''
  }

  const client = getClient()

  export async function save (): Promise<Ref<Goal> | undefined> {
    if (canSave && issue !== undefined) {
      if (issue === undefined) {
        return undefined
      }

      const apply = client.apply()
      const id = await apply.createDoc(kra.class.RatingScale, space, {
        name: data.name,
        description: data.description,
        reports: 0,
        unit: kra.ids.RatingScaleUnit
      })

      await apply.commit()

      return id
    }
  }

  $: canSave = data.name.length > 0

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

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
