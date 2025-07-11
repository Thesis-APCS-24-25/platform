<script lang="ts">
  import { PerformanceReport, PerformanceReportStatus } from '@hcengineering/performance'
  import performance from '../../plugin'
  import { Icon, IconSize, tooltip } from '@hcengineering/ui'

  export let status: PerformanceReport['status'] | undefined
  export let size: IconSize = 'small'

  $: icon = status === PerformanceReportStatus.Done ? performance.icon.StatusConcluded : performance.icon.StatusDrafting
  $: label = status === PerformanceReportStatus.Done ? performance.string.Done : performance.string.WaitingForReview
</script>

<div use:tooltip={{
  label
}}>
  <Icon {icon} {size} />
</div>
