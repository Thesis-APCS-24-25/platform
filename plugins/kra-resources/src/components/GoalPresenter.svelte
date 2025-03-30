<script lang="ts">
  import {
    ButtonKind,
    ButtonSize,
    Component
  } from '@hcengineering/ui'
  import { Goal, Issue } from '@hcengineering/kra'
  import { getClient } from '@hcengineering/presentation'
  import view, { AttributePresenter } from '@hcengineering/view'
  import { Doc, Space } from '@hcengineering/core'
  import { getGoal } from '../utils/goal'
  export let value: Issue

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  const client = getClient()

  let presenter: AttributePresenter | undefined

  let _value: Goal | undefined

  $: getGoal(value, (res) => {
    _value = res
  })
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
