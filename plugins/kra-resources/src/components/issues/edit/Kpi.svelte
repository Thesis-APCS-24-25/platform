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
  import { Kpi, KpiReport, kraId } from '@hcengineering/kra'
  import tracker from '../../../plugin'
  import { EditBox } from '@hcengineering/ui'

  export let kpi: Kpi
  export let focusIndex: number | undefined = undefined

  const size = kpi.reports

  /**
   * Updates KPI with the specified field and value
   * @param field - The field to update
   * @param value - The new value
   */
  async function updateKpi(field: keyof Kpi, value: any): Promise<void> {
    // Implementation would depend on your application's update mechanism
    // This is a placeholder for the actual update logic
    console.log(`Updating ${field} to ${value}`)
  }
</script>

<div class="container">
  <div class="header">
    <EditBox kind="large-style" disabled={true} value={kpi.name} />

    <EditBox kind="small-style" disabled={true} value={kpi.description} />
  </div>

  <div class="kpi-box">
    <div class="value">
      <span class="value-value">{kpi.value}</span>
      <span class="value-target"> / {kpi.target}</span>
    </div>
    <span class="unit"> {kpi.unit}</span>

  </div>
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
    gap: 0.5rem;
  }
</style>
