<script lang="ts">
  import { ButtonSize, Component } from '@hcengineering/ui'
  import { Goal, Issue } from '@hcengineering/kra'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import view, { AttributePresenter } from '@hcengineering/view'
  import { Doc, Space, WithLookup } from '@hcengineering/core'
  import kra from '../../../plugin'
  import { GoalPresenterKind } from '../../../types'

  export let value: WithLookup<Issue>

  export let kind: ButtonKind
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  const client = getClient()
  const goalQuery = createQuery()

  let presenter: AttributePresenter | undefined

  let _value: Goal | undefined = value.$lookup?.goal

  $: if (_value === undefined) {
    goalQuery.query(
      kra.class.Goal,
      {
        _id: value.goal
      },
      (res) => {
        if (res.length > 0) {
          _value = res[0]
        } else {
          _value = undefined
        }
      },
      {
        lookup: {
          unit: kra.class.Unit
        }
      }
    )
  }

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
      issue: value,
      kind,
      size,
      justify,
      width,
      focusIndex
    }}
  />
{/if}
