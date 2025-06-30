<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { PTask, Kpi } from '@hcengineering/performance'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import ReportsPopup from '../ReportsPopup.svelte'
  import { Person } from '@hcengineering/contact'

  export let task: PTask
  export let kpi: WithLookup<Kpi>

  function addReport (event: MouseEvent): void {
    showPopup(
      KpiReportEditPopup,
      {
        space: kpi.space,
        attachedTo: kpi._id,
        assignee: task.assignee
      },
      eventToHTMLElement(event)
    )
  }
</script>

<ReportsPopup {task} {addReport} on:close />
