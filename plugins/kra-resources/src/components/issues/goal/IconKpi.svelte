<script lang="ts">
  import { IconSize, PlatinumColor } from '@hcengineering/ui'

  const value: number = 60
  const min: number = 0
  const max: number = 100
  export let size: IconSize = 'small'

  const color: string = PlatinumColor

  const lenghtC: number = Math.PI * 14 - 1

  $: procC = lenghtC / (max - min)
  $: dashOffset = (Math.min(value, max) - min) * procC
</script>

<svg class="svg-{size}" fill="none" viewBox="0 0 16 16">
  <circle
    cx={8}
    cy={8}
    r={7}
    class="progress-circle"
    style:stroke={'var(--theme-caption-color)'}
    style:opacity={'.15'}
    style:transform={`rotate(${-78 + ((dashOffset + 1) * 360) / (lenghtC + 1)}deg)`}
    style:stroke-dasharray={lenghtC}
    style:stroke-dashoffset={dashOffset === 0 ? 0 : dashOffset + 3}
  />
  {#if min !== max && min !== value}
    <circle
      cx={8}
      cy={8}
      r={7}
      class="progress-circle"
      style:stroke={color}
      style:opacity={dashOffset === 0 ? 0 : 1}
      style:transform={'rotate(-82deg)'}
      style:stroke-dasharray={lenghtC}
      style:stroke-dashoffset={dashOffset === 0 ? lenghtC : lenghtC - dashOffset + 1}
    />
  {/if}
</svg>

<style lang="scss">
  .progress-circle {
    stroke-width: 2px;
    stroke-linecap: round;
    transform-origin: center;
    transition:
      transform 0.6s ease 0s,
      stroke-dashoffset 0.6s ease 0s,
      stroke-dasharray 0.6s ease 0s,
      opacity 0.6s ease 0s;
  }
</style>
