<script lang="ts">
  import { FernColor, IconSize } from '@hcengineering/ui'

  export let value: number
  export let min: number = 0
  export let max: number = 100
  export let size: IconSize = 'small'

  export let color: string = 'var(--theme-progress-color)'
  export let greenColor: string = FernColor

  const lenghtC: number = Math.PI * 14 - 1

  $: procC = lenghtC / (max - min)
  $: dashOffset = (Math.min(value, max) - min) * procC
  $: color = value > max ? greenColor : value < max ? color : greenColor
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
