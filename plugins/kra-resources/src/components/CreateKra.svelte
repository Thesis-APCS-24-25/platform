<script lang="ts">
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import { Data, Ref, generateId } from '@hcengineering/core'
  import { Kpi, Project } from '@hcengineering/kra'
  import { createEventDispatcher } from 'svelte'
  import { EditBox } from '@hcengineering/ui'
  import { createEmptyKra } from '../utils'
  import view from '@hcengineering/view'
  import kra from '../plugin'

  export let _space: Ref<Group>

  export function canClose(): boolean {
    return object.title === ''
  }

  const id: Ref<Kra> = generateId()
  const dispatch = createEventDispatcher()
  const object: Pick<Data<Kra>, 'title' | 'icon' | 'color'> = {
    title: ''
  }

  const client = getClient()

  $: canSave = object.title.trim().length > 0

  async function create(): Promise<void> {
    await createEmptyKra(client, id, _space, object)
    dispatch('close', id)
  }
</script>

<Card
  label={kra.string.CreateKra}
  okAction={create}
  {canSave}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <svelte:fragment slot="header">
    <SpaceSelector
      _class={kra.class.Group}
      label={kra.string.Group}
      bind:space={_space}
      kind={'regular'}
      size={'small'}
      iconWithEmoji={view.ids.IconWithEmoji}
      defaultIcon={kra.icon.Kra}
    />
  </svelte:fragment>

  <div class="flex-row-center clear-mins">
    <EditBox
      placeholder={kra.string.KraNamePlaceholder}
      bind:value={object.title}
      kind={'large-style'}
      autoFocus
      focusIndex={1}
    />
  </div>
</Card>
