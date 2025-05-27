<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import { calculateGoalCallback } from '../../../../utils/goal'

  export let ratingScale: RatingScale

  let rating: number | undefined = undefined

  $: calculateGoalCallback(ratingScale, undefined, (error: Error | null, result?: number | undefined) => {
    if (error !== null) {
      throw error
    }
    rating = result !== undefined ? result * 5 : undefined
  })
</script>

<div class="flex-row-center p-4 gap-4">
  <div class="flex-col header">
    <div class="fs-title text-xl">
      {ratingScale.name}
    </div>
    <div class="description">{ratingScale.description}</div>
  </div>
  <RatingScaleBoxes value={rating} editable={false} />
</div>

<style>
  .header {
    flex-grow: 3;
  }

  .description {
    text-wrap: balance;
  }
</style>
