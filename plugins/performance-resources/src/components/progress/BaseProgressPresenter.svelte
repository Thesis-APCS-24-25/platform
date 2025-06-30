
<script lang="ts">
  import { ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import { Progress, PTask } from '@hcengineering/performance'
  import performance from '../../plugin'
  import ProgressCircle from './ProgressCircle.svelte'
  import GoalPresenterContainer from './ProgressPresenterContainer.svelte'
  import ProgressReportsPopup from './ProgressReportsPopup.svelte'

  export let value: Progress
  export let task: PTask

  export let kind: ButtonKind
  export let size: ButtonSize = 'small'
  export let disabled: boolean | undefined = false
  export let readonly: boolean | undefined = false

  if (readonly || disabled) {
    readonly = true
    disabled = true
  }

  function handleOpenEditor (sum: number, e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      ProgressReportsPopup,
      {
        task,
        progress: value,
        sum
      },
      eventToHTMLElement(e)
    )
  }
</script>

<GoalPresenterContainer
  disabled={readonly}
  {kind}
  {size}
  onClick={handleOpenEditor.bind(null, value.progress ?? 0)}
  showTooltip={{
    label: performance.string.Name,
    props: {
      name: value.name
    }
  }}
>
  <ProgressCircle {value} />
  <div class="separator"></div>
  <span class="kpi-num">{value.progress ?? 0}%</span>
</GoalPresenterContainer>

<style lang="scss">
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }

  .kpi-num {
    color: var(--theme-halfcontent-color);
  }
</style>
