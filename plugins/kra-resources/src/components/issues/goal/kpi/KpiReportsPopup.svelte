<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Issue, Kpi } from '@hcengineering/kra'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import ReportsPopup from '../ReportsPopup.svelte'

  export let issue: Issue
  export let sum: number
  export let kpi: WithLookup<Kpi>

  function addReport (event: MouseEvent): void {
    showPopup(
      KpiReportEditPopup,
      {
        sum,
        issue,
        kpi
      },
      eventToHTMLElement(event)
    )
  }
</script>

<ReportsPopup {issue} {addReport} on:close></ReportsPopup>
