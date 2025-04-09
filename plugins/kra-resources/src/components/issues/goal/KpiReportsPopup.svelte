<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Issue, Kpi, Report } from '@hcengineering/kra'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import ReportsPopup from './ReportsPopup.svelte'
  import { calculateKpiResult, getReports } from '../../../utils/goal'

  export let issue: Issue
  export let sum: number | undefined = undefined
  export let kpi: WithLookup<Kpi>

  let reports: Report[] = []
  $: getReports(kpi, (res) => {
    reports = res
  })
  $: if (sum === undefined) {
    sum = calculateKpiResult(reports)
  }

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

<ReportsPopup
  {issue}
  {addReport}
/>
