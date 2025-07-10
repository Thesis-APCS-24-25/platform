<script lang="ts">
  import performance, { Progress, ProgressReport } from '@hcengineering/performance'
  import ReportEditPopupBase from './ReportEditPopupBase.svelte'
  import { AttachedData, Ref, Space } from '@hcengineering/core'
  import { createFocusManager, EditBox, FocusHandler, Label } from '@hcengineering/ui'
  import kra from '../../plugin'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { onMount } from 'svelte'
  import { Person } from '@hcengineering/contact'
  import ProgressBar from '../ui/ProgressBar.svelte'
  import { StyledTextBox } from '@hcengineering/text-editor-resources'

  export let value: ProgressReport | undefined = undefined

  // Only needed for creating new reports
  export let space: Ref<Space> | undefined = undefined
  export let attachedTo: Ref<Progress> | undefined = undefined
  export let assignee: Ref<Person> | undefined = undefined

  const query = createQuery()
  let progress: Progress | undefined = undefined
  $: if (value?.attachedTo !== undefined || attachedTo !== undefined) {
    query.query(
      performance.class.Progress,
      { _id: value?.attachedTo ?? attachedTo },
      (res) => {
        if (res.length > 0) {
          progress = res[0]
        } else {
          progress = undefined
        }
      },
      { limit: 1 }
    )
  }

  const object: Partial<AttachedData<ProgressReport>> = {
    date: value?.date,
    reportBy: value?.reportBy ?? assignee,
    value: value?.value,
    note: value?.note
  }

  function validate(object: Partial<AttachedData<ProgressReport>>): AttachedData<ProgressReport> | undefined {
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

  async function save(): Promise<void> {
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

  $: canSave =
    object.reportBy !== undefined &&
    object.date !== undefined &&
    object.value !== undefined &&
    progress !== undefined &&
    (progress?.progress ?? 0) + object.value <= 100
  const manager = createFocusManager()
  onMount(() => {
    manager.setFocus(1)
  })
</script>

<FocusHandler {manager} />

<ReportEditPopupBase bind:assignee={object.reportBy} bind:reportDate={object.date} okAction={save} {canSave} on:close>
  <svelte:fragment slot="content">
    <EditBox
      placeholder={kra.string.AddNumberPlaceholder}
      label={kra.string.Value}
      kind="default-large"
      bind:value={object.value}
      format="number"
      focusIndex={1}
    />
    <div class="mt-3">
      <!-- <EditBox label={kra.string.Note} kind="default" bind:value={object.note} format="text" focusIndex={2} /> -->
      <span class="font-medium-12">
        <Label label={kra.string.Note} />
      </span>
      <StyledTextBox
        kind="emphasized"
        content={object.note ?? ''}
        alwaysEdit
        enableBackReferences={true}
        on:value={(e) => {
          object.note = e.detail ?? ''
        }}
      />
    </div>
    {#if progress !== undefined}
      {@const progressSum = (progress?.progress ?? 0) + (object.value ?? 0) - (value?.value ?? 0)}
      <div class="mt-3">
        <div class="flex-row-center flex-gap-2">
          {#if object.value !== undefined}
            <ProgressBar value={progress?.progress ?? 0} additionalValue={object.value - (value?.value ?? 0)} />
          {:else}
            <ProgressBar value={progress?.progress ?? 0} />
          {/if}
          <span class:warn-overflow={progressSum > 100}>{progressSum}%</span>
        </div>
      </div>
    {/if}
  </svelte:fragment>
</ReportEditPopupBase>

<style>
  .warn-overflow {
    color: var(--theme-warning-color);
  }
</style>
