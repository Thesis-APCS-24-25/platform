<script lang="ts">
  import { Kpi } from '@hcengineering/performance'
  import ProgressBar from '../../ui/ProgressBar.svelte'

  export let value: Kpi
</script>

<ProgressBar value={value.progress ?? 0} max={value.target}/>
