<script lang="ts">
  import { Doc, FindOptions, Ref, SortingOrder } from '@hcengineering/core'
  import view from '@hcengineering/view'
  import { List, ListSelectionProvider, SelectDirection } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import { KRA, PTask, ReviewSession } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'
  import ProgressSummaryPresenter from '../progress/ProgressSummaryPresenter.svelte'
  import { Scroller } from '@hcengineering/ui'

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

  let list: List
  const listProvider = new ListSelectionProvider(
    (offset: 1 | -1 | 0, of?: Doc, dir?: SelectDirection, noScroll?: boolean) => {
      if (dir === 'vertical') {
        // Select next
        list?.select(offset, of, noScroll)
      }
    }
  )
  const selection = listProvider.selection
  let scroll: Scroller
</script>

<div class="w-full h-full py-4 clear-mins">
  <Scroller bind:this={scroll}>
    <List
      bind:this={list}
      selectedObjectIds={$selection ?? []}
      {listProvider}
      props={{
        readonly: true,
        disabled: true,
        editable: false
      }}
      createItemDialog={undefined}
      createItemLabel={undefined}
      createItemEvent={undefined}
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
          presenter: ProgressSummaryPresenter
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
      _class={performance.class.PTask}
    />
  </Scroller>
</div>
