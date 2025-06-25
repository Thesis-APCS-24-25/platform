<script lang="ts">
  import { Card } from '@hcengineering/presentation'
  import kra from '../../plugin'
  import { TimeReportDayType } from '@hcengineering/performance'
  import { DatePresenter } from '@hcengineering/ui'
  import { getReportDate, getReportDayType } from '../../utils/progress-report'
  import { UserBox } from '@hcengineering/contact-resources'
  import contact, { Person } from '@hcengineering/contact'
  import TimeReportDayDropdown from '../timereport/TimeReportDayDropdown.svelte'
  import { Ref } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { createEventDispatcher } from 'svelte'
  import view from '@hcengineering/view'

  export let label: IntlString | undefined = undefined
  export let okAction: () => void = () => {}
  export let width: 'large' | 'medium' | 'small' | 'x-small' | 'menu' = 'medium'
  export let okLabel: IntlString = view.string.Save
  export let canSave: boolean = false
  export let assignee: Ref<Person> | null | undefined
  export let reportDate: number | undefined | null = getReportDate(TimeReportDayType.CurrentWorkDay)

  let timeReportDateType: TimeReportDayType | undefined = TimeReportDayType.CurrentWorkDay

  const dispatch = createEventDispatcher()
</script>

<Card
  {width}
  {okLabel}
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
        timeReportDateType = getReportDayType(detail)
      }}
    />
    <TimeReportDayDropdown
      kind={'regular'}
      size={'large'}
      bind:selected={timeReportDateType}
      on:selected={({ detail }) => (reportDate = getReportDate(detail))}
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
