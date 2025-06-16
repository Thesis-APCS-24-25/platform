<script lang="ts">
  import { Kpi } from '@hcengineering/kra'
  import { Icon } from '@hcengineering/ui'
  import IconRatingScale from '../IconRatingScale.svelte'

  export let value: Kpi
</script>

<div class="flex-row-center flex-gap-2">
  <Icon icon={IconRatingScale} size="small" />
  <span>
    {value.name}
  </span>
</div>
