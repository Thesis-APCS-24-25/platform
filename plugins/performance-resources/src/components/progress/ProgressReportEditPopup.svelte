<script lang="ts">
  import performance, { Kpi, Progress, ProgressReport } from '@hcengineering/performance'
  import { Class, Ref, Space } from '@hcengineering/core'
  import { Person } from '@hcengineering/contact'
  import KpiReportEditPopup from './kpi/KpiReportEditPopup.svelte'
  import BaseProgressReportEditPopup from './BaseProgressReportEditPopup.svelte'

  export let value: ProgressReport | undefined = undefined

  // Only needed for creating new reports
  export let space: Ref<Space> | undefined = undefined
  export let attachedToClass: Ref<Class<Progress>> = performance.class.Progress
  export let attachedTo: Ref<Progress> | undefined = undefined
  export let assignee: Ref<Person> | undefined = undefined

  const asKpiAttachedTo = (): Ref<Kpi> => {
    return attachedTo as Ref<Kpi>
  }
</script>

{#if attachedToClass === performance.class.Kpi}
  <KpiReportEditPopup {value} {space} attachedTo={asKpiAttachedTo()} {assignee} />
{:else}
  <BaseProgressReportEditPopup {value} {space} {attachedTo} {assignee} />
{/if}
