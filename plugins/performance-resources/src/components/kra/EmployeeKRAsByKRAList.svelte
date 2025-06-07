<script lang="ts">
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { checkPermission, getCurrentAccount, Ref, TypedSpace, WithLookup } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import { Button, getPlatformColorDef, showPopup, themeStore } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import AssignKraPopup from './AssignKRAPopup.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import GroupedList from '../ui/GroupedList.svelte'
  import KraPresenter from './KRAPresenter.svelte'

  export let kras: KRA[]
  export let employeeKras: WithLookup<EmployeeKRA>[]
  export let space: Ref<ReviewSession>
  export let canAssign: boolean = false

  let kraById: Map<Ref<KRA>, KRA> = new Map<Ref<KRA>, KRA>()
  $: {
    kraById = new Map(kras.map(kra => [kra._id, kra]))
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

  function listHeaderColor (category: Ref<KRA>): string {
    const color = kraById.get(category)?.color
    return color !== undefined
      ? getPlatformColorDef(color, $themeStore.dark)?.background ?? 'var(--header-bg-color)'
      : 'var(--header-bg-color)'
  }
</script>

<GroupedList categories={kras.map(k => k._id)} items={employeeKras} key="kra" headerBGColor={listHeaderColor}>
  <svelte:fragment slot="header" let:category let:count>
    <div class="flex-row-center flex-grow" style:color={'inherit'}>
      <KraRefPresenter value={category} kind="list-header" type="link" shouldShowAvatar />
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
              space,
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
      <FixedColumn key="kra" justify="right">
        <KraWeightEditorWithPopup
          value={item}
          kind="list"
          {space}
          readonly={!canAssign && item.employee !== getCurrentAccount()._id}
        />
      </FixedColumn>
    </div>
  </svelte:fragment>
</GroupedList>
