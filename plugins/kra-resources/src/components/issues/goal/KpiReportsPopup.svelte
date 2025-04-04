<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  import contact from '@hcengineering/contact'
  import { FindOptions, WithLookup } from '@hcengineering/core'
  import presentation, { Card } from '@hcengineering/presentation'
  import { Issue, Kpi, Project, TimeSpendReport } from '@hcengineering/kra'
  import { Button, eventToHTMLElement, IconAdd, Scroller, showPopup, tableSP } from '@hcengineering/ui'
  import { TableBrowser } from '@hcengineering/view-resources'
  import kra from '../../../plugin'
  import IssuePresenter from '../IssuePresenter.svelte'
  import KpiReportEditPopup from './KpiReportEditPopup.svelte'
  import { getKpiReports } from '../../../utils/goal'

  export let issue: Issue
  export let sum: number | undefined = undefined
  export let kpi: WithLookup<Kpi>

  $: if (sum === undefined) {
    getKpiReports(kpi, (res) => {
      sum = res.reduce((acc, curr) => acc + curr.value, 0)
    })
  }

  export function canClose (): boolean {
    return true
  }
  const options: FindOptions<TimeSpendReport> = {
    lookup: {
      attachedTo: kra.class.Issue,
      employee: contact.mixin.Employee
    }
  }
  function addReport (event: MouseEvent): void {
    showPopup(
      KpiReportEditPopup,
      {
        sum,
        issue,
        kpi
      },
      eventToHTMLElement(event)
    )
  }
</script>

<Card
  label={kra.string.KpiReports}
  canSave={true}
  on:close
  okAction={() => {}}
  okLabel={presentation.string.Ok}
  on:changeContent
>
  <svelte:fragment slot="header">
    <IssuePresenter value={issue} disabled />
  </svelte:fragment>
  <div class="h-50">
    <Scroller fade={tableSP}>
      <TableBrowser
        _class={kra.class.KpiReport}
        query={{ attachedTo: issue.goal }}
        config={[
          '$lookup.attachedTo',
          '',
          'employee',
          'date',
          'comment'
        ]}
        {options}
      />
    </Scroller>
  </div>
  <svelte:fragment slot="buttons">
    <Button id="ReportsPopupAddButton" icon={IconAdd} size={'large'} on:click={addReport} />
  </svelte:fragment>
</Card>
