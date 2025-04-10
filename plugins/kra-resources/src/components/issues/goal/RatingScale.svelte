<script lang="ts">
  import { Issue, RatingScale } from '@hcengineering/kra'
  import { EditBox, showPopup } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import RatingScaleEditPopup from './ratingscale/RatingScaleEditPopup.svelte'
  import { calculateGoalCallback } from '../../../utils/goal'

  export let issue: Issue
  export let ratingScale: RatingScale

  let rating: number | undefined = undefined

  $: calculateGoalCallback(
    ratingScale,
    undefined,
    (error: Error | null, result?: number | undefined) => {
      if (error !== null) {
        alert(error)
      }
      rating = result
    }
  )

  function handleBoxClick (value: number): void {
    showPopup(RatingScaleEditPopup, {
      issue,
      ratingScale,
      value
    })
  }
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={ratingScale.name} />

    <EditBox kind="small-style" disabled={true} value={ratingScale.description} />
  </div>

  <RatingScaleBoxes value={rating} onBoxClick={handleBoxClick}/>

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
