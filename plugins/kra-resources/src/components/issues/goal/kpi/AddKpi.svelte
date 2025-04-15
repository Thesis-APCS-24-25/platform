<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler, getFocusManager } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Goal, Issue, Unit } from '@hcengineering/kra'
  import { Ref } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'
  import { onMount } from 'svelte'

  export let canSave = false
  export let issue: Ref<Issue> | Issue | undefined = undefined

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
      if (typeof issue === 'string') {
        issue = (await client.findOne(kra.class.Issue, {
          _id: issue
        })) as Issue | undefined
      }

      if (issue !== undefined && data.unit !== undefined) {
        const apply = client.apply()

        const kpiId = await apply.createDoc(kra.class.Kpi, issue.space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          reports: 0
        })

        await apply.updateDoc(kra.class.Issue, issue.space, issue._id, {
          goal: kpiId
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
  <UnitBox {issue} bind:value={data.unit} focusIndex={4} />
</div>

<style>
  .target-unit {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
