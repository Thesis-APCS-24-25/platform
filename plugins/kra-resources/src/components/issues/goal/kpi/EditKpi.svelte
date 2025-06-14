<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Goal, Issue, Kpi } from '@hcengineering/kra'
  import { Ref, Space } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'
  import { onMount } from 'svelte'

  export let canSave = false
  export let issue: Ref<Issue> | undefined = undefined
  export let space: Ref<Space> | undefined = undefined
  export let kpi: Kpi | undefined = undefined

  const data = {
    name: kpi?.name ?? '',
    description: kpi?.description ?? '',
    target: kpi?.target,
    unit: kpi?.unit ?? undefined
  }

  space = space ?? kpi?.space
  const client = getClient()

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit !== undefined

  export async function save (): Promise<Ref<Goal> | undefined> {
    if (canSave) {
      if (issue !== undefined && data.unit !== undefined && space !== undefined) {
        const kpiId = await client.createDoc(kra.class.Kpi, space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          reports: 0
        })
        return kpiId
      } else if (kpi !== undefined) {
        await client.update(kpi, {
          name: data.name,
          description: data.description,
          target: data.target,
          unit: data.unit
        })
        return kpi._id
      }
    }
  }

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<div class="m-1">
  <EditBox
    label={kra.string.Name}
    kind="default-large"
    fullSize
    bind:value={data.name}
    placeholder={kra.string.AddNamePlaceholder}
    focusIndex={1}
  />
</div>

<div class="m-1 flex-row-baseline items-end justify-between">
  <EditBox
    label={kra.string.Target}
    kind="default-large"
    format="number"
    maxWidth="15rem"
    bind:value={data.target}
    placeholder={kra.string.AddTargetPlaceholder}
    focusIndex={3}
  />
  {#if space !== undefined}
    <UnitBox size="large" {space} bind:value={data.unit} focusIndex={4} />
  {/if}
</div>
