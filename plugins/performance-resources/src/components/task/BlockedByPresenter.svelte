<script lang="ts">
  import { Ref, RelatedDocument } from '@hcengineering/core'
  import performance, { PTask } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { Button, ButtonKind, ButtonSize, Icon, tooltip } from '@hcengineering/ui'
  import BlockedByTooltipPopup from './BlockedByTooltipPopup.svelte'
  import { statusStore } from '@hcengineering/view-resources'
  import task from '@hcengineering/task'

  export let value: RelatedDocument[] | undefined = undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const taskQuery = createQuery()
  let blockedTasks: PTask[] | undefined = undefined
  $: if (value !== undefined && value.length > 0) {
    taskQuery.query(
      performance.class.PTask,
      {
        _id: {
          $in: value
            .filter((task) => hierarchy.isDerived(task._class, performance.class.PTask))
            .map((task) => task._id as Ref<PTask>)
        }
      },
      (res) => {
        blockedTasks = res as PTask[]
      }
    )
  } else {
    taskQuery.unsubscribe()
  }
  $: finishedTasks = blockedTasks?.filter(
    (tsk) => $statusStore.byId.get(tsk.status)?.category === task.statusCategory.Won
  )
</script>

{#if blockedTasks}
  <button
    class="flex-row-center flex-gap-2 container"
    use:tooltip={{
      component: BlockedByTooltipPopup,
      props: {
        blockedTasks,
        finishedTasks
      }
    }}
  >
    <Icon icon={performance.icon.BlockedTask} size="smaller" />
    <span class="font-regular-11">
      {finishedTasks.length}/{blockedTasks.length}
    </span>
  </button>
{/if}

<style lang="scss">
  .container {
    border-radius: 1rem;
    background-color: var(--theme-button-default);
    padding: 0.25rem 0.6rem 0.25rem 0.4rem;
    border: 1px solid var(--theme-button-border);
  }
</style>
