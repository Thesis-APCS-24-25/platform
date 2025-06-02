<script lang="ts">
  import { Unit } from '@hcengineering/kra'
  import { NumberPresenter } from '@hcengineering/view-resources'

  export let value: number
  export let unit: Unit
</script>

{#if unit.prefix}
  <span class="caption-color overflow-label">
    {unit.symbol}
  </span>
{/if}
<span class="caption-color overflow-label"><NumberPresenter {value} /></span>

{#if !unit.prefix}
  <span class="caption-color overflow-label">
    {unit.symbol}
  </span>
{/if}
