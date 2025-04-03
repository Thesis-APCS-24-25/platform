<script lang="ts">
  const ratingColors = [
    'var(--theme-rating-very-poor)', // dummy value
    'var(--theme-rating-very-poor)',
    'var(--theme-rating-poor)',
    'var(--theme-rating-average)',
    'var(--theme-rating-good)',
    'var(--theme-rating-excellent)'
  ]

  export let value: number | null = null
  export let editable = true
  export let size: 'small' | 'large' = 'small'
  export let onBoxClick: ((value: number) => void) | null = null

  value = value ?? 0

  let hoveringIndex = -1
</script>

<div class="rating-container {size}">
  {#each Array(5) as _, i}
    <button
      on:pointerenter={() => {
        if (editable) {
          hoveringIndex = i
        }
      }}
      on:pointerleave={() => {
        if (editable) {
          hoveringIndex = -1
        }
      }}
      on:click={() => {
        if (editable) {
          onBoxClick?.(i + 1)
        }
      }}
      class="rating-box {size}"
      class:filled={i < (value ?? 0)}
      class:highlight={i <= hoveringIndex}
      style={i < (value ?? 0) ? `background-color: ${ratingColors[value]};` : ''}
    ></button>
  {/each}
</div>

<style lang="scss">
  .rating-container {
    display: flex;
    align-items: center;
  }

  .rating-container.small {
    gap: 0.25rem;
  }

  .rating-container.large {
    gap: 1rem;
  }

  .rating-box {
    width: 1rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    background-color: #f5f5f5;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      border 0.2s ease,
      box-shadow 0.2s ease;

    &.highlight {
      // background-color: rgba(77, 182, 255, 0.3); // Light blue tint
      border: 2.5px solid rgba(77, 182, 255, 0.8); // Sky blue border
      box-shadow: 0 0 5px rgba(77, 182, 255, 0.6);
    }
  }

  .rating-box.small {
    width: 1rem;
    height: 1.5rem;
  }

  .rating-box.large {
    width: 3rem;
    height: 2rem;
  }
</style>
