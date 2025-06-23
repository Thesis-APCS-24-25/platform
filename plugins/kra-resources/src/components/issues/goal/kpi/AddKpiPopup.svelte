<script lang="ts">

  let canSave = false
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
