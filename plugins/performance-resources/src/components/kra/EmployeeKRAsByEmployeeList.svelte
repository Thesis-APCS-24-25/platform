<script lang="ts">
  import { Doc, Ref, SortingOrder, TypedSpace } from '@hcengineering/core'
  import { List, ListSelectionProvider, SelectDirection } from '@hcengineering/view-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import performance from '../../plugin'
  import view from '@hcengineering/view'
  import { Scroller } from '@hcengineering/ui'

  // export let members: Ref<Member>[]
  export let space: Ref<TypedSpace>
  export let allowEditKRAStatus: boolean = true
  // export let canAssign: boolean = false

  // const shouldWarn = (value: number | undefined): boolean => {
  //   return value === undefined || Math.abs(value - 1) > 0.0001
  // }

  // $: members = members.sort((a, b) => {
  //   const me = getCurrentAccount().person
  //   if (a === me) return -1
  //   if (b === me) return 1
  //   return 0
  // })
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
  let scroll: Scroller
</script>

<Scroller bind:this={scroll}>
  <List
    selectedObjectIds={$selection ?? []}
    bind:this={list}
    {listProvider}
    config={[
      {
        key: 'kra',
        props: {
          shrink: 0
        }
      },
      {
        key: '',
        presenter: view.component.GrowPresenter
      },
      {
        key: 'comments',
        displayProps: {
          key: 'comments'
        }
      },
      {
        key: 'status',
        props: {
          disabled: !allowEditKRAStatus
        }
      },
      {
        key: '',
        presenter: KraWeightEditorWithPopup,
        // props: {
        //   readonly: !canAssign
        // },
        displayProps: {
          key: 'weight',
          dividerBefore: true,
          fixed: 'right',
          align: 'right'
        }
      }
    ]}
    configurations={undefined}
    query={{
      space
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
      groupBy: ['assignee'],
      orderBy: ['kra', SortingOrder.Ascending]
    }}
    _class={performance.class.EmployeeKRA}
  />
</Scroller>
