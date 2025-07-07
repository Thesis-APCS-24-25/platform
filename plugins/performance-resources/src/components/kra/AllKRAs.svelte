<script lang="ts">
  import { Ref, Doc, DocumentQuery, WithLookup } from '@hcengineering/core'
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
  import { EmployeeKRA, KRA, ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import { PersonAccount } from '@hcengineering/contact'
  import EmployeeKrAsByKraList from './EmployeeKRAsByKRAList.svelte'
  import { Member } from '@hcengineering/kra-team'
  import { personIdByAccountId } from '@hcengineering/contact-resources'

  export let currentSpace: Ref<ReviewSession>
  export let icon: Asset = performance.icon.Active
  export let label: IntlString = performance.string.KRA
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined

  $: baseQuery = {
    ...baseQuery,
    space: currentSpace
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

  let kras: KRA[] = []
  let employees: Ref<PersonAccount>[] = []
  $: members = employees.map((e) => $personIdByAccountId.get(e)).filter((e) => e !== undefined) as Ref<Member>[]
  let employeeKras: WithLookup<EmployeeKRA>[] = []
  const kraQuery = createQuery()
  const employeeKraQuery = createQuery()
  const spaceQuery = createQuery()
  let reviewSession: ReviewSession | undefined = undefined
  $: spaceQuery.query(
    performance.class.ReviewSession,
    {
      _id: currentSpace
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
      space: currentSpace
    },
    (res) => {
      kras = res
    }
  )

  $: employeeKraQuery.query(
    performance.class.EmployeeKRA,
    {
      space: currentSpace,
      kra: { $in: kras.map((k) => k._id) }
    },
    (res) => {
      employeeKras = res
    }
  )

  // let canAssign = false
  // $: void canAssignKRAs(getClient(), currentSpace).then((result) => {
  //   canAssign = result
  // })

  $: canCreateKRA = reviewSession?.status === ReviewSessionStatus.Drafting
  $: allowEditKRAStatus = reviewSession?.status === ReviewSessionStatus.Drafting
</script>

<Header>
  <Breadcrumb {icon} {label} size={'large'} isCurrent />
  <svelte:fragment slot="actions">
    {#if modes !== undefined}
      <ModeSelector props={modes} kind="subtle" />
    {/if}
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
            space: currentSpace
          },
          'top'
        )
      }}
    />
  </svelte:fragment>

  <svelte:fragment slot="extra"></svelte:fragment>
</Header>

<div class="w-full h-full py-4 clear-mins">
  <Scroller bind:this={scroll} bind:divScroll padding={'0 1rem'} noFade checkForHeaders>
    <div class="flex-col-stretch flex-gap-2">
      {#if currentMode === 'per-kra'}
        <EmployeeKrAsByKraList {kras} {employeeKras} space={currentSpace} {allowEditKRAStatus} />
      {:else if currentMode === 'per-employee'}
        <EmployeeKRAsByEmployeeList {members} space={currentSpace} {allowEditKRAStatus} />
      {/if}
    </div>
  </Scroller>
</div>
