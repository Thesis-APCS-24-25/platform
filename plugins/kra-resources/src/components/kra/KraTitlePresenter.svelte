<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { getEmbeddedLabel } from '@hcengineering/platform'
  import type { Kra } from '@hcengineering/kra'
  import { tooltip } from '@hcengineering/ui'

  export let value: WithLookup<Kra> | undefined
  export let noSelect: boolean = true
</script>

{#if value}
  <span class="overflow-label" class:select-text={!noSelect} use:tooltip={{ label: getEmbeddedLabel(value.title) }}>
    {value.title}
  </span>
{/if}
