<script lang="ts">
  import { getCurrentAccount, Ref, SortingOrder, TypedSpace, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'
  import { List, ListSelectionProvider } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import view from '@hcengineering/view'
  import { Member } from '@hcengineering/kra-team'

  export let members: Ref<Member>[]
  export let space: Ref<TypedSpace>
  // export let canAssign: boolean = false

  const shouldWarn = (value: number | undefined): boolean => {
    return value === undefined || Math.abs(value - 1) > 0.0001
  }

  $: members = members.sort((a, b) => {
    const me = getCurrentAccount().person
    if (a === me) return -1
    if (b === me) return 1
    return 0
  })
  export let employeeKras: WithLookup<EmployeeKRA>[]
  let sums = new Map<Ref<Member>, number>()
  $: {
    sums = employeeKras.reduce((acc, employeeKra) => {
      if (employeeKra.assignee !== undefined && employeeKra.weight !== undefined) {
        const currentSum = acc.get(employeeKra.assignee) ?? 0
        acc.set(employeeKra.assignee, currentSum + employeeKra.weight)
      }
      return acc
    }, new Map<Ref<Member>, number>())
  }
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0) => {})
</script>

<List
  {listProvider}
  config={[
    {
      key: 'kra',
      props: {
        shrink: 0
      }
    },
    {
      key: '',
      presenter: view.component.GrowPresenter
    },
    {
      key: 'comments',
      displayProps: {
        key: 'comments'
      }
    },
    {
      key: '',
      presenter: KraWeightEditorWithPopup,
      // props: {
      //   readonly: !canAssign
      // },
      displayProps: {
        key: 'weight',
        dividerBefore: true,
        fixed: 'right',
        align: 'right'
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
    groupBy: ['assignee'],
    orderBy: ['kra', SortingOrder.Ascending]
  }}
  _class={performance.class.EmployeeKRA}
/>
