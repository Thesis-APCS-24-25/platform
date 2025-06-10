<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { Issue } from '@hcengineering/kra'
  import { KRA } from '@hcengineering/performance'
  import { KRAEditor } from '@hcengineering/performance-resources'
  import { getClient } from '@hcengineering/presentation'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'

  export let value: WithLookup<Issue>
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'small'
  export let width: string | undefined = undefined

  const client = getClient()

  async function handleChange (newValue: Ref<KRA>): Promise<void> {
    await client.update(value, { kra: newValue })
  }
</script>

<KRAEditor object={value} value={value.kra} {readonly} {kind} {size} {width} onChange={handleChange} />
