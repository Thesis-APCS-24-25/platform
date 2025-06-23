<script lang="ts">
  import { ButtonKind, ButtonSize, LabelAndProps, tooltip } from '@hcengineering/ui'

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let onClick: (ev: MouseEvent) => void = () => {}
  export let disabled: boolean | undefined = false
  export let showTooltip: LabelAndProps | undefined = undefined
</script>

<button {disabled} class="goal-button {kind} {size}" on:click={onClick} use:tooltip={showTooltip}>
  <slot />
</button>

<style lang="scss">
</style>
