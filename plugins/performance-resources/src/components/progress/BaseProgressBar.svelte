<script lang="ts">
  import { Progress } from '@hcengineering/performance'
  import ProgressBar from '../ui/ProgressBar.svelte'
  export let value: Progress
</script>

<ProgressBar value={value.progress ?? 0} max={100}/>
