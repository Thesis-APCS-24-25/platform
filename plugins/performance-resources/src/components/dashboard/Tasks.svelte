<script lang="ts">
  import { FindOptions, Ref, SortingOrder } from '@hcengineering/core'
  import view from '@hcengineering/view'
  import { ListView } from '@hcengineering/view-resources'
  import ProgressPresenter from '../kra/ProgressPresenter.svelte'
  import performance from '../../plugin'
  import { KRA, PTask, ReviewSession } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'

  export let space: Ref<ReviewSession>

  let assignedKRAs: Ref<KRA>[] = []
  const assignedKRAsQuery = createQuery()
  $: assignedKRAsQuery.query(
    performance.class.EmployeeKRA,
    {
      space
    },
    (res) => {
      if (res !== undefined) {
        const kraSet = new Set(res.map((item) => item.kra))
        assignedKRAs = Array.from(kraSet)
      }
    }
  )

  const options: FindOptions<PTask> = {
    lookup: {
      kra: performance.class.KRA
    }
  }
</script>

<div class="w-full h-full py-4 clear-mins">
  <ListView
    props={{
      readonly: true,
      disabled: true,
      editable: false
    }}
    createItemDialog={undefined}
    createItemLabel={undefined}
    createItemEvent={undefined}
    viewlet={{
      viewOptions: [
        {
          key: 'shouldShowAll',
          type: 'toggle',
          defaultValue: true,
          actionTarget: 'category',
          action: performance.function.ShowEmptyGroups,
          label: view.string.View
        }
      ]
    }}
    config={[
      '',
      {
        key: 'title'
      },
      {
        key: '',
        presenter: view.component.GrowPresenter
      },
      {
        key: '',
        presenter: ProgressPresenter
      }
    ]}
    configurations={undefined}
    query={{
      kra: { $in: assignedKRAs }
    }}
    {options}
    viewOptionsConfig={[
      {
        key: 'shouldShowAll',
        type: 'toggle',
        defaultValue: true,
        actionTarget: 'category',
        action: performance.function.ShowEmptyGroups,
        label: view.string.View
      }
    ]}
    viewOptions={{
      groupBy: ['assignee', 'kra'],
      orderBy: ['assignee', SortingOrder.Ascending]
    }}
    _class={ performance.class.PTask}
  />
</div>
