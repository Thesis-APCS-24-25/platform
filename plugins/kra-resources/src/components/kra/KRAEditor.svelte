<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { Issue } from '@hcengineering/kra'
  import performance, { KRA, WithKRA } from '@hcengineering/performance'
  import { KRAEditor } from '@hcengineering/performance-resources'
  import { getClient } from '@hcengineering/presentation'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { Task } from '@hcengineering/task'

  export let value: WithLookup<Issue>
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'small'
  export let width: string | undefined = undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()

  $: kra = hierarchy.as(value as Task, performance.mixin.WithKRA).kra

  async function handleChange (newValue: Ref<KRA> | undefined): Promise<void> {
    if (newValue === undefined || newValue === performance.ids.NoKRARef || newValue === '') {
      return
    }
    await client.updateMixin<Task, WithKRA>(value._id, value._class, value.space, performance.mixin.WithKRA, {
      kra: newValue
    })
  }
</script>

<KRAEditor object={value} value={kra} {readonly} {kind} {size} {width} onChange={handleChange} />
