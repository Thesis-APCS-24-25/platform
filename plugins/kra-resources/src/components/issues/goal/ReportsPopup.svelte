<script lang="ts">
  import contact from '@hcengineering/contact'
  import { FindOptions } from '@hcengineering/core'
  import presentation, { Card } from '@hcengineering/presentation'
  import { Issue, Report } from '@hcengineering/kra'
  import { Button, IconAdd, Scroller, tableSP } from '@hcengineering/ui'
  import { TableBrowser } from '@hcengineering/view-resources'
  import kra from '../../../plugin'
  import IssuePresenter from '../IssuePresenter.svelte'
  import { createEventDispatcher } from 'svelte'

  export let issue: Issue
  export let addReport: (event: MouseEvent) => void = () => {}

  export function canClose (): boolean {
    return true
  }

  const dispatch = createEventDispatcher()

  const options: FindOptions<Report> = {
    lookup: {
      attachedTo: kra.class.Issue,
      employee: contact.mixin.Employee
    }
  }
</script>

<Card
  label={kra.string.Goal}
  canSave={true}
  okAction={() => {
    dispatch('close')
  }}
  okLabel={presentation.string.Ok}
  gap={'gapV-4'}
  on:close={
  () => {
    dispatch('close')
  }
  }
  on:changeContent
>
  <svelte:fragment slot="header">
    <IssuePresenter value={issue} disabled />
  </svelte:fragment>

  <slot name="summary" />

  <div class="h-50">
    <Scroller fade={tableSP}>
      <TableBrowser
        _class={kra.class.Report}
        query={{ attachedTo: issue.goal }}
        config={['$lookup.attachedTo', '', 'employee', 'date', 'note']}
        {options}
      />
    </Scroller>
  </div>
  <svelte:fragment slot="buttons">
    <Button id="ReportsPopupAddButton" icon={IconAdd} size={'large'} on:click={addReport} />
  </svelte:fragment>
</Card>
