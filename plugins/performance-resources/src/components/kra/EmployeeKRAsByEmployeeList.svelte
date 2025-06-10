<script lang="ts">
  import { checkPermission, getCurrentAccount, Ref, SortingOrder, TypedSpace, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'
  import GroupedList from '../ui/GroupedList.svelte'
  import { PersonAccount } from '@hcengineering/contact'
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { FixedColumn, List, ListSelectionProvider } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import { Icon, tooltip } from '@hcengineering/ui'
  import performance from '../../plugin'
  import view from '@hcengineering/view'
  import AssignKraPopup from './AssignKRAPopup.svelte'

  export let employees: Ref<PersonAccount>[]
  export let space: Ref<TypedSpace>
  export let canAssign: boolean = false

  const shouldWarn = (value: number | undefined): boolean => {
    return value === undefined || Math.abs(value - 1) > 0.0001
  }

  $: employees = employees.sort((a, b) => {
    const me = getCurrentAccount()
    if (a === me._id) return -1
    if (b === me._id) return 1
    return 0
  })
  export let employeeKras: WithLookup<EmployeeKRA>[]
  let sums = new Map<Ref<PersonAccount>, number>()
  $: {
    sums = employeeKras.reduce((acc, employeeKra) => {
      if (employeeKra.employee !== undefined && employeeKra.weight !== undefined) {
        const currentSum = acc.get(employeeKra.employee) ?? 0
        acc.set(employeeKra.employee, currentSum + employeeKra.weight)
      }
      return acc
    }, new Map<Ref<PersonAccount>, number>())
  }
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0) => {})
</script>

<List
  {listProvider}
  config={[
    {
      key: 'kra',
      props: {
        shrink: 1
      }
    },
    {
      key: '',
      presenter: view.component.GrowPresenter
    },
    {
      key: '',
      presenter: KraWeightEditorWithPopup,
      props: {
        readonly: !canAssign
      },
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
    groupBy: ['employee'],
    orderBy: ['kra', SortingOrder.Ascending]
  }}
  _class={performance.class.EmployeeKRA}
/>
