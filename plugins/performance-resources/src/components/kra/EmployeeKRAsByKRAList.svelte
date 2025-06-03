<script lang="ts">
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { checkPermission, getCurrentAccount, Ref, TypedSpace, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import { Button, showPopup } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import AssignKraPopup from './AssignKRAPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import GroupedList from '../ui/GroupedList.svelte'

  export let kras: Ref<KRA>[]
  export let employeeKras: WithLookup<EmployeeKRA>[]
  export let space: Ref<ReviewSession>
  export let canAssign: boolean = false

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
</script>

<GroupedList categories={kras} items={employeeKras} key="kra">
  <svelte:fragment slot="header" let:category let:count>
    <div class="flex-row-center flex-grow" style:color={'inherit'}>
      <KraRefPresenter value={category} kind="list-header" type="text" />
      <span class="ml-2 font-medium-12">{count}</span>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="action" let:category>
    {#if canAssign}
      <Button
        kind="ghost"
        icon={performance.icon.AssignKRA}
        showTooltip={{
          label: performance.string.AssignKRA
        }}
        on:click={() => {
          const assigns = mapping.get(category) ?? []
          showPopup(
            AssignKraPopup,
            {
              kra: category,
              assigns
            },
            'top'
          )
        }}
      />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="item" let:item>
    <div class="m-1 flex-row-center p-text-2 clear-mins flex-gap-4">
      <FixedColumn key="person" justify="left">
        <PersonAccountRefPresenter value={item.employee} />
      </FixedColumn>
      <FixedColumn key="kra" justify="left">
        <KraWeightEditorWithPopup value={item} kind="list" readonly={!canAssign && item.employee !== getCurrentAccount()._id} />
      </FixedColumn>
    </div>
  </svelte:fragment>
</GroupedList>
