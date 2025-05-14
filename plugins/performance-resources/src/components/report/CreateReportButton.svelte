<script lang="ts">
  import { Button, IconAdd, showPopup } from '@hcengineering/ui'

  import performance from '../../plugin'
  import CreateReport from './CreateReport.svelte'

  const handleClick = async (): Promise<void> => {
    showPopup(CreateReport, 'top')
  }
</script>

<Button
  icon={IconAdd}
  justify={'left'}
  kind={'primary'}
  label={performance.string.CreateReport}
  on:click={handleClick}
/>
