<script lang="ts">
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Issue } from '@hcengineering/kra'
  import { Ref } from '@hcengineering/core'

  export let canSave = false
  export let issueId: Ref<Issue> | undefined = undefined

  const data = {
    name: '',
    description: '',
    target: undefined as number | undefined,
    unit: ''
  }

  const client = getClient()

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit.length > 0

  export async function save (): Promise<void> {
    if (canSave && issueId !== undefined) {
      const issue: Issue | undefined = await client.findOne(kra.class.Issue, {
        _id: issueId
      })
      if (issue === undefined) {
        return
      }
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
</script>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.name} placeholder={kra.string.AddNamePlaceholder} focusIndex={1} />
</div>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.description} placeholder={kra.string.IssueDescriptionPlaceholder} focusIndex={1} />
</div>

<div class="m-4">
  <EditBox
    kind="large-style"
    format="number"
    fullSize
    bind:value={data.target}
    placeholder={kra.string.Target}
    focusIndex={2}
  />
</div>

<div class="m-4">
  <EditBox kind="large-style" fullSize bind:value={data.unit} placeholder={kra.string.Unit} focusIndex={3} />
</div>
