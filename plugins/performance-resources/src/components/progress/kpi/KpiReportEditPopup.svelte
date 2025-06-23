<script lang="ts">
  import { getClient } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { PTask, Kpi, ProgressReport } from '@hcengineering/performance'
  import KpiProgressBar from './KpiProgressBar.svelte'
  import { createEventDispatcher } from 'svelte'
  import { Employee } from '@hcengineering/contact'
  import { AttachedData, Ref, Space, WithLookup } from '@hcengineering/core'
  import ReportEditPopup from './../ReportEditPopup.svelte'
  import { EditBox } from '@hcengineering/ui'

  export let task: PTask | undefined = undefined
  export let kpi: WithLookup<Kpi>
  export let sum: number

  const space: Ref<Space> | undefined = task?.space

  const kpiId = kpi._id
  const kpiClass = kpi._class
  const dispatch = createEventDispatcher()
  const client = getClient()

  let assignee: Ref<Employee> | null | undefined = task?.assignee as Ref<Employee>
  let value = undefined as number | undefined
  let reportDate: number | undefined = undefined
  let note = ''

  function getData (): AttachedData<ProgressReport> | undefined {
    if (value !== undefined && reportDate !== undefined && assignee !== undefined) {
      return {
        value,
        date: reportDate,
        reportBy: assignee,
        note
      }
    }
    return undefined
  }

  $: canSave = value !== undefined && Number.isFinite(value) && value >= 0 && space !== undefined

  async function save (): Promise<void> {
    const data = getData()
    if (canSave && data !== undefined && space !== undefined) {
      await client.addCollection(
        kra.class.ProgressReport,
        space,
        kpiId,
        kpiClass,
        'goal-reports',
        data
      )
    }
    dispatch('close')
  }
</script>

<ReportEditPopup okAction={save} {canSave} bind:assignee bind:reportDate>
  <svelte:fragment slot="header">
  </svelte:fragment>
  <svelte:fragment slot="content">
    <div class="kpi-value">
      <div>
        <span class="mr-1"> {sum} + </span>
      </div>
      <div class="clear-mins">
        <EditBox bind:value={value} format="number" placeholder={kra.string.Goal} />
      </div>
      <span class="unit">/ {kpi.target} ({kpi.$lookup?.unit?.name})</span>
    </div>
    <div class="mt-4">
      <EditBox placeholder={kra.string.Comment} bind:value={note} />
    </div>
    <div class="mt-4 mb-4">
      <KpiProgressBar value={sum} max={kpi.target} additionalValue={value} />
    </div>
  </svelte:fragment>
</ReportEditPopup>

<style>
  .kpi-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .unit {
    border: 1px solid var(--theme-secondary-color, #e2e8f0);
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-style: italic;
    color: var(--gray-500);
  }
</style>
