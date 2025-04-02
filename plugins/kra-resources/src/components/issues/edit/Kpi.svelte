<!--
// Copyright © 2022-2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and limitations under the License.
-->
<script lang="ts">
  import { Issue, Kpi } from '@hcengineering/kra'
  import { EditBox, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiEditPopup from './KpiEditPopup.svelte'
  import KpiReportsPopup from '../kpi/KpiReportsPopup.svelte'
  import { getKpiReports } from '../../../utils/goal'

  export let issue: Issue
  export let kpi: Kpi
  export let focusIndex: number | undefined = undefined

  const progress = Math.min(((kpi.value ?? 0) / kpi.target) * 100, 100) || 0

  let kpiReports: KpiReport[] = []

  $: sum = kpiReports.reduce((acc, it) => acc + it.value, 0)

  $: getKpiReports(kpi, (res) => {
    kpiReports = res
  })

  function handleEdit(e: MouseEvent) {
    showPopup(KpiReportsPopup, { kpi, currentProject: issue.space, issue }, eventToHTMLElement(e))
  }
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={kpi.name} />
    <EditBox kind="small-style" disabled={true} value={kpi.description} />
  </div>

  <button class="kpi-box" on:click={handleEdit} tabindex={focusIndex}>
    <div class="value">
      <span class="value-value">{sum}</span>
      <span class="value-target"> / {kpi.target}</span>
    </div>
    <span class="unit"> {kpi.unit}</span>
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: {progress}%"></div>
    </div>
  </button>
</div>

<style>
  .container {
    display: flex;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .header {
    flex-grow: 2;
  }

  .value-value {
    color: var(--theme-primary-color, #4c6ef5);
  }

  .kpi-box {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid transparent;
    padding: 0.25rem;
    border-radius: 0.25rem;
    gap: 0.5rem;
    color: var(--theme-content-color, #333);

    &:hover {
      border: 1px solid var(--theme-border-color, #e0e0e0);
    }
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background-color: var(--theme-border-color, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--theme-primary-color, #4c6ef5);
    transition: width 0.3s ease-in-out;
  }
</style>
