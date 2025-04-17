<script lang="ts">
  import { Data, Ref, Space } from '@hcengineering/core'
  import { OK, Status } from '@hcengineering/platform'
  import { Card, SpaceSelector, getClient } from '@hcengineering/presentation'
  import { EditBox, Grid, Status as StatusControl } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import performance from '../../plugin'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'
  import KRASelector from '../KRASelector.svelte'
  import EmployeeSelector from '../EmployeeSelector.svelte'
  import { Contact } from '@hcengineering/contact'

  export let space: Ref<Space>

  let _space = space
  const status: Status = OK

  let selectedKRA: Ref<KRA> | undefined
  let selectedEmployee: Ref<Contact> | undefined
  let weight: number = 0

  const dispatch = createEventDispatcher()
  const client = getClient()

  let canSave: boolean
  $: canSave = selectedKRA !== undefined && selectedEmployee !== undefined

  async function createEmployeeKRA (): Promise<void> {
    if (!canSave) {
      return
    }
    const value: Data<EmployeeKRA> = {
      kra: selectedKRA as Ref<KRA>,
      employee: selectedEmployee as Ref<Contact>,
      weight
    }
    await client.createDoc(performance.class.EmployeeKRA, _space, value)
    dispatch('close')
  }
</script>

<Card
  label={performance.string.AssignKRAToEmployee}
  okAction={createEmployeeKRA}
  {canSave}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
  >
  <svelte:fragment slot="header">
    <SpaceSelector _class={performance.class.ReviewSession} label={performance.string.ReviewSessionName} bind:space={_space} />
  </svelte:fragment>
  <StatusControl slot="error" {status} />
  <Grid column={1} rowGap={1.5}>
    <KRASelector
      value={selectedKRA}
      onChange={(newKRAId) => {
        selectedKRA = newKRAId
      }}
      space={_space}
    />
    <EmployeeSelector
      value={selectedEmployee}
      onChange={(newEmployeeId) => {
        selectedEmployee = newEmployeeId
      }}
    />
    <EditBox
      bind:value={weight}
      format={'number'}
      label={performance.string.KRAWeight}
      placeholder={performance.string.KRAWeightPlaceholder}
    />
  </Grid>
</Card>
