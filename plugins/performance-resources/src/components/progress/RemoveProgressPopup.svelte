<script lang="ts">
  import { MessageBox, getClient } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { PTask } from '@hcengineering/performance'

  export let object: PTask
  console.log('RemoveProgressPopup', object)

  const client = getClient()
  const action = async (): Promise<void> => {
    const ops = client.apply()
    if (object.progress == null) {
      return
    }
    await ops.removeDoc(performance.class.Progress, object.space, object.progress)
    await ops.update(object, {
      progress: null
    })
    await ops.commit()
  }
</script>

<MessageBox
  label={performance.string.RemoveProgressDialogTitle}
  message={performance.string.RemoveProgressDialogMessage}
  {action}
  dangerous
  on:close
/>
