<script lang="ts">
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let onClick: (ev: MouseEvent) => void = () => {}
</script>

<button class="goal-button {kind} {size}" on:click={onClick}>
  <slot />
</button>

<style lang="scss">
</style>
