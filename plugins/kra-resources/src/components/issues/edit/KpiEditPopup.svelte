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
  import { Card } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, Kpi, TimeReportDayType } from '@hcengineering/kra'
  import { DatePresenter, EditBox } from '@hcengineering/ui'
  import KpiProgressBar from './KpiProgressBar.svelte'
  import { getTimeReportDate, getTimeReportDayType } from '../../../utils'
  import { createEventDispatcher } from 'svelte'
  import { UserBox } from '@hcengineering/contact-resources'
  import contact, { Employee } from '@hcengineering/contact'
  import TimeReportDayDropdown from '../timereport/TimeReportDayDropdown.svelte'

  export let issue: Issue | undefined = undefined
  export let kpi: Kpi
  export let assignee: Ref<Employee> | null | undefined = issue?.assignee as Ref<Employee>

  let timeReportDateType: TimeReportDayType | undefined = TimeReportDayType.CurrentWorkDay

  const dispatch = createEventDispatcher()
  const data = {
    value: undefined,
    description: '',
    reportDate: getTimeReportDate(timeReportDateType),
    employee: assignee
  }

  $: canSave = data.value !== undefined && data.value >= 0

  function save(): void {
    // Save the value

    dispatch('close')
  }
</script>

<Card width="medium" label={kra.string.Goal} okAction={save} {canSave}>
  <div class="kpi-value">
    <div class="clear-mins">
      <EditBox bind:value={data.value} format="number" placeholder={kra.string.Goal} />
    </div>
    <span class="unit">{kpi.unit}</span>
  </div>
  <div class="mt-4">
    <EditBox placeholder={kra.string.IssueDescriptionPlaceholder} value={data.description} on:change={(e) => {}} />
  </div>
  <svelte:fragment slot="pool">
    <DatePresenter
      bind:value={data.reportDate}
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
      on:selected={({ detail }) => (data.reportDate = getTimeReportDate(detail))}
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
    <KpiProgressBar value={kpi.value ?? 0} target={kpi.target} additionalValue={data.value} />
  </div>
</Card>

<style>
  .kpi-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .unit {
    font-size: 0.8rem;
    font-style: italic;
    color: var(--gray-500);
  }
</style>
