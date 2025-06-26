<script lang="ts">
  import { Icon, Label } from '@hcengineering/ui'
  import performance, { PTask } from '@hcengineering/performance'
  import { ObjectPresenter, statusStore } from '@hcengineering/view-resources'
  import { StatePresenter } from '@hcengineering/task-resources'
  import { Status } from '@hcengineering/core'

  export let blockedTasks: PTask[] | undefined = undefined
  export let finishedTasks: PTask[] | undefined = undefined
  $: nonFinishedTasks = blockedTasks?.filter((tsk) => !(finishedTasks?.some((fTsk) => fTsk._id === tsk._id) ?? false))
  function taskStatus(task: PTask): Status | undefined {
    return $statusStore.byId.get(task.status)
  }
</script>

{#if blockedTasks !== undefined && nonFinishedTasks !== undefined && finishedTasks !== undefined && blockedTasks.length > 0}
  <div class="flex-col-stretch flex-gap-2 m-1">
    <Label label={performance.string.BlockedTasks} />
    {#each nonFinishedTasks as task (task._id)}
      {@const status = taskStatus(task)}
      <div class="flex-row-center flex-gap-2 ml-2">
        <ObjectPresenter value={task} />
        <div class="vertical-divider" />
        <StatePresenter value={status} disabled/>
      </div>
    {/each}
    {#if finishedTasks.length > 0}
      <div class="divider" />
      <Label label={performance.string.FinishedBlockedTasks} />
      {#each finishedTasks as task}
        <div class="flex-row-center flex-gap-2 ml-2">
          <ObjectPresenter value={task} />
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style lang="scss">
  .divider {
    height: 1px;
    background-color: var(--theme-divider-color);
    margin: 8px 0;
  }

  .vertical-divider {
    width: 2px;
    height: 16px;
    background-color: var(--theme-divider-color);
  }
</style>
