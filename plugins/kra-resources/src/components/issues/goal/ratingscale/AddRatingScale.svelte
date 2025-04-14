<script lang="ts">
  import { Goal, Issue } from '@hcengineering/kra'
  import { EditBox } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'

  export let canSave = false
  export let issue: Ref<Issue> | Issue | undefined = undefined

  const data = {
    name: '',
    description: ''
  }

  const client = getClient()

  export async function save (): Promise<Ref<Goal> | undefined> {
    if (canSave && issue !== undefined) {
      if (typeof issue === 'string') {
        issue = (await client.findOne(kra.class.Issue, {
          _id: issue
        }))
      }

      if (issue === undefined) {
        return undefined
      }

      const apply = client.apply()
      const id = await apply.createDoc(kra.class.RatingScale, issue.space, {
        name: data.name,
        description: data.description,
        reports: 0,
        unit: kra.ids.RatingScaleUnit
      })

      await apply.updateDoc(kra.class.Issue, issue.space, issue._id, {
        goal: id
      })

      await apply.commit()

      return id
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
