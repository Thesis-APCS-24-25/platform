<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { PTask, Progress } from '@hcengineering/performance'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import ReportsPopup from './ReportsPopup.svelte'
  import ProgressReportEditPopup from './ProgressReportEditPopup.svelte'

  export let task: PTask
  export let progress: WithLookup<Progress>

  function addReport (event: MouseEvent): void {
    showPopup(
      ProgressReportEditPopup,
      {
        space: task.space,
        attachedTo: progress._id,
        assignee: task.assignee
      },
      eventToHTMLElement(event)
    )
  }
</script>

<ReportsPopup {task} {addReport} on:close />
