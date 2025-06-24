<script lang="ts">
  import { ButtonKind, ButtonSize, Component, eventToHTMLElement, Loading, showPopup } from '@hcengineering/ui'
  import { Progress, PTask } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import view, { AttributePresenter } from '@hcengineering/view'
  import { Doc, Space, WithLookup } from '@hcengineering/core'
  import performance from '../../plugin'
  import KpiPresenter from './kpi/KpiPresenter.svelte'
  import task from '@hcengineering/task'
  import ProgressBar from './ProgressBar.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import ProgressReportsPopup from './ProgressReportsPopup.svelte'

  export let value: WithLookup<PTask>

  export let kind: ButtonKind
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined
  export let disabled: boolean | undefined = false
  export let readonly: boolean | undefined = false

  if (readonly || disabled) {
    readonly = true
    disabled = true
  }

  const progressQuery = createQuery()

  let _value: Progress | undefined = value.$lookup?.progress

  $: if (_value === undefined) {
    progressQuery.query(
      performance.class.Progress,
      {
        _id: value.progress
      },
      (res) => {
        if (res.length > 0) {
          _value = res[0]
        } else {
          _value = undefined
        }
      }
    )
  }

  function handleOpenEditor (sum: number, e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      ProgressReportsPopup,
      {
        task: value,
        progress: _value,
        sum
      },
      eventToHTMLElement(e)
    )
  }
</script>

{#if _value !== undefined && _value._class === performance.class.Progress}
  <GoalPresenterContainer
    disabled={readonly}
    {kind}
    {size}
    onClick={handleOpenEditor.bind(null, _value.progress ?? 0)}
    showTooltip={{
      label: performance.string.Name,
      props: {
        name: _value.name
      }
    }}
  >
    {#if _value.target > 0}
      <div class="bar">
        <!-- TODO: Turn this into progress bar component -->
        <ProgressBar value={_value.progress ?? 0} />
      </div>
    {/if}
    <div class="separator"></div>
    <span class="kpi-num">{_value.progress ?? 0}%</span>
  </GoalPresenterContainer>
{:else if _value !== undefined && _value._class === performance.class.Kpi}
  <KpiPresenter task={value} value={_value} {size} {kind} {readonly} />
{/if}

  <style lang="scss">
    .separator {
      width: 1px;
      height: 16px;
      margin: 0 8px;
      background-color: var(--theme-divider-color, #e0e0e0);
    }

    .unit-symbol {
      margin: 0 0.25rem;
      color: var(--theme-halfcontent-color);
    }

    .kpi-num {
      color: var(--theme-halfcontent-color);
    }

    .bar {
      min-width: 4rem;
    }
  </style>
