<script lang="ts">
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'
  import { ExpandCollapse, ListView, Separator } from '@hcengineering/ui'
  import { FixedColumn, ListSelectionProvider, showMenu } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import ListHeader from './ListHeader.svelte'
  import performance from '../../plugin'
  import AssignKraPopup from './AssignKRAPopup.svelte'

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

<div class="flex-col-stretch flex-gap-2">
  {#each kras as kra}
    {@const idx = kras.indexOf(kra)}
    <div>
      <ListHeader
        {kra}
        count={mapping.get(kra)?.length ?? 0}
        collapsed={collapsed[idx]}
        headerBGColor={'var(--header-bg-color)'}
        on:collapse={() => {
          collapsed[idx] = !collapsed[idx]
        }}
        createLabel={performance.string.AssignKRA}
        createComponent={AssignKraPopup}
        createComponentProps={{ kra, assigns: mapping.get(kra) }}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <ExpandCollapse isExpanded={!collapsed[idx]}>
        <div class="list-content">
          <ListView
            count={mapping.get(kra)?.length ?? 0}
            addClass={'step-tb-2-accent list-content'}
            kind="full-size"
            selection={focusIndexes[idx] !== -1 ? focusIndexes[idx] : -1}
          >
            <svelte:fragment slot="item" let:item>
              {@const employeeKra = mapping.get(kra)?.[item]}
              {#if employeeKra}
                <div
                  class="m-1 flex-row-center p-text-2 clear-mins flex-gap-4"
                  on:contextmenu={(ev) => {
                    showMenu(ev, { object: employeeKra })
                  }}
                  on:mouseenter={() => {
                    focusIndexes = focusIndexes.map((_, i) => (i === idx ? item : -1))
                    listProvider.updateFocus(employeeKra)
                  }}
                  on:focus={() => {
                    listProvider.updateFocus(employeeKra)
                  }}
                  on:mouseleave={() => {
                    focusIndexes = focusIndexes.map(() => -1)
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
              {/if}
            </svelte:fragment>
          </ListView>
        </div>
      </ExpandCollapse>
    </div>
  {/each}
</div>

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
