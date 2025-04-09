<script lang="ts">
  import contact from '@hcengineering/contact'
  import { FindOptions } from '@hcengineering/core'
  import presentation, { Card } from '@hcengineering/presentation'
  import { Goal, Issue, TimeSpendReport } from '@hcengineering/kra'
  import { Button, IconAdd, Scroller, tableSP } from '@hcengineering/ui'
  import { TableBrowser } from '@hcengineering/view-resources'
  import kra from '../../../plugin'
  import IssuePresenter from '../IssuePresenter.svelte'

  export let issue: Issue
  export let addReport: (event: MouseEvent) => void = () => {}

  export function canClose (): boolean {
    return true
  }

  const options: FindOptions<TimeSpendReport> = {
    lookup: {
      attachedTo: kra.class.Issue,
      employee: contact.mixin.Employee
    }
  }
</script>

<Card
  label={kra.string.Report}
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
        _class={kra.class.Report}
        query={{ attachedTo: issue.goal }}
        config={[
          '$lookup.attachedTo',
          '',
          'employee',
          'date',
          'note'
        ]}
        {options}
      />
    </Scroller>
  </div>
  <svelte:fragment slot="buttons">
    <Button id="ReportsPopupAddButton" icon={IconAdd} size={'large'} on:click={addReport} />
  </svelte:fragment>
</Card>
