<script lang="ts">
  import {
    ButtonKind,
    ButtonSize,
    Component  } from '@hcengineering/ui'
  import { Goal, Issue } from '@hcengineering/kra'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import view, { AttributePresenter } from '@hcengineering/view'
  import kra from '../plugin'
  import { Doc, Space } from '@hcengineering/core'
  
  export let value: Issue

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  const client = getClient()

  const goalQuery = createQuery()

  let presenter: AttributePresenter | undefined

  let _value: Goal | undefined

  goalQuery.query(
    kra.class.Goal,
    {
      _id: value.goal
    },
    (res) => {
      _value = res.shift()
    }
  )
  $: presenter =
    _value !== undefined
      ? client
          .getHierarchy()
          .classHierarchyMixin<Doc<Space>, AttributePresenter>(_value._class, view.mixin.AttributePresenter)
      : undefined
</script>

{#if presenter !== undefined}
  <Component
    is={presenter.presenter}
    props={{
      value: _value,
      kind,
      size,
      justify,
      width,
      focusIndex
    }}
  />
{/if}
