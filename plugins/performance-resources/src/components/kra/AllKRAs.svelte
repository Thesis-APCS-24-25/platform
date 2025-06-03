<script lang="ts">
  import { Ref, Doc, Space, DocumentQuery, WithLookup, checkPermission, TypedSpace } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import {
    Breadcrumb,
    Button,
    Header,
    Icon,
    IconAdd,
    IModeSelector,
    ModeSelector,
    Scroller,
    showPopup
  } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import CreateKra from './CreateKRA.svelte'
  import EmployeeKRAsByEmployeeList from './EmployeeKRAsByEmployeeList.svelte'
  import { EmployeeKRA, KRA, ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import { PersonAccount } from '@hcengineering/contact'
  import EmployeeKrAsByKraList from './EmployeeKRAsByKRAList.svelte'
  import { canAssignKRAs } from '../../utils/team'

  export let space: Ref<ReviewSession>
  export let icon: Asset = performance.icon.Active
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
  let reviewSession: ReviewSession | undefined = undefined
  $: spaceQuery.query(
    performance.class.ReviewSession,
    {
      _id: space
    },
    (res) => {
      reviewSession = res[0]
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

  let canAssign = false
  $: void canAssignKRAs(getClient(), space).then((result) => {
    canAssign = result
  })

  $: canCreateKRA = reviewSession?.status === ReviewSessionStatus.Drafting
</script>

<Header>
  <Breadcrumb {icon} {label} size={'large'} isCurrent />
  <svelte:fragment slot="actions">
    <Button
      icon={IconAdd}
      size="large"
      label={performance.string.CreateKRA}
      disabled={!canCreateKRA}
      kind="primary"
      showTooltip={{
        label: canCreateKRA ? performance.string.CreateKRA : performance.string.NotDraftingCannotCreateKRA
      }}
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
        <EmployeeKrAsByKraList {kras} {employeeKras} {canAssign} {space} />
      {:else if currentMode === 'per-employee'}
        <EmployeeKRAsByEmployeeList {employees} {employeeKras} {space} {canAssign} />
      {/if}
    </div>
  </Scroller>
</div>
