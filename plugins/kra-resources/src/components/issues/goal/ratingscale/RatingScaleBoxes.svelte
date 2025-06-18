<script lang="ts">
  import { Icon } from '@hcengineering/ui'
  import kra from '@hcengineering/kra'
  import { Asset } from '@hcengineering/platform'

  const ratingColors = [
    'var(--theme-rating-very-poor)',
    'var(--theme-rating-poor)',
    'var(--theme-rating-average)',
    'var(--theme-rating-good)',
    'var(--theme-rating-excellent)'
  ]

  export let value: number | undefined = undefined
  export let editable = true
  export let size: 'small' | 'large' = 'small'
  export let onBoxClick: ((value: number) => void) | null = null

  value = value ?? 0

  let hoveringIndex = -1

  $: fillAndIcon = (index: number): [Asset, string | undefined] => {
    if (hoveringIndex !== -1) {
      if (hoveringIndex >= index) {
        return [kra.icon.StarFilled, ratingColors[hoveringIndex]]
      } else {
        return [kra.icon.Star, 'var(--theme-rating-empty)']
      }
    }
    if (value >= index + 1) {
      return [kra.icon.StarFilled, ratingColors[value]]
    }
    return [kra.icon.Star, 'var(--theme-rating-empty)']
  }
</script>

<div class="rating-container {size}">
  {#each Array(5) as _, i}
    {@const [icon, fill] = fillAndIcon(i)}
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
      class="m-0-5 rating-box {size}"
      class:filled={i < (value ?? 0)}
    >
      <Icon {icon} size="large" {fill} />
    </button>
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
