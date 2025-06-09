<script lang="ts">
  import { Ref, SortingOrder, Space, getCurrentAccount } from '@hcengineering/core'
  import { Breadcrumb, getPlatformColorDef, Header, Scroller, themeStore } from '@hcengineering/ui'
  import { createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { KRA, WithKRA } from '@hcengineering/performance'
  import GroupedList from '../ui/GroupedList.svelte'
  import KraRefPresenter from './KRARefPresenter.svelte'
  import { FixedColumn, List, ListSelectionProvider } from '@hcengineering/view-resources'
  import TaskPresenter from '@hcengineering/task-resources/src/components/TaskPresenter.svelte'
  import StateRefPresenter from '@hcengineering/task-resources/src/components/state/StateRefPresenter.svelte'
  import ProgressPresenter from './ProgressPresenter.svelte'
  import view from '@hcengineering/view'

  export let currentSpace: Ref<Space>

  const userId = getCurrentAccount()._id as Ref<PersonAccount>
  const actionItemQuery = createQuery()
  let tasks: WithKRA[] = []
  $: actionItemQuery.query(performance.mixin.WithKRA, {}, (res) => {
    if (res !== undefined) {
      tasks = res
    }
  })

  let assignedKRAs: Ref<KRA>[] = []
  const assignedKRAsQuery = createQuery()
  $: assignedKRAsQuery.query(
    performance.class.EmployeeKRA,
    {
      employee: userId,
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
  const listProvider = new ListSelectionProvider((offset: 1 | -1 | 0) => {})
</script>

<Header>
  <Breadcrumb icon={performance.icon.KRA} label={performance.string.MyKRAs} size={'large'} isCurrent />
</Header>

<div class="w-full h-full py-4 clear-mins">
  <Scroller bind:this={scroll} bind:divScroll padding={'0 1rem'} noFade checkForHeaders>
    <div class="flex-col-stretch flex-gap-2">
      <List
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
            presenter: ProgressPresenter,
            props: {
              readonly: true
            }
          }
        ]}
        configurations={undefined}
        query={{
          kra: { $in: assignedKRAs }
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
        _class={performance.mixin.WithKRA}
      />

      <GroupedList key="kra" items={tasks} categories={assignedKRAs}>
        <svelte:fragment slot="header" let:category let:count>
          <div class="flex-row-center flex-grow" style:color={'inherit'}>
            <KraRefPresenter value={category} kind="list-header" type="text" />
            <span class="ml-2 font-medium-12">{count}</span>
          </div>
        </svelte:fragment>

        <svelte:fragment slot="item" let:item>
          <div class="m-4 flex-row-center justify-between flex-grow" style:minHeight={'3rem'}>
            <div class="flex-row-center">
              <FixedColumn key="id" addClass="pr-4">
                <TaskPresenter value={item} />
              </FixedColumn>
              <FixedColumn key="status" justify="end" addClass="pr-4">
                <StateRefPresenter value={item.status} space={item.space} shouldShowName={false} />
              </FixedColumn>
              <FixedColumn key="name" addClass="pr-4">
                <span class="text-ellipsis">
                  {item.title}
                </span>
              </FixedColumn>
            </div>

            <div class="flex-row-center">
              <FixedColumn key="progress" justify="end">
                <ProgressPresenter
                  _class={item._class}
                  value={item}
                  props={{
                    readonly: true
                  }}
                />
              </FixedColumn>
            </div>
          </div>
        </svelte:fragment>
      </GroupedList>
    </div>
  </Scroller>
</div>
