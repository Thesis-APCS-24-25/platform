<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery, WithLookup } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import {
    Breadcrumb,
    Button,
    Header,
    IconAdd,
    IModeSelector,
    ModeSelector,
    Scroller,
    showPopup
  } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { createQuery } from '@hcengineering/presentation'
  import CreateKra from './CreateKRA.svelte'
  import EmployeeKRAsByEmployeeList from './EmployeeKRAsByEmployeeList.svelte'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import { PersonAccount } from '@hcengineering/contact'
  import EmployeeKrAsByKraList from './EmployeeKRAsByKRAList.svelte'

  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString = performance.string.KRA
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined

  $: baseQuery = {
    ...baseQuery,
    // employee: {
    //   $exists: true
    // },
    space
  }

  const modes: IModeSelector = {
    mode: 'per-kra',
    config: [
      ['per-kra', performance.string.PerKRA, {}],
      ['per-employee', performance.string.PerMember, {}]
    ],
    onChange (mode) {
      modes.mode = mode
      currentMode = mode
    }
  }

  let currentMode = modes.mode

  let scroll: Scroller
  let divScroll: HTMLDivElement

  let kras: Ref<KRA>[] = []
  let employees: Ref<PersonAccount>[] = []
  let employeeKras: WithLookup<EmployeeKRA>[] = []
  const kraQuery = createQuery()
  const employeeKraQuery = createQuery()
  const spaceQuery = createQuery()
  $: spaceQuery.query(
    performance.class.ReviewSession,
    {
      _id: space as Ref<ReviewSession>
    },
    (res) => {
      if (res.length > 0) {
        employees = (res[0].members ?? []).map((member) => member as Ref<PersonAccount>)
      }
    }
  )
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
  <Scroller bind:this={scroll} bind:divScroll padding={'0 1rem'} noFade checkForHeaders>
    <div class="flex-col-stretch flex-gap-2">
      {#if currentMode === 'per-kra'}
        <EmployeeKrAsByKraList {kras} {employeeKras} />
      {:else if currentMode === 'per-employee'}
        <EmployeeKRAsByEmployeeList {employees} {employeeKras} />
      {/if}
    </div>
  </Scroller>
</div>
