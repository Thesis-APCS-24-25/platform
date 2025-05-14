<script lang="ts">
  import { Card } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, TimeReportDayType } from '@hcengineering/kra'
  import { DatePresenter } from '@hcengineering/ui'
  import { getTimeReportDate, getTimeReportDayType } from '../../../utils'
  import { UserBox } from '@hcengineering/contact-resources'
  import contact, { Employee } from '@hcengineering/contact'
  import TimeReportDayDropdown from '../timereport/TimeReportDayDropdown.svelte'
  import { Ref } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { createEventDispatcher } from 'svelte'

  export let issue: Issue | undefined = undefined
  export let label: IntlString | undefined = undefined
  export let okAction: () => void = () => {}
  export let canSave: boolean = false
  export let assignee: Ref<Employee> | null | undefined = issue?.assignee as Ref<Employee>
  export let reportDate: number = getTimeReportDate(TimeReportDayType.CurrentWorkDay)

  let timeReportDateType: TimeReportDayType | undefined = TimeReportDayType.CurrentWorkDay

  const dispatch = createEventDispatcher()
</script>

<Card
  width="medium"
  label={label ?? kra.string.Goal}
  {okAction}
  {canSave}
  on:close={() => {
    dispatch('close')
  }}
>
  <svelte:fragment slot="header">
    <slot name="header" />
  </svelte:fragment>
  <svelte:fragment slot="subheader">
    <slot name="subheader" />
  </svelte:fragment>
  <slot name="content" />

  <svelte:fragment slot="pool">
    <DatePresenter
      bind:value={reportDate}
      editable
      kind={'regular'}
      size={'large'}
      on:change={({ detail }) => {
        timeReportDateType = getTimeReportDayType(detail)
      }}
    />
    <TimeReportDayDropdown
      kind={'regular'}
      size={'large'}
      bind:selected={timeReportDateType}
      on:selected={({ detail }) => (reportDate = getTimeReportDate(detail))}
    />
    <UserBox
      _class={contact.mixin.Employee}
      label={contact.string.Employee}
      kind={'regular'}
      size={'large'}
      bind:value={assignee}
      showNavigate={false}
    />
    <slot name="pool" />
  </svelte:fragment>
</Card>
