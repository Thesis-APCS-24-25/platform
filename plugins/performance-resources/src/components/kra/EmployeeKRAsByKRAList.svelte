<script lang="ts">
  import { Doc, Ref, SortingOrder, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import { List, ListSelectionProvider, ListView, SelectDirection } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import view from '@hcengineering/view'
  import { Scroller } from '@hcengineering/ui'

  export let kras: KRA[]
  export let employeeKras: WithLookup<EmployeeKRA>[]
  export let space: Ref<ReviewSession>
  export let allowEditKRAStatus: boolean = true
  // export let canAssign: boolean = false

  // let kraById: Map<Ref<KRA>, KRA> = new Map<Ref<KRA>, KRA>()
  // $: {
  //   kraById = new Map(kras.map((kra) => [kra._id, kra]))
  // }

  let mapping = new Map<Ref<KRA>, WithLookup<EmployeeKRA>[]>()
  $: {
    mapping = new Map<Ref<KRA>, WithLookup<EmployeeKRA>[]>()
    for (const employeeKra of employeeKras) {
      if (employeeKra.kra !== undefined) {
        if (mapping.get(employeeKra.kra) === undefined) {
          mapping.set(employeeKra.kra, [])
        }
        mapping.get(employeeKra.kra)?.push(employeeKra)
      }
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

{#key kras.length}
  <Scroller bind:this={scroll}>
    <List
      bind:this={list}
      selectedObjectIds={$selection ?? []}
      {listProvider}
      props={{
        type: 'link'
      }}
      createItemDialog={performance.component.AssignKraPopup}
      createItemLabel={performance.string.AssignKRA}
      config={[
        {
          key: 'assignee',
          props: {
            disabled: true
          }
        },
        {
          key: '',
          presenter: view.component.GrowPresenter
        },
        { key: 'comments', displayProps: { key: 'comments' } },
        {
          key: 'status',
          props: {
            disabled: !allowEditKRAStatus
          }
        },
        {
          key: '',
          presenter: KraWeightEditorWithPopup,
          displayProps: {
            key: 'weight',
            optional: false,
            dividerBefore: true,
            fixed: 'right'
          }
        }
      ]}
      configurations={undefined}
      createItemEvent={undefined}
      query={{
        space
      }}
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
        groupBy: ['kra'],
        orderBy: ['kra', SortingOrder.Ascending]
      }}
      _class={performance.class.EmployeeKRA}
    />
  </Scroller>
{/key}
