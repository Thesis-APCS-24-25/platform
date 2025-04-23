<script lang="ts">
  import { IntlString, getEmbeddedLabel } from '@hcengineering/platform'
  import { NumberEditor } from '@hcengineering/view-resources'
  export let value: number | undefined
  export let placeholder: IntlString = getEmbeddedLabel(' ')
  export let kind: 'no-border' | 'link' | 'button' = 'link'
  export let showPercent: boolean = false
  export let readonly = false
  export let onChange: ((value: number | undefined) => void) | undefined = undefined
</script>

{#if onChange !== undefined && !readonly}
  <NumberEditor {onChange} {value} {placeholder} {kind} />
{:else}
  <span class="fs-bold text-md">
    {value}
  </span>
  {#if showPercent}
    %
  {/if}
{/if}
