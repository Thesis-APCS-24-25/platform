<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import performance from '../../../plugin'
  import ToggleWithLabel from '@hcengineering/ui/src/components/ToggleWithLabel.svelte'
  import { Project } from '@hcengineering/task'
  import { createEventDispatcher } from 'svelte'
  import { Ref } from '@hcengineering/core'

  export let space: Ref<Project> | undefined

  const data = {
    name: '',
    description: '',
    symbol: '',
    prefix: false
  }

  const client = getClient()

  $: canSave = data.name.length > 0

  const dispatch = createEventDispatcher()

  async function handleCreate(): Promise<void> {
    if (!canSave) {
      return
    }

    if (space === undefined) {
      return
    }

    await client.createDoc(performance.class.Unit, space, {
      name: data.name,
      symbol: data.symbol,
      prefix: data.prefix
    })

    dispatch('close')
  }

  const manager = createFocusManager()
  manager.setFocus(1)
</script>

<FocusHandler {manager} />

<Card label={performance.string.AddUnit} okAction={handleCreate} width="small" {canSave} on:close>
  <EditBox
    bind:value={data.name}
    kind="large-style"
    placeholder={performance.string.AddNamePlaceholder}
    focusIndex={1}
  />

  <div class="sympol">
    <EditBox
      bind:value={data.symbol}
      kind="editbox"
      placeholder={performance.string.AddSymbolPlaceholder}
      focusIndex={2}
    />
  </div>
  <div class="prefix">
    <ToggleWithLabel bind:on={data.prefix} label={performance.string.Prefix} />
  </div>
</Card>

<style>
  .sympol {
    margin-top: 1rem;
    margin-left: 1rem;
  }

  .prefix {
    margin-top: 1rem;
    margin-left: 1rem;
    width: fit-content;
  }
</style>
