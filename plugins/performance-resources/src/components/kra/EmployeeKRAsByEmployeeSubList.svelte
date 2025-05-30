<script lang="ts">
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'
  import { ExpandCollapse, ListView } from '@hcengineering/ui'
  import { FixedColumn, ListSelectionProvider, showMenu } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import ListHeader from './ListHeader.svelte'

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
</script>

<div class="flex-col-stretch flex-gap-2">
  {#each kras as kra}
    {@const idx = kras.indexOf(kra)}
    <div>
      <ListHeader
        {kra}
        count={mapping.get(kra)?.length}
        collapsed={collapsed[idx]}
        headerBGColor={'var(--hc-color-bg-header)'}
        on:collapse={() => {
          collapsed[idx] = !collapsed[idx]
        }}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <ExpandCollapse isExpanded={!collapsed[idx]}>
        <ListView count={mapping.get(kra)?.length ?? 0} addClass={'step-tb-2-accent'} kind="full-size">
          <svelte:fragment slot="item" let:item>
            {@const employeeKra = mapping.get(kra)?.[item]}
            {#if employeeKra}
              <div
                class="flex-between p-text-2 clear-mins"
                on:contextmenu={(ev) => {
                  showMenu(ev, { object: employeeKra })
                }}
                on:mouseenter={() => {
                  listProvider.updateFocus(employeeKra)
                }}
                on:focus={() => {
                  listProvider.updateFocus(employeeKra)
                }}
                on:click={(evt) => {}}
              >
                <FixedColumn key="person" justify="left">
                  <PersonAccountRefPresenter value={employeeKra.employee} />
                </FixedColumn>
                <FixedColumn key="kra" justify="left">
                  <KraWeightEditorWithPopup value={employeeKra} kind="list" readonly />
                </FixedColumn>
              </div>
            {/if}</svelte:fragment
          >
        </ListView>
      </ExpandCollapse>
    </div>
  {/each}
</div>
