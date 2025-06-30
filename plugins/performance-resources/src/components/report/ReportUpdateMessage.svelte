<script lang="ts">
  import { DocUpdateMessage, DocAttributeUpdates } from '@hcengineering/activity'
  import { PerformanceReport } from '@hcengineering/performance'

  export let message: DocUpdateMessage
  export let value: DocAttributeUpdates
  export let object: PerformanceReport
</script>

{#if value.attrKey === 'score'}
  <div class="text-muted">
    <span class="text-nowrap">Score updated to <strong>{value.attrValue}</strong>
  </div>
{:else if value.attrKey === 'status'}
  <div class="text-muted">
    <span class="text-nowrap">{object.name}</span> status changed to <strong>{value.attrValue}</strong>
  </div>
{:else}
  <div class="text-muted">
    <span class="text-nowrap">{object.name}</span> attribute <strong>{value.attrKey}</strong> updated to
    <strong>{value.attrValue}</strong>
  </div>
{/if}
