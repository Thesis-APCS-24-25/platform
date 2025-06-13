<script lang="ts">
  import { getCurrentAccount, Ref, SortingOrder } from '@hcengineering/core'
  import { Scroller } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { ListSelectionProvider, List } from '@hcengineering/view-resources'
  import ProgressPresenter from '../kra/ProgressPresenter.svelte'
  import performance from '../../plugin'
  import KraWeightEditorWithPopup from '../kra/KRAWeightEditorWithPopup.svelte'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import task from '@hcengineering/task'
  import { createQuery } from '@hcengineering/presentation'
  import { PersonAccount } from '@hcengineering/contact'

  export let space: Ref<ReviewSession>

  const userId = getCurrentAccount()._id as Ref<PersonAccount>

  let assignedKRAs: Ref<KRA>[] = []
  const assignedKRAsQuery = createQuery()
  $: assignedKRAsQuery.query(
    performance.class.EmployeeKRA,
    {
      employee: userId,
      space
    },
    (res) => {
      if (res !== undefined) {
        const kraSet = new Set(res.map((item) => item.kra))
        assignedKRAs = Array.from(kraSet)
      }
    }
  )


  let scroll: Scroller
  let divScroll: HTMLDivElement
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0) => {})
</script>

<div class="w-full h-full py-4 clear-mins">
  <Scroller bind:this={scroll} bind:divScroll padding={'0 1rem'} noFade checkForHeaders>
    <div class="flex-col-stretch flex-gap-2">
      <List
        props={{
          readonly: true,
          disabled: true,
          editable: false
        }}
        {listProvider}
        config={[
          '',
          {
            key: 'title'
          },
          {
            key: '',
            presenter: view.component.GrowPresenter
          },
          {
            key: '',
            presenter: ProgressPresenter
          }
        ]}
        configurations={undefined}
        query={{
          kra: { $in: assignedKRAs }
        }}
        options={{
          lookup: {
            kra: performance.class.KRA
          }
        }}
        viewOptionsConfig={[
          {
            key: 'shouldShowAll',
            type: 'toggle',
            defaultValue: true,
            actionTarget: 'category',
            action: performance.function.ShowEmptyGroups,
            label: view.string.View
          }
        ]}
        viewOptions={{
          groupBy: ['assignee', 'kra'],
          orderBy: ['assignee', SortingOrder.Ascending]
        }}
        _class={performance.mixin.WithKRA}
      />
    </div>
  </Scroller>
</div>
