<script lang="ts">
  import performance from '../../../plugin'
  import { Unit } from '@hcengineering/performance'
  import { ObjectCreate } from '@hcengineering/presentation'
  import ObjectBox from '@hcengineering/view-resources/src/components/ObjectBox.svelte'
  import { Ref, Space } from '@hcengineering/core'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'

  export let space: Ref<Space>
  export let value: Ref<Unit> | null = null

  export let focusIndex = -1

  export let size: ButtonSize = 'large'
  export let kind: ButtonKind = 'regular'
  export let width: string | undefined = undefined

  const create: ObjectCreate = {
    label: performance.string.AddUnit,
    component: performance.component.AddUnitPopup,
    props: {
      space
    }
  }
</script>

<ObjectBox
  {size}
  {kind}
  {width}
  label={performance.string.SelectUnit}
  _class={performance.class.Unit}
  placeholder={performance.string.AddUnit}
  showNavigate={false}
  icon={performance.icon.Issue}
  bind:value
  {create}
  {focusIndex}
/>
