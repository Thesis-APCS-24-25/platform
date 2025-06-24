<script lang="ts">
  import { Unit } from '@hcengineering/performance'

  export let value: Unit
</script>

<div class="unit-presenter">
  <span class="symbol">{value.symbol}: </span>
  <span class="name">{value.name}</span>
</div>

<style>
  .unit-presenter {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .symbol {
    font-weight: 500;
    color: var(--theme-caption-color, #4c6ef5);
  }

  .name {
    font-size: 0.9em;
    color: var(--theme-content-color, #6b7280);
    opacity: 0.85;
  }
</style>
