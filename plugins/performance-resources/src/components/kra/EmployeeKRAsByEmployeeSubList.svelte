<script lang="ts">
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'
  import { Button, ExpandCollapse, ListView, Separator, showPopup } from '@hcengineering/ui'
  import { FixedColumn, ListSelectionProvider, showMenu } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import ListHeader from './ListHeader.svelte'
  import performance from '../../plugin'
  import AssignKraPopup from './AssignKRAPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import GroupedList from '../ui/GroupedList.svelte'

  export let kras: Ref<KRA>[]
  export let employeeKras: WithLookup<EmployeeKRA>[]

  const collapsed: boolean[] = Array(kras.length).fill(true)

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
    console.log('mapping', mapping)
  }

  const listProvider = new ListSelectionProvider(() => {})

  $: focusIndexes = kras.map(() => -1)
</script>

<GroupedList categories={kras} items={employeeKras} key="kra">
  <svelte:fragment slot="header" let:category let:count>
    <div class="flex-row-center flex-grow" style:color={'inherit'}>
      <KraRefPresenter value={category} kind="list-header" type="text" />
      <span class="ml-2 font-medium-12">{count}</span>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="action" let:category>
    <Button
      size="small"
      kind="primary"
      label={performance.string.AssignKRA}
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
  </svelte:fragment>
  <svelte:fragment slot="item" let:item>
    <div class="m-1 flex-row-center p-text-2 clear-mins flex-gap-4">
      <FixedColumn key="person" justify="left">
        <PersonAccountRefPresenter value={item.employee} />
      </FixedColumn>
      <FixedColumn key="kra" justify="left">
        <KraWeightEditorWithPopup value={item} kind="list" readonly />
      </FixedColumn>
    </div>
  </svelte:fragment>
</GroupedList>

<style lang="scss">
  .divider {
    width: 1px;
    height: 100%;
    background-color: var(--hc-color-bg-divider);
  }

  .list-content {
    background-color: var(--theme-list-row-color);
    border-radius: 0rem 0rem 0.25rem 0.25rem;
    border: 1px solid var(--theme-list-border-color);
    border-top: none;
  }
</style>
