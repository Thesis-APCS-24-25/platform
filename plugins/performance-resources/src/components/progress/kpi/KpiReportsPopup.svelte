<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { PTask, Kpi } from '@hcengineering/performance'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import ReportsPopup from '../ReportsPopup.svelte'

  export let task: PTask
  export let kpi: WithLookup<Kpi>

  const sum: number | undefined = kpi.progress

  function addReport (event: MouseEvent): void {
    showPopup(
      KpiReportEditPopup,
      {
        sum,
        task,
        kpi
      },
      eventToHTMLElement(event)
    )
  }
</script>

<ReportsPopup {task} {addReport} on:close />
