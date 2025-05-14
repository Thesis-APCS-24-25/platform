<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import KraAssigneeBoxList from './KRAAssigneeBoxList.svelte'
  import { KRA } from '@hcengineering/performance'

  export let value: WithLookup<KRA>

  const { space, _id: kra } = value
</script>

<KraAssigneeBoxList size="small" {space} {kra} />
