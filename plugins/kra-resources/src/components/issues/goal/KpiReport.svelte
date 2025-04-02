<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { KpiReport } from '@hcengineering/kra'

  export let value: WithLookup<KpiReport>
</script>

{value.value}
