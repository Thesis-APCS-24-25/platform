<script lang="ts">
  import { Goal, Issue } from '@hcengineering/kra'
  import AddGoalPopup from './AddGoalPopup.svelte'
  import { Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'

  export let value: Issue

  const client = getClient()
  const dispatch = createEventDispatcher()

  async function handleClose (ev: CustomEvent<Ref<Goal> | undefined>): Promise<void> {
    const goal = ev.detail
    if (goal !== undefined) {
      await client.update(value, { goal })
    }
    dispatch('close')
  }
</script>

<AddGoalPopup issue={value._id} space={value.space} canEditIssue={false} on:close={handleClose}/>
