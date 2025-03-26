<script lang="ts">
  import {
    AnySvelteComponent,
    Button,
    ButtonKind,
    ButtonSize,
    Component,
    eventToHTMLElement,
    showPopup
  } from '@hcengineering/ui'
  import { Goal, Issue } from '@hcengineering/kra'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import view, { AttributePresenter } from '@hcengineering/view'
  import kra from '../plugin'
  import KpiPresenter from './KpiPresenter.svelte'
  import RatingScalePresenter from './RatingScalePresenter.svelte'

  export let value: Issue

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'large'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  const client = getClient()

  const goalQuery = createQuery()

  let presenter: any | undefined

  let _value: Goal | undefined

  goalQuery.query(
    kra.class.Goal,
    {
      _id: value.goal
    },
    (res) => {
      _value = res[0]
    },
    {
      limit: 1
    }
  )
  $: presenter =
    _value !== undefined
      ? client.findOne(view.mixin.AttributePresenter, {
          _class: _value._class
        })
      : undefined
</script>

{presenter}

{#if value}
  {#await presenter then presenter}
    {#if presenter}
      <Component is={presenter.presenter} props={{ value }} />
    {/if}
  {/await}
{/if}
