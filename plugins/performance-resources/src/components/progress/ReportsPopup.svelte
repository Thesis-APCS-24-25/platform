<script lang="ts">
  import contact from '@hcengineering/contact'
  import { FindOptions } from '@hcengineering/core'
  import presentation, { Card } from '@hcengineering/presentation'
  import { PTask, ProgressReport } from '@hcengineering/performance'
  import { Button, IconAdd, Scroller, tableSP } from '@hcengineering/ui'
  import { ObjectPresenter, TableBrowser } from '@hcengineering/view-resources'
  import { createEventDispatcher } from 'svelte'
  import ReportValueEditor from './ReportValueEditor.svelte'
  import performance from '../../plugin'

  export let task: PTask
  export let addReport: (event: MouseEvent) => void = () => {}

  export function canClose (): boolean {
    return true
  }

  const dispatch = createEventDispatcher()

  const options: FindOptions<ProgressReport> = {
    lookup: {
      attachedTo: performance.class.PTask,
      reportBy: contact.mixin.Employee
    }
  }
</script>

<Card
  label={performance.string.Progress}
  canSave={true}
  okAction={() => {
    dispatch('close')
  }}
  okLabel={presentation.string.Ok}
  gap={'gapV-4'}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <svelte:fragment slot="header">
    <ObjectPresenter value={task} disabled />
  </svelte:fragment>

  <slot name="summary" />

  <div class="h-60">
    <Scroller fade={tableSP}>
      <TableBrowser
        _class={performance.class.ProgressReport}
        query={{ attachedTo: task.progress }}
        config={[
          '$lookup.attachedTo',
          {
            key: '',
            label: performance.string.ProgressReport,
            props: {
              kind: 'link',
              justify: 'left'

            },
            presenter: ReportValueEditor
          },
          'reportBy',
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
