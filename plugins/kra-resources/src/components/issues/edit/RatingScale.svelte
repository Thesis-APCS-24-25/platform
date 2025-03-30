<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'

  export let ratingScale: RatingScale

  // Array of colors from negative (red) to positive (green)
  const ratingColors = [
    'var(--theme-rating-very-poor)',
    'var(--theme-rating-very-poor)',
    'var(--theme-rating-poor)',
    'var(--theme-rating-average)',
    'var(--theme-rating-good)',
    'var(--theme-rating-excellent)'
  ]

  const colorI = ratingScale.value ?? 0
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={ratingScale.name} />

    <EditBox kind="small-style" disabled={true} value={ratingScale.description} />
  </div>

  <div class="rating-container">
    {#each Array(5) as _, i}
      <div
        class="rating-box"
        class:filled={i < (ratingScale.value ?? 0)}
        style={i < (ratingScale.value ?? 0) ? `background-color: ${ratingColors[colorI]}; border-color: ${ratingColors[colorI]};` : ''}
      ></div>
    {/each}
  </div>
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

  .rating-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rating-box {
    width: 1rem;
    height: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background-color: #f5f5f5;
    transition: all 0.2s ease-in-out;
  }

  .rating-box.filled {
    border-color: transparent;
  }
</style>
