<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'

  export let ratingScale: RatingScale
</script>

<div class="flex-row-center p-4 gap-4">
  <div class="flex-col header">
    <div class="fs-title text-xl">
      {ratingScale.name}
    </div>
    <div class="description">{ratingScale.description}</div>
  </div>
  <RatingScaleBoxes value={ratingScale.progress} editable={false} />
</div>

<style>
  .header {
    flex-grow: 3;
  }

  .description {
    text-wrap: balance;
  }
</style>
