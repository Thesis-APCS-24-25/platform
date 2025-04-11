<script lang="ts">
  import { Issue } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'

  export let canSave = false
  export let issueId: Ref<Issue> | undefined = undefined

  const data = {
    name: '',
    description: ''
  }

  const client = getClient()

  export async function save () {
    if (canSave && issueId !== undefined) {
      const issue: Issue | undefined = await client.findOne(kra.class.Issue, {
        _id: issueId
      })
      if (issue === undefined) {
        return
      }
      const apply = client.apply()
      const kpiId = await apply.createDoc(kra.class.RatingScale, issue.space, {
        name: data.name,
        description: data.description,
        reports: 0,
        unit: kra.ids.RatingScaleUnit
      })

      await apply.updateDoc(kra.class.Issue, issue.space, issueId, {
        goal: kpiId
      })

      await apply.commit()
    }
  }

  $: canSave = data.name.length > 0
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
