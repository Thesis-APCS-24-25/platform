<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import task from '@hcengineering/task'
  import { WeeTask } from '@hcengineering/kra'
  import { DueDatePresenter } from '@hcengineering/ui'

  export let value: WithLookup<WeeTask>
  export let width: string | undefined = undefined
  export let editable: boolean = true

  const client = getClient()
  $: shouldIgnoreOverdue =
    value.$lookup?.status?.category === task.statusCategory.Won ||
    value.$lookup?.status?.category === task.statusCategory.Lost

  const handleDueDateChanged = async (newDueDate: number | undefined | null) => {
    if (newDueDate === undefined || value.dueDate === newDueDate) {
      return
    }

    await client.updateCollection(
      value._class,
      value.space,
      value._id,
      value.attachedTo,
      value.attachedToClass,
      value.collection,
      { dueDate: newDueDate }
    )
  }
</script>

{#if value}
  <DueDatePresenter
    kind={'link'}
    value={value.dueDate}
    {width}
    {editable}
    onChange={(e) => handleDueDateChanged(e)}
    {shouldIgnoreOverdue}
  />
{/if}
