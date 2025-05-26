<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import { Card } from '@hcengineering/presentation'
  import kra from '../../../../plugin'
  import EditKpi from './EditKpi.svelte'

  export let kpi: Kpi

  let canSave = false
  let editKpi: EditKpi | undefined
  async function save (): Promise<void> {
    if (editKpi !== undefined) {
      await editKpi.save()
    }
  }
</script>

<Card
  label={kra.string.EditKpi}
  okAction={save}
  okLabel={kra.string.Save}
  {canSave}
  width="small"
  on:close
>
  <EditKpi {kpi} bind:canSave bind:this={editKpi}/>
</Card>
