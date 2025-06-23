<script lang="ts">
  import { Ref, SortingOrder, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import { List, ListSelectionProvider } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import AssignKraPopup from './AssignKRAPopup.svelte'
  import view from '@hcengineering/view'

  export let kras: KRA[]
  export let employeeKras: WithLookup<EmployeeKRA>[]
  export let space: Ref<ReviewSession>
  // export let canAssign: boolean = false

  let kraById: Map<Ref<KRA>, KRA> = new Map<Ref<KRA>, KRA>()
  $: {
    kraById = new Map(kras.map((kra) => [kra._id, kra]))
  }

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
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0) => {})
</script>

{#key kras.length}
  <List
    props={{
      type: 'link'
    }}
    createItemDialog={AssignKraPopup}
    createItemLabel={performance.string.AssignKRA}
    {listProvider}
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
        key: 'status'
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
{/key}
