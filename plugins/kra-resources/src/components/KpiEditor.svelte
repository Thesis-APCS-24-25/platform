<script lang="ts">
  import { Button, ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiPresenter from './KpiPresenter.svelte'
  import KpiEditPopup from './KpiEditPopup.svelte'

  // TODO: use issue value instead of hardcoding
  export let value: number
  export let unit: string
  export let target: number
  export let isValueEditable: boolean = true
  export let isTargetEditable: boolean = true

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'large'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  function handleKpiEditorOpen(ev: MouseEvent) {
    showPopup(
      KpiEditPopup,
      {
        value,
        target,
        unit
      },
      'top'
    )
  }
</script>

<Button {kind} {size} {justify} {width} {focusIndex} on:click={handleKpiEditorOpen}>
  <KpiPresenter slot="content" {value} {target} {unit} />
</Button>
