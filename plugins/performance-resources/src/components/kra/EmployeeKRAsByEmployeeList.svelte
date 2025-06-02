<script lang="ts">
  import { checkPermission, getCurrentAccount, Ref, TypedSpace, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'
  import GroupedList from '../ui/GroupedList.svelte'
  import { PersonAccount } from '@hcengineering/contact'
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { FixedColumn } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import { Icon } from '@hcengineering/ui'
  import performance from '../../plugin'
  import kraTeam from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'

  export let employees: Ref<PersonAccount>[]
  export let space: Ref<TypedSpace>
  export let canAssign: boolean = false

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
</script>

<GroupedList categories={employees} items={employeeKras} key="employee">
  <svelte:fragment slot="header" let:category>
    <div class="flex-row-center flex-grow flex-gap-3" style:color={'inherit'}>
      <FixedColumn key="person" justify="left">
        <PersonAccountRefPresenter value={category} />
      </FixedColumn>
      <FixedColumn key="total-kra" justify="left">
        <div class="flex-row-center flex-gap-1 total-weight">
          <Icon icon={performance.icon.KRA} size="medium" />
          <KraWeightPresenter value={sums.get(category) ?? 0} showPercent />
        </div>
      </FixedColumn>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="item" let:item>
    <div class="m-1 flex-row-center p-text-2 clear-mins flex-gap-4">
      <FixedColumn key="person" justify="left">
        <KraRefPresenter value={item.kra} kind="list" />
      </FixedColumn>
      <FixedColumn key="kra" justify="left">
        <KraWeightEditorWithPopup value={item} kind="list" readonly={!canAssign && item.employee !== getCurrentAccount()._id} />
      </FixedColumn>
    </div>
  </svelte:fragment>
</GroupedList>

<style lang="scss">
  .total-weight {
    background-color: var(--theme-button-hovered);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
</style>
