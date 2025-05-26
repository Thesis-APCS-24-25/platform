<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import { calculateGoalCallback } from '../../../../utils/goal'

  export let ratingScale: RatingScale

  let rating: number | undefined = undefined

  $: calculateGoalCallback(
    ratingScale,
    undefined,
    (error: Error | null, result?: number | undefined) => {
      if (error !== null) {
        throw error
      }
      rating = result !== undefined ? result * 5 : undefined
    }
  )
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={ratingScale.name} />
    <EditBox kind="small-style" disabled={true} value={ratingScale.description} />
  </div>

  <RatingScaleBoxes value={rating} editable={false}/>

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
