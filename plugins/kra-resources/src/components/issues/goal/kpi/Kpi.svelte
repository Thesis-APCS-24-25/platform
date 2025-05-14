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
  import { calculateResult } from '../../../../utils/goal'
  import KpiProgressBar from './KpiProgressBar.svelte'
  import { WithLookup } from '@hcengineering/core'
  import KpiReportsPopup from './KpiReportsPopup.svelte'

  export let issue: Issue
  export let kpi: WithLookup<Kpi>
  export let focusIndex: number | undefined = undefined

  $: sum = calculateResult(kpi, undefined)

  function handleEdit (sum: number, e: MouseEvent): void {
    showPopup(KpiReportsPopup, { sum, kpi, issue }, eventToHTMLElement(e))
  }
</script>

{#await sum then sum}
  <div class="container">
    <div class="header">
      <EditBox kind="large-style" disabled={true} value={kpi.name} />
      <EditBox kind="small-style" disabled={true} value={kpi.description} />
    </div>

    <button class="kpi-box" on:click={handleEdit.bind(null, sum ?? 0)} tabindex={focusIndex}>
      <div class="value">
        <span class="value-value">{sum}</span>
        <span class="value-target"> / {kpi.target}</span>
      </div>
      <span class="unit"> {kpi.$lookup?.unit?.name}</span>
        <KpiProgressBar value={sum ?? 0} max={kpi.target} />
    </button>
  </div>
{/await}

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
</style>
