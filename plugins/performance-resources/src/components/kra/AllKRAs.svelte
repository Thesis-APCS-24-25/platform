<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery, SortingOrder, WithLookup } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import {
    AnyComponent,
    Breadcrumb,
    Button,
    Header,
    IconAdd,
    IModeSelector,
    Label,
    ModeSelector,
    resizeObserver,
    Scroller,
    showPopup
  } from '@hcengineering/ui'
  import view, { BuildModelKey, Viewlet, ViewletDescriptor, ViewOptions } from '@hcengineering/view'
  import { SpecialView } from '@hcengineering/workbench-resources'
  import { ParentsNavigationModel, ViewConfiguration } from '@hcengineering/workbench'
  import performance from '../../plugin'
  import { List, ListSelectionProvider, ListView, SelectDirection } from '@hcengineering/view-resources'
  import { getClient, createQuery } from '@hcengineering/presentation'
  import CreateKra from './CreateKRA.svelte'
  import ListCategories from '../list/ListCategories.svelte'
  import EmployeeKRAsByEmployeeSubList from './EmployeeKRAsByEmployeeSubList.svelte'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'

  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString = performance.string.KRA
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined

  let viewOptions: ViewOptions = {
    groupBy: ['kra'],
    orderBy: ['employee', SortingOrder.Ascending]
  }

  let viewlet: Viewlet | undefined = undefined
  void getClient()
    .findOne(view.class.Viewlet, {
      attachTo: performance.class.EmployeeKRA
    })
    .then((res) => {
      if (res !== undefined) {
        viewlet = res
      }
    })

  $: baseQuery = {
    ...baseQuery,
    // employee: {
    //   $exists: true
    // },
    space
  }

  const groupByEmployeeViewOptions: ViewOptions = {
    groupBy: ['employee'],
    orderBy: ['kra', SortingOrder.Ascending]
  }

  const groupByKRAViewOptions: ViewOptions = {
    groupBy: ['kra'],
    orderBy: ['employee', SortingOrder.Ascending]
  }

  const perKRAConfig: (string | BuildModelKey)[] = [
    {
      key: 'employee',
      displayProps: {
        fixed: 'left'
      }
    },
    {
      key: '',
      presenter: performance.component.KRAWeightEditorWithPopup,
      props: {
        readonly: true
      },
      displayProps: {
        fixed: 'right',
        dividerBefore: true
      }
    }
  ]

  const perEmployeeConfig: (string | BuildModelKey)[] = [
    {
      key: 'kra',
      displayProps: {
        fixed: 'left'
      }
    },
    {
      key: '',
      presenter: performance.component.KRAWeightEditorWithPopup,
      props: {
        readonly: true
      },
      displayProps: {
        fixed: 'right',
        dividerBefore: true
      }
    }
  ]

  let config = perKRAConfig

  const modes: IModeSelector = {
    mode: 'per-kra',
    config: [
      ['per-kra', performance.string.PerKRA, {}],
      ['per-employee', performance.string.PerMember, {}]
    ],
    onChange (mode) {
      if (mode === 'per-kra') {
        viewOptions = groupByKRAViewOptions
        config = perKRAConfig
      } else if (mode === 'per-employee') {
        viewOptions = groupByEmployeeViewOptions
        config = perEmployeeConfig
      }
    }
  }

  // let list: List
  // let listWidth: number = 0
  let scroll: Scroller
  let divScroll: HTMLDivElement
  //
  // const listProvider = new ListSelectionProvider(
  //   (offset: 1 | -1 | 0, of?: Doc, dir?: SelectDirection, noScroll?: boolean) => {
  //     if (dir === 'vertical') {
  //       // Select next
  //       list?.select(offset, of, noScroll)
  //     }
  //   }
  // )
  // const selection = listProvider.selection

  let kras: Ref<KRA>[] = []
  let employeeKras: WithLookup<EmployeeKRA>[] = []
  const kraQuery = createQuery()
  const employeeKraQuery = createQuery()
  $: kraQuery.query(
    performance.class.KRA,
    {
      space
    },
    (res) => {
      kras = res.map((kra) => kra._id)
    }
  )

  $: employeeKraQuery.query(
    performance.class.EmployeeKRA,
    {
      space,
      kra: { $in: kras }
    },
    (res) => {
      employeeKras = res
    }
  )
</script>

<Header>
  <Breadcrumb {icon} {label} size={'large'} isCurrent />
  <svelte:fragment slot="actions">
    <Button
      icon={IconAdd}
      size="large"
      label={performance.string.CreateKRA}
      kind="primary"
      on:click={() => {
        showPopup(
          CreateKra,
          {
            space
          },
          'top'
        )
      }}
    />
  </svelte:fragment>

  <svelte:fragment slot="extra">
    {#if modes !== undefined}
      <ModeSelector props={modes} kind="subtle" />
    {/if}
  </svelte:fragment>
</Header>

<div class="w-full h-full py-4 clear-mins">
  <Scroller
    bind:this={scroll}
    bind:divScroll
    fade={{ multipler: { top: 2.75 * viewOptions.groupBy.length, bottom: 0 } }}
    padding={'0 1rem'}
    noFade
    checkForHeaders
  >
    <div class="flex-col-stretch flex-gap-2">
      <EmployeeKRAsByEmployeeSubList {kras} {employeeKras} />
    </div>
  </Scroller>
</div>
