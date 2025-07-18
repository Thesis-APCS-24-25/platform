<script lang="ts">
  import { Doc, Ref, SortingOrder, Space, getCurrentAccount } from '@hcengineering/core'
  import { Breadcrumb, Header, Scroller } from '@hcengineering/ui'
  import { createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { KRA, PTask } from '@hcengineering/performance'
  import { List, ListSelectionProvider, SelectDirection } from '@hcengineering/view-resources'
  import view from '@hcengineering/view'
  import AssignTaskPopup from './AssignTaskPopup.svelte'
  import { personIdByAccountId } from '@hcengineering/contact-resources'
  import ProgressSummaryPresenter from '../progress/ProgressSummaryPresenter.svelte'
  import BlockedByPresenter from '../task/BlockedByPresenter.svelte'

  export let currentSpace: Ref<Space>

  const userId = getCurrentAccount()._id as Ref<PersonAccount>
  const me = $personIdByAccountId.get(getCurrentAccount()._id as Ref<PersonAccount>)
  const actionItemQuery = createQuery()
  let tasks: PTask[] = []
  $: actionItemQuery.query(performance.class.PTask, {}, (res) => {
    if (res !== undefined) {
      tasks = res
    }
  })

  let assignedKRAs: Ref<KRA>[] = []
  const assignedKRAsQuery = createQuery()
  $: assignedKRAsQuery.query(
    // TODO: When the value `assignedTo` KRA is used, we should update the query to use it
    performance.class.EmployeeKRA,
    {
      assignee: me,
      space: currentSpace
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
  let list: List
  const listProvider = new ListSelectionProvider(
    (offset: 1 | -1 | 0, of?: Doc, dir?: SelectDirection, noScroll?: boolean) => {
      if (dir === 'vertical') {
        // Select next
        list?.select(offset, of, noScroll)
      }
    }
  )
  const selection = listProvider.selection
</script>

<Header>
  <Breadcrumb icon={performance.icon.KRA} label={performance.string.MyKRAs} size={'large'} isCurrent />
</Header>

<div class="w-full h-full py-4 clear-mins">
  <Scroller bind:this={scroll} bind:divScroll padding={'0 1rem'} noFade checkForHeaders>
    <div class="flex-col-stretch flex-gap-2">
      <List
        bind:this={list}
        selectedObjectIds={$selection ?? []}
        {listProvider}
        createItemLabel={performance.string.CreateActionItem}
        createItemDialog={AssignTaskPopup}
        createItemDialogProps={{
          assignee: me,
          shouldSaveDraft: false
        }}
        _class={performance.class.PTask}
        config={[
          {
            key: '',
            displayProps: {
              fixed: 'right',
              key: 'id'
            }
          },
          {
            key: 'title'
          },
          {
            key: '',
            presenter: view.component.GrowPresenter
          },
          {
            key: 'blockedBy',
            presenter: BlockedByPresenter
          },
          {
            key: '',
            presenter: ProgressSummaryPresenter
          }
        ]}
        configurations={undefined}
        query={{
          kra: { $in: [...assignedKRAs, null] },
          assignee: me
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
          groupBy: ['kra'],
          orderBy: ['kra', SortingOrder.Ascending]
        }}
      />

      <!-- <GroupedList key="kra" items={tasks} categories={assignedKRAs}> -->
      <!--   <svelte:fragment slot="header" let:category let:count> -->
      <!--     <div class="flex-row-center flex-grow" style:color={'inherit'}> -->
      <!--       <KraRefPresenter value={category} kind="list-header" type="text" /> -->
      <!--       <span class="ml-2 font-medium-12">{count}</span> -->
      <!--     </div> -->
      <!--   </svelte:fragment> -->
      <!---->
      <!--   <svelte:fragment slot="item" let:item> -->
      <!--     <div class="m-4 flex-row-center justify-between flex-grow" style:minHeight={'3rem'}> -->
      <!--       <div class="flex-row-center"> -->
      <!--         <FixedColumn key="id" addClass="pr-4"> -->
      <!--           <TaskPresenter value={item} /> -->
      <!--         </FixedColumn> -->
      <!--         <FixedColumn key="status" justify="end" addClass="pr-4"> -->
      <!--           <StateRefPresenter value={item.status} space={item.space} shouldShowName={false} /> -->
      <!--         </FixedColumn> -->
      <!--         <FixedColumn key="name" addClass="pr-4"> -->
      <!--           <span class="text-ellipsis"> -->
      <!--             {item.title} -->
      <!--           </span> -->
      <!--         </FixedColumn> -->
      <!--       </div> -->
      <!---->
      <!--       <div class="flex-row-center"> -->
      <!--         <FixedColumn key="progress" justify="end"> -->
      <!--           <ProgressPresenter -->
      <!--             _class={item._class} -->
      <!--             value={item} -->
      <!--             props={{ -->
      <!--               readonly: true -->
      <!--             }} -->
      <!--           /> -->
      <!--         </FixedColumn> -->
      <!--       </div> -->
      <!--     </div> -->
      <!--   </svelte:fragment> -->
      <!-- </GroupedList> -->
    </div>
  </Scroller>
</div>
