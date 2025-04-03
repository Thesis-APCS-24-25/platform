<script lang="ts">
  import { RatingScale } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../plugin'

  export let canSave = false
  export let issueId: string | undefined = undefined

  const data = {
    name: '',
    description: ''
  }

  export async function save() {
    if (canSave) {
      // Save logic here
      alert(`Rating Scale saved: ${data.name}, Description: ${data.description}`)
    }
  }

  $: canSave = data.name.length > 0
</script>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.name} placeholder={kra.string.AddNamePlaceholder} focusIndex={1} />
</div>

<div class="m-4">
  <EditBox
    kind="large-style"
    fullSize
    bind:value={data.description}
    placeholder={kra.string.IssueDescriptionPlaceholder}
    focusIndex={2}
  />
</div>
