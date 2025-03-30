<script lang="ts">
  import { Issue, RatingScale } from '@hcengineering/kra'
  import { EditBox, showPopup } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import RatingScaleEditPopup from './RatingScaleEditPopup.svelte'

  export let issue: Issue | undefined = undefined
  export let ratingScale: RatingScale

  function handleBoxClick(value: number): void {
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

  <RatingScaleBoxes value={ratingScale.value} onBoxClick={handleBoxClick}/>

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
