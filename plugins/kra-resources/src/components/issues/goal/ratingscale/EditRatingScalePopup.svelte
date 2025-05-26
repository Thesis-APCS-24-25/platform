<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import kra from '../../../../plugin'
  import { Card } from '@hcengineering/presentation'
  import EditRatingScale from './EditRatingScale.svelte'

  export let ratingScale: RatingScale

  let editRatingScale: EditRatingScale | undefined = undefined
  let canSave = false

  async function save (): Promise<void> {
    if (editRatingScale !== undefined) {
      await editRatingScale.save()
    }
  }
</script>

<Card label={kra.string.EditRatingScale} okAction={save} okLabel={kra.string.Save} {canSave} width="medium" on:close>
  <EditRatingScale bind:this={editRatingScale} {ratingScale} bind:canSave />
</Card>
