<script lang="ts">
  import { PerformanceReport } from '@hcengineering/performance'

  export let value: PerformanceReport | number
  export let target: number = 100
</script>

<div class="review-box flex-col items-stretch">
  <div class="value">
    <span class="value-value">{typeof value === 'object' ? value.scorePreview : value}</span>
    <span class="value-target">/ {target}</span>
  </div>
</div>

<style>
  .value {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .value-value {
    color: var(--theme-primary-color, #4c6ef5);
  }

  .value-target {
    color: var(--theme-primary-color, #4c6ef5);
  }

  .review-box {
    flex-grow: 1;
    border: 1px solid transparent;
    padding: 0.25rem;
    border-radius: 0.25rem;
    gap: 0.5rem;
    min-width: 10rem;
    color: var(--theme-content-color, #333);
  }
</style>
