<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../plugin'

  export let canSave = false

  const data = {
    name: '',
    target: undefined,
    unit: ''
  }

  $: canSave = data.name.length > 0 && data.target !== undefined && data.unit.length > 0

</script>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.name} placeholder={kra.string.Name} focusIndex={1} />
</div>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.target} placeholder={kra.string.Target} focusIndex={2} />
</div>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.unit} placeholder={kra.string.Unit} focusIndex={3} />
</div>
