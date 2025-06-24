<script lang="ts">
  import performance, { Progress, ProgressReport } from '@hcengineering/performance'
  import ReportEditPopupBase from './ReportEditPopupBase.svelte'
  import { AttachedData, Ref, Space } from '@hcengineering/core'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { onMount } from 'svelte'
  import { Person } from '@hcengineering/contact'

  export let value: ProgressReport | undefined = undefined

  // Only needed for creating new reports
  export let space: Ref<Space> | undefined = undefined
  export let attachedTo: Ref<Progress> | undefined = undefined
  export let assignee: Ref<Person> | undefined = undefined

  const object: Partial<AttachedData<ProgressReport>> = {
    date: value?.date,
    reportBy: value?.reportBy ?? assignee,
    value: value?.value,
    note: value?.note
  }

  function validate (object: Partial<AttachedData<ProgressReport>>): AttachedData<ProgressReport> | undefined {
    const { date, reportBy, value, note } = object
    if (date === undefined || reportBy === undefined || value === undefined) {
      return undefined
    }
    return {
      date,
      reportBy,
      value,
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
        performance.class.Progress,
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
        performance.class.Progress,
        'goal-reports',
        object
      )
    }
  }

  $: canSave = object.reportBy !== undefined && object.date !== undefined && object.value !== undefined
  const manager = createFocusManager()
  onMount(() => {
    manager.setFocus(1)
  })
</script>

<FocusHandler {manager} />

<ReportEditPopupBase bind:assignee={object.reportBy} bind:reportDate={object.date} okAction={save} {canSave} on:close>
  <svelte:fragment slot="content">
    <EditBox label={kra.string.Value} kind="default-large" bind:value={object.value} format="number" focusIndex={1} />
    <div class="mt-3">
      <EditBox label={kra.string.Note} kind="default" bind:value={object.note} format="text" focusIndex={2} />
    </div>
  </svelte:fragment>
</ReportEditPopupBase>
