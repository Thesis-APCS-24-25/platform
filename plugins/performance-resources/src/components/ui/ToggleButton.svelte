<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { Button, ButtonKind, ButtonShape, ButtonSize, Label, MiniToggle, Toggle } from '@hcengineering/ui'

  export let value: boolean = false
  export let label: IntlString | undefined = undefined
  export let labelParams: Record<string, any> = {}
  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'medium'
  export let shape: ButtonShape = undefined
  export let focusIndex: number = -1
</script>

<Button
  {kind}
  {size}
  {shape}
  {focusIndex}
  on:click={() => {
    value = !value
  }}
>
  <div class="flex-row-center flex-gap-2 p-2" slot="content">
    <MiniToggle bind:on={value} />
    {#if label}
      <Label params={labelParams} {label} />
    {/if}
  </div>
</Button>
