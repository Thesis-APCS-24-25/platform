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
  import { getClient } from '@hcengineering/presentation'
  import kra from '../../../../plugin'
  import { Issue, Kpi, Report } from '@hcengineering/kra'
  import KpiProgressBar from './KpiProgressBar.svelte'
  import { createEventDispatcher } from 'svelte'
  import { Employee } from '@hcengineering/contact'
  import { AttachedData, Ref, Space, WithLookup } from '@hcengineering/core'
  import ReportEditPopup from './../ReportEditPopup.svelte'
  import { EditBox } from '@hcengineering/ui'

  export let issue: Issue | undefined = undefined
  export let kpi: WithLookup<Kpi>
  export let sum: number

  const space: Ref<Space> | undefined = issue?.space

  const kpiId = kpi._id
  const kpiClass = kpi._class
  const dispatch = createEventDispatcher()
  const client = getClient()

  let assignee: Ref<Employee> | null | undefined = issue?.assignee as Ref<Employee>
  let value = undefined as number | undefined
  let reportDate: number | undefined = undefined
  let note = ''

  function getData (): AttachedData<Report> | undefined {
    if (value !== undefined && reportDate !== undefined && assignee !== undefined) {
      return {
        value,
        date: reportDate,
        employee: assignee,
        note
      }
    }
    return undefined
  }

  $: canSave = value !== undefined && Number.isFinite(value) && value >= 0 && space !== undefined

  async function save (): Promise<void> {
    const data = getData()
    if (canSave && data !== undefined && space !== undefined) {
      await client.addCollection(
        kra.class.Report,
        space,
        kpiId,
        kpiClass,
        'goal-reports',
        data
      )
    }
    dispatch('close')
  }
</script>

<ReportEditPopup okAction={save} {canSave} bind:assignee bind:reportDate>
  <svelte:fragment slot="header">
  </svelte:fragment>
  <svelte:fragment slot="content">
    <div class="kpi-value">
      <div>
        <span class="mr-1"> {sum} + </span>
      </div>
      <div class="clear-mins">
        <EditBox bind:value={value} format="number" placeholder={kra.string.Goal} />
      </div>
      <span class="unit">/ {kpi.target} ({kpi.$lookup?.unit?.name})</span>
    </div>
    <div class="mt-4">
      <EditBox placeholder={kra.string.Comment} bind:value={note} />
    </div>
    <div class="mt-4 mb-4">
      <KpiProgressBar value={sum} max={kpi.target} additionalValue={value} />
    </div>
  </svelte:fragment>
</ReportEditPopup>

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
