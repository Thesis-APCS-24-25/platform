<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'

  export let ratingScale: RatingScale
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={ratingScale.name} />

    <EditBox kind="small-style" disabled={true} value={ratingScale.description} />
  </div>

  <RatingScaleBoxes value={ratingScale.value} />

</div>

<style>
  .container {
    display: flex;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  .header {
    flex-grow: 2;
  }
</style>
