<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Issue, Kpi } from '@hcengineering/kra'
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import { getKpiReports } from '../../../utils/goal'
  import ReportsPopup from './ReportsPopup.svelte'

  export let issue: Issue
  export let sum: number | undefined = undefined
  export let kpi: WithLookup<Kpi>

  $: if (sum === undefined) {
    getKpiReports(kpi, (res) => {
      sum = res.reduce((acc, curr) => acc + curr.value, 0)
    })
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
