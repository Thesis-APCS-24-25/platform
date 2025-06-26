<script lang="ts">
  import { AddProgressPopup } from '@hcengineering/performance-resources'
  import { Label, Button, IconAdd, showPopup } from '@hcengineering/ui'
  import kra from '../../../plugin'
  import { Issue } from '@hcengineering/kra'
  import { getClient } from '@hcengineering/presentation'
  import performance from '@hcengineering/performance'
  import EditKpiPopup from '@hcengineering/performance-resources/src/components/progress/kpi/EditKpiPopup.svelte'

  export let issue: Issue

  const client = getClient()
</script>

<div class="empty-state flex-col flex-gap-3 items-start">
  <div class="m-3">
    <Label label={kra.string.EmptyEditProgressContent} />
  </div>
  <Button
    icon={IconAdd}
    label={performance.string.TrackCompletionLevel}
    kind="ghost"
    size="small"
    on:click={() => {
      showPopup(
        AddProgressPopup,
        {
          task: issue._id,
          space: issue.space
        },
        'top',
        async (id) => {
          if (id !== undefined) {
            await client.update(issue, {
              progress: id
            })
          }
        }
      )
    }}
  />
  <Button
    icon={IconAdd}
    label={performance.string.TrackKpi}
    kind="ghost"
    size="small"
    on:click={() => {
      showPopup(
        EditKpiPopup,
        {
          issue: issue._id,
          space: issue.space
        },
        'top',
        async (id) => {
          if (id !== undefined) {
            await client.update(issue, {
              progress: id
            })
          }
        }
      )
    }}
  />
</div>
