<script lang="ts">
  import kra from '../../../plugin'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { AttachedData, Ref, Space } from '@hcengineering/core'
  import { EditBox, createFocusManager, FocusHandler } from '@hcengineering/ui'
  import { onMount } from 'svelte'
  import ProgressBar from '../../ui/ProgressBar.svelte'
  import ReportEditPopupBase from '../ReportEditPopupBase.svelte'
  import performance, { Kpi, ProgressReport, Unit } from '@hcengineering/performance'
  import { Person } from '@hcengineering/contact'

  export let value: ProgressReport | undefined = undefined

  // Only needed for creating new reports
  export let space: Ref<Space> | undefined = undefined
  export let attachedTo: Ref<Kpi> | undefined = undefined
  export let assignee: Ref<Person> | undefined | null = undefined

  const kpiQuery = createQuery()
  let unit: Unit | undefined = undefined
  let kpi: Kpi | undefined = undefined
  $: if (value?.attachedTo !== undefined || attachedTo !== undefined) {
    kpiQuery.query(
      performance.class.Kpi,
      { _id: (value?.attachedTo as Ref<Kpi> | undefined) ?? attachedTo },
      (res) => {
        if (res.length > 0) {
          unit = res[0].$lookup?.unit as Unit | undefined
          kpi = res[0]
          console.log('KPI:', kpi)
        } else {
          unit = undefined
        }
      },
      { limit: 1, lookup: { unit: performance.class.Unit } }
    )
  }
  const object: Partial<AttachedData<ProgressReport>> = {
    value: value?.value,
    date: value?.date,
    reportBy: value?.reportBy ?? assignee,
    note: value?.note
  }

  function validate (object: Partial<AttachedData<ProgressReport>>): AttachedData<ProgressReport> | undefined {
    const { value, date, reportBy, note } = object
    if (value === undefined || date === undefined || reportBy === undefined) {
      return undefined
    }
    return {
      value,
      date,
      reportBy,
      note: note ?? ''
    }
  }

  const client = getClient()

  async function save (): Promise<void> {
    if (value === undefined && space !== undefined && attachedTo !== undefined) {
      const validatedObject = validate(object)
      if (validatedObject === undefined) {
        return
      }
      await client.addCollection(
        performance.class.ProgressReport,
        space,
        attachedTo,
        performance.class.Kpi,
        'goal-reports',
        validatedObject
      )
      return
    }
    if (value !== undefined) {
      await client.updateCollection(
        performance.class.ProgressReport,
        value.space,
        value._id,
        value.attachedTo,
        performance.class.Kpi,
        'goal-reports',
        object
      )
    }
  }

  $: canSave =
    object.value !== undefined &&
    Number.isFinite(object.value) &&
    object.value >= 0 &&
    object.date !== undefined &&
    object.reportBy !== undefined
  const manager = createFocusManager()
  onMount(() => {
    manager.setFocus(1)
  })
</script>

<FocusHandler {manager} />

<ReportEditPopupBase bind:assignee={object.reportBy} bind:reportDate={object.date} okAction={save} {canSave} on:close>
  <svelte:fragment slot="content">
    <div class="kpi-value">
      <div>
        <span class="mr-1">{kpi?.progress ?? 0} +</span>
      </div>
      <div class="clear-mins">
        <EditBox kind="default-large" bind:value={object.value} format="number" focusIndex={1} />
      </div>
      <span class="unit">/ {kpi?.target} ({unit?.name})</span>
    </div>
    <div class="mt-3">
      <EditBox label={kra.string.Note} kind="default" bind:value={object.note} format="text" focusIndex={2} />
    </div>
    <div class="mt-4 mb-4">
      {#if kpi}
        <ProgressBar value={kpi?.progress ?? 0} max={kpi?.target} additionalValue={object.value} />
      {/if}
    </div>
  </svelte:fragment>
</ReportEditPopupBase>

<style>
  .kpi-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .unit {
    margin-left: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-style: italic;
    color: var(--gray-500);
  }
</style>
