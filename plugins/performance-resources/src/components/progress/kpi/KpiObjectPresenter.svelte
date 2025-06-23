<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import { Icon } from '@hcengineering/ui'
  import IconKpi from '../IconKpi.svelte'

  export let value: Kpi
</script>

<div class="flex-row-center flex-gap-2">
  <Icon icon={IconKpi} size="small" />
  <span>
    {value.name}
  </span>
</div>
