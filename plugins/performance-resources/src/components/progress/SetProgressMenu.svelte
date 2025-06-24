<script lang="ts">
  import { Progress, PTask } from '@hcengineering/performance'
  import { Menu, Action, showPopup, eventToHTMLElement } from '@hcengineering/ui'
  import AddProgressPopup from './AddProgressPopup.svelte'
  import EditKpiPopup from './kpi/EditKpiPopup.svelte'
  import performance from '../../plugin'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'

  export let value: PTask

  const client = getClient()

  async function addProgressToTask(id: Ref<Progress>) {
    await client.update(value, {
      progress: id
    })
  }

  const actions: Action[] = [
    {
      label: performance.string.SetProgress,
      icon: performance.icon.Progress,
      inline: true,
      action: function (props: any, ev: Event): Promise<void> {
        showPopup(
          AddProgressPopup,
          {
            task: value._id,
            space: value.space,
            canChangeTask: false
          },
          'top',
          addProgressToTask
        )
        return Promise.resolve()
      }
    },
    {
      label: performance.string.SetKpi,
      icon: performance.icon.Kpi,
      action: function (props: any, ev: Event): Promise<void> {
        showPopup(
          EditKpiPopup,
          {
            issue: value._id,
            space: value.space,
            canChangeTask: false
          },
          'top',
          addProgressToTask
        )
        return Promise.resolve()
      }
    }
  ]
</script>

<Menu {actions} />
