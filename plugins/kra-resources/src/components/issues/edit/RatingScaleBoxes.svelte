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
  value = value ?? 0

</script>

{#if value}
  <div class="rating-container">
    {#each Array(5) as _, i}
      <div
        class="rating-box"
        class:filled={i < (value ?? 0)}
        style={i < (value ?? 0)
          ? `background-color: ${ratingColors[value]}; border-color: ${ratingColors[value]};`
          : ''}
      ></div>
    {/each}
  </div>
{/if}

<style lang="scss">
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
