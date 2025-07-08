<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import performance, { Kpi, Progress, PTask } from '@hcengineering/performance'
  import { StatePresenter } from '@hcengineering/task-resources'
  import { ButtonKind, ButtonSize, Button, Icon } from '@hcengineering/ui'
  import { statusStore } from '@hcengineering/view-resources'
  import ProgressSummaryPopup from './ProgressSummaryPopup.svelte'
  import { createQuery } from '@hcengineering/presentation'
  import task from '@hcengineering/task'
  import ProgressBar from './ProgressBar.svelte'
  import KpiProgressBar from './kpi/KpiProgressBar.svelte'

  export let value: WithLookup<PTask>
  export let kind: ButtonKind
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined
  export let disabled: boolean | undefined = false
  export let showDateInformation: boolean = true
  export let doDueDateWarning: boolean = true

  const status = $statusStore.byId.get(value.status)
  let kpi: Kpi | undefined
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
        if (res[0]._class === performance.class.Kpi) {
          kpi = res[0] as Kpi
        } else {
          kpi = undefined
        }
      }
    )
  }
  const getPassedDays = (date: Date): number => {
    const today = new Date()
    const pastDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return pastDays
  }

  const getRemainingDays = (date: Date): number => {
    const today = new Date()
    const remainingDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return remainingDays
  }

  const statusCategory = $statusStore.byId.get(value.status)?.category
  const isWon = statusCategory === task.statusCategory.Won
  const isLost = statusCategory === task.statusCategory.Lost
</script>

<Button
  {kind}
  {size}
  {justify}
  {width}
  {focusIndex}
  {disabled}
  showTooltip={{
    component: ProgressSummaryPopup,
    props: { value }
  }}
>
  <div slot="content" class="flex flex-row-center gap-1">
    {#if isLost}
      <StatePresenter value={status} shouldShowAvatar shouldShowName disabled />
    {:else}
      <StatePresenter value={status} shouldShowAvatar shouldShowName={false} disabled />
      <div class="min-w-28">
        {#if kpi}
          <KpiProgressBar value={kpi} />
        {:else if progress}
          <ProgressBar value={progress} />
        {/if}
      </div>
      {#if showDateInformation}
        {@const passedDays = value.startDate != null ? getPassedDays(new Date(value.startDate)) : undefined}
        {@const remainingDays = value.dueDate != null ? getRemainingDays(new Date(value.dueDate)) : undefined}
        {#if passedDays != null && remainingDays != null}
          <Icon icon={performance.icon.TimeLeft} size="small" />
          <span class="text-xs">
            {passedDays} / {passedDays + remainingDays}
          </span>
        {/if}
        <!-- {#if passedDays != null} -->
        <!--   <span class="text-xs"> -->
        <!--     <Label -->
        <!--       label={performance.string.PassedDays} -->
        <!--       params={{ -->
        <!--         days: passedDays -->
        <!--       }} -->
        <!--     /> -->
        <!--   </span> -->
        <!-- {/if} -->
        <!-- {#if remainingDays != null} -->
        <!--   <span class="text-xs"> -->
        <!--     <Label -->
        <!--       label={performance.string.RemainingDays} -->
        <!--       params={{ -->
        <!--         days: remainingDays -->
        <!--       }} -->
        <!--     /> -->
        <!--   </span> -->
        <!-- {/if} -->
      {/if}
    {/if}
  </div>
</Button>
