<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { DateTimePresenter, resizeObserver } from '@hcengineering/ui'
  import performance, { Progress, PTask } from '@hcengineering/performance'
  import KpiProgressBar from './kpi/KpiProgressBar.svelte'
  import { WithLookup } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import { StatePresenter } from '@hcengineering/task-resources'
  import { statusStore } from '@hcengineering/view-resources'

  const dispatch = createEventDispatcher()
  export let value: WithLookup<PTask>

  export let doDueDateWarning: boolean = true

  let progress: Progress | undefined = value.$lookup?.progress
  const progressQ = createQuery()
  $: if (value.progress != null) {
    progressQ.query(
      performance.class.Progress,
      {
        _id: value.progress
      },
      (res) => {
        progress = res[0]
      }
    )
  }

  const getPassedDays = (date: Date): number => {
    const today = new Date()
    const pastDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return pastDays
  }

  const getDaysRange = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const occupiedPercentage = (): number => {
    if (value.startDate == null || value.dueDate == null) return 0
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.dueDate)
    const totalDays = getDaysRange(startDate, endDate)
    const passedDays = getPassedDays(startDate)
    return Math.min((passedDays / totalDays) * 100, 100)
  }
  const status = $statusStore.byId.get(value.status)
</script>

<div class="commentPopup-container">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="time-passed">
    <div class="item" style="width: {occupiedPercentage()}%" />
  </div>
  <div
    class="flex-between header"
    use:resizeObserver={() => {
      dispatch('changeContent')
    }}
  >
    <StatePresenter value={status} size="medium" noUnderline />
  </div>
  <div class="content">
    <span>
      <!-- <Label label={performance.string.StartDate} /> -->
      <DateTimePresenter value={value.startDate} />
    </span>
    <div class="bar">
      <KpiProgressBar value={progress?.progress ?? 0} />
    </div>
    <span>
      <DateTimePresenter value={value.dueDate} />
      <!-- <Label label={task.string.DueDate} /> -->
    </span>
  </div>
</div>

<style lang="scss">
  .commentPopup-container {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    min-width: 0;
    min-height: 0;
    max-height: 30rem;

    .time-passed {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0.25rem;
      background-color: var(--theme-divider-color);

      .item {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: green;
      }
    }

    .header {
      flex-shrink: 0;
      margin: 0 0.25rem 0.5rem;
      padding: 0.5rem 1.25rem 1rem 0.75rem;
      border-bottom: 1px solid var(--theme-divider-color);
    }

    .bar {
      margin: 0.5rem 0;
      padding: 0 0.25rem;
      width: 7rem;
      display: flex;
      align-items: center;
    }

    .content {
      overflow: auto;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: row;
      padding: 0.75rem 0.25rem;
      min-width: 0;
      min-height: 0;

      .item {
        max-width: 30rem;
      }
    }

    .input {
      padding: 0.5rem 0.25rem 0.25rem;
    }
  }
</style>
