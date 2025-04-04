<!--
// Copyright © 2022-2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, Kpi, KpiReport, TimeReportDayType } from '@hcengineering/kra'
  import { DatePresenter, EditBox } from '@hcengineering/ui'
  import KpiProgressBar from './KpiProgressBar.svelte'
  import { getTimeReportDate, getTimeReportDayType } from '../../../utils'
  import { createEventDispatcher } from 'svelte'
  import { UserBox } from '@hcengineering/contact-resources'
  import contact, { Employee } from '@hcengineering/contact'
  import TimeReportDayDropdown from '../timereport/TimeReportDayDropdown.svelte'
  import { AttachedData, Ref, Space, WithLookup } from '@hcengineering/core'

  export let issue: Issue | undefined = undefined
  export let kpi: WithLookup<Kpi>
  export let sum: number

  const space: Ref<Space> | undefined = issue?.space
  const assignee: Ref<Employee> | null | undefined = issue?.assignee as Ref<Employee>

  let timeReportDateType: TimeReportDayType | undefined = TimeReportDayType.CurrentWorkDay

  const kpiId = kpi._id
  const kpiClass = kpi._class
  const dispatch = createEventDispatcher()
  const client = getClient()
  const data = {
    value: undefined as number | undefined,
    date: getTimeReportDate(timeReportDateType),
    employee: assignee ?? null,
    comment: ''
  }

  $: canSave = data.value !== undefined && Number.isFinite(data.value) && data.value >= 0 && space !== undefined

  async function save (): Promise<void> {
    if (canSave) {
      await client.addCollection(
        kra.class.KpiReport,
        space,
        kpiId,
        kpiClass,
        'kpi-reports',
        data as AttachedData<KpiReport>
      )
    }
    dispatch('close')
  }
</script>

<Card width="medium" label={kra.string.Goal} okAction={save} {canSave}>
  <div class="kpi-value">
    <div>
      <span class="mr-1"> {sum} + </span>
    </div>
    <div class="clear-mins">
      <EditBox bind:value={data.value} format="number" placeholder={kra.string.Goal} />
    </div>
    <span class="unit">/ {kpi.target} ({kpi.$lookup?.unit?.name})</span>
  </div>
  <div class="mt-4">
    <EditBox placeholder={kra.string.Comment} bind:value={data.comment} />
  </div>
  <!-- <svelte:fragment slot="header"> -->
  <!--   <ObjectBox object={issue} -->
  <!--     _class={kra.class.Issue} -->
  <!--     value={templateId} -->
  <!--     docQuery={{ -->
  <!--       space: _space -->
  <!--     }} -->
  <!--     on:change={handleTemplateChange} -->
  <!--     kind={'regular'} -->
  <!--     size={'small'} -->
  <!--     label={tracker.string.NoIssueTemplate} -->
  <!--     icon={tracker.icon.IssueTemplates} -->
  <!--     searchField={'title'} -->
  <!--     allowDeselect={true} -->
  <!--     showNavigate={false} -->
  <!--     docProps={{ disabled: true, noUnderline: true }} -->
  <!--     focusIndex={20000} -->
  <!--   /> -->
  <!-- </svelte:fragment> -->
  <svelte:fragment slot="pool">
    <DatePresenter
      bind:value={data.date}
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
      on:selected={({ detail }) => (data.date = getTimeReportDate(detail))}
    />
    <UserBox
      _class={contact.mixin.Employee}
      label={contact.string.Employee}
      kind={'regular'}
      size={'large'}
      bind:value={data.employee}
      showNavigate={false}
    />
  </svelte:fragment>
  <div class="mt-4 mb-4">
    <KpiProgressBar value={sum} max={kpi.target} additionalValue={data.value} />
  </div>
</Card>

<style>
  .kpi-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .unit {
    border: 1px solid var(--theme-secondary-color, #e2e8f0);
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-style: italic;
    color: var(--gray-500);
  }
</style>
