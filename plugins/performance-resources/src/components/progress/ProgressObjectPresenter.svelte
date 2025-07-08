<script lang="ts">
  import { Progress } from '@hcengineering/performance'
  import performance from '../../plugin'
  import { Label } from '@hcengineering/ui'

  export let value: Progress
  $: unnamed = value?.name === undefined || value?.name.trim() === ''
</script>

{#if unnamed}
  <Label label={performance.string.UnnamedProgress}/>
{:else}
  <div>{value.name}</div>
{/if}
