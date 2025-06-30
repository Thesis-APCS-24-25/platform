<script lang="ts">
  import { Progress } from '@hcengineering/performance'
  import ProgressCircle from '../ui/ProgressCircle.svelte'

  export let value: Progress
</script>

<ProgressCircle value={value.progress ?? 0} />
