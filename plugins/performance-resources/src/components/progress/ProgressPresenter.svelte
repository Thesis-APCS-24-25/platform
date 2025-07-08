<script lang="ts">
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { Kpi, Progress, PTask } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import KpiPresenter from './kpi/KpiPresenter.svelte'
  import ProgressPresenter from './BaseProgressPresenter.svelte'
  import { WithLookup } from '@hcengineering/core'

  export let value: WithLookup<PTask>

  export let kind: ButtonKind
  export let size: ButtonSize = 'small'
  export let disabled: boolean | undefined = false
  export let readonly: boolean | undefined = false

  if (readonly || disabled) {
    readonly = true
    disabled = true
  }

  const progressQuery = createQuery()

  let _value: Progress | undefined = value.$lookup?.progress

  function asKpi (p: Progress): Kpi | undefined {
    return p._class === performance.class.Kpi ? (p as Kpi) : undefined
  }

  $: if (_value === undefined && value.progress != null) {
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
</script>

{#if _value !== undefined && _value._class === performance.class.Progress}
  <ProgressPresenter task={value} value={_value} {size} {kind} {readonly} />
{:else if _value !== undefined && _value._class === performance.class.Kpi}
  {@const kpi = asKpi(_value)}
  {#if kpi}
    <KpiPresenter task={value} value={kpi} {size} {kind} {readonly} />
  {/if}
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
