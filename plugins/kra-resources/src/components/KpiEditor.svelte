<script lang="ts">
  import { Button, ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import KpiPresenter from './KpiPresenter.svelte'
  import KpiEditPopup from './KpiEditPopup.svelte'
  import { Kpi } from '@hcengineering/kra'

  // TODO: use issue value instead of hardcoding
  export let value: Kpi
  export let isValueEditable: boolean = true
  export let isTargetEditable: boolean = true

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'large'
  export let justify: 'left' | 'center' = 'left'
  export let width: string | undefined = undefined
  export let focusIndex: number | undefined = undefined

  function handleKpiEditorOpen (ev: MouseEvent) {
    showPopup(
      KpiEditPopup,
      {
        value
      },
      'top'
    )
  }
</script>

KpiEditor

<Button {kind} {size} {justify} {width} {focusIndex} on:click={handleKpiEditorOpen}>
  <KpiPresenter slot="content" {value} />
</Button>
