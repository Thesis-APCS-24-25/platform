<script lang="ts">
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Issue, Unit } from '@hcengineering/kra'
  import { Ref } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'

  export let canSave = false
  export let issueId: Ref<Issue> | undefined = undefined

  const data = {
    name: '',
    description: '',
    target: undefined as number | undefined,
    unit: undefined as Ref<Unit> | undefined
  }

  const client = getClient()

  $: issueP = client.findOne(kra.class.Issue, {
    _id: issueId
  })

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit !== undefined

  export async function save (): Promise<void> {
    if (canSave && issueId !== undefined) {
      const issue: Issue | undefined = await client.findOne(kra.class.Issue, {
        _id: issueId
      })
      if (issue !== undefined && data.unit !== undefined) {
        const apply = client.apply()

        const kpiId = await apply.createDoc(kra.class.Kpi, issue.space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          reports: 0
        })

        await apply.updateDoc(kra.class.Issue, issue.space, issueId, {
          goal: kpiId
        })

        await apply.commit()
      }
    }
  }
</script>

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

  {#await issueP then issue}
    {#if issue !== undefined}
      <UnitBox {issue} bind:value={data.unit} focusIndex={4} />
    {/if}
  {/await}
</div>

<style>
  .target-unit {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
