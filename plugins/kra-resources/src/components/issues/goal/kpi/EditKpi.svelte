<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import { Card, getClient } from '@hcengineering/presentation'
  import kra from '../../../../plugin'
  import { createEventDispatcher } from 'svelte'
  import UnitBox from '../unit/UnitBox.svelte'

  export let kpi: Kpi

  const data = {
    name: kpi.name,
    description: kpi.description,
    target: kpi.target,
    unit: kpi.unit
  }

  const focusManager = createFocusManager()
  const dispatch = createEventDispatcher()

  async function save (): Promise<void> {
    if (
      data.name === kpi.name &&
      data.description === kpi.description &&
      data.target === kpi.target &&
      data.unit === kpi.unit
    ) {
      return
    }

    const client = getClient()
    await client.update(kpi, {
      name: data.name,
      description: data.description,
      target: data.target,
      unit: data.unit
    })

    dispatch('close')
  }

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit !== undefined
</script>

<Card
  label={kra.string.EditKpi}
  okAction={save}
  okLabel={kra.string.Save}
  {canSave}
  width="medium"
  on:close={() => {
    dispatch('close')
  }}
>
  <FocusHandler manager={focusManager} />

  <div class="m-4">
    <EditBox
      kind="large-style"
      fullSize
      bind:value={data.name}
      placeholder={kra.string.AddNamePlaceholder}
      focusIndex={1}
    />
  </div>

  <div class="m-4">
    <EditBox
      kind="large-style"
      fullSize
      bind:value={data.description}
      placeholder={kra.string.IssueDescriptionPlaceholder}
      focusIndex={2}
    />
  </div>

  <div class="m-4 target-unit">
    <EditBox
      kind="large-style"
      format="number"
      maxWidth="18rem"
      bind:value={data.target}
      placeholder={kra.string.Target}
      focusIndex={3}
    />
    <UnitBox space={kpi.space} bind:value={data.unit} focusIndex={4} />
  </div>
</Card>

<style>
  .target-unit {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
