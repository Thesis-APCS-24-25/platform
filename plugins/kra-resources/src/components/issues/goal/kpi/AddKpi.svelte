<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Goal, Issue, Project, Unit } from '@hcengineering/kra'
  import { Ref } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'
  import { onMount } from 'svelte'

  export let canSave = false
  export let issue: Ref<Issue> | undefined = undefined
  export let space: Ref<Project>

  const data = {
    name: '',
    description: '',
    target: undefined as number | undefined,
    unit: undefined as Ref<Unit> | undefined
  }

  const client = getClient()

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit !== undefined

  export async function save (): Promise<Ref<Goal> | undefined> {
    if (canSave && issue !== undefined) {
      if (issue !== undefined && data.unit !== undefined && space !== undefined) {
        const apply = client.apply()

        const kpiId = await apply.createDoc(kra.class.Kpi, space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          reports: 0
        })
        await apply.commit()
        return kpiId
      }
    }
  }

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<div class="m-4">
  <EditBox
    kind="large-style"
    fullSize
    bind:value={data.name}
    placeholder={kra.string.AddNamePlaceholder}
    focusIndex={1}
  />
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

<div class="m-4 target-unit">
  <EditBox
    kind="large-style"
    format="number"
    maxWidth="18rem"
    bind:value={data.target}
    placeholder={kra.string.Target}
    focusIndex={3}
  />
  <UnitBox {space} bind:value={data.unit} focusIndex={4} />
</div>

<style>
  .target-unit {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
