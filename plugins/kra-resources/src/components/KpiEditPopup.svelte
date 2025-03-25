<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Card } from '@hcengineering/presentation'
  import kra from '../plugin'
  import { EditBox } from '@hcengineering/ui'

  export let value: number
  export let unit: string
  export let target: number

  export let isValueEditable: boolean = true
  export let isTargetEditable: boolean = true

  const dispatch = createEventDispatcher()

  function handleOk() {
    dispatch('close')
  }
</script>

<Card label={kra.string.Back} okAction={handleOk} canSave={true}>
  <div class="m-3 clear-mins">
    <EditBox
      label={kra.string.Value}
      focusIndex={1}
      bind:value
      kind={'large-style'}
      format="number"
      autoFocus
      fullSize
      disabled={!isValueEditable}
    />
    <EditBox
      label={kra.string.Target}
      focusIndex={2}
      bind:target
      kind={'large-style'}
      format="number"
      autoFocus
      fullSize
      disabled={!isTargetEditable}
    />
    <EditBox label={kra.string.Unit} focusIndex={3} bind:unit kind={'large-style'} format="number" autoFocus fullSize />
  </div>
</Card>
