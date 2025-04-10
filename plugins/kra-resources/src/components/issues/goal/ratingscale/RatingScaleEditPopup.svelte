<script lang="ts">
  import ReportEditPopup from '../ReportEditPopup.svelte'
  import { EditBox } from '@hcengineering/ui'
  import { AttachedData, Ref } from '@hcengineering/core'
  import kra from '../../../../plugin'
  import { Employee } from '@hcengineering/contact'
  import RatingScaleBoxes from '../RatingScaleBoxes.svelte'
  import { getClient } from '@hcengineering/presentation'
  import { Issue, RatingScale, Report } from '@hcengineering/kra'

  export let issue: Issue
  export let ratingScale: RatingScale
  export let value: number | undefined = undefined
  export let note: string = ''

  let assignee: Ref<Employee> | null | undefined = issue.assignee as Ref<Employee>
  let reportDate: number

  const client = getClient()
  function getReport (): AttachedData<Report> | undefined {
    if (value === undefined) {
      return undefined
    }
    return {
      value,
      date: reportDate,
      employee: assignee ?? null,
      note
    }
  }

  async function save (): Promise<void> {
    const report = getReport()
    if (report === undefined) {
      return
    }
    await client.addCollection(kra.class.Report, issue.space, ratingScale._id, ratingScale._class, 'goal-reports', report)
  }

  $: canSave = value !== undefined && Number.isFinite(value) && value >= 0
</script>

<ReportEditPopup okAction={save} {canSave} bind:assignee bind:reportDate on:close>
  <svelte:fragment slot="header"></svelte:fragment>
  <svelte:fragment slot="content">
    <div class="kpi-value">
      <div class="mt-4">
        <EditBox placeholder={kra.string.Comment} bind:value={note} />
      </div>
      <div class="mt-4 mb-4">
        <RatingScaleBoxes {value} onBoxClick={v => (value = v)} />
      </div>
    </div></svelte:fragment
  >
</ReportEditPopup>
