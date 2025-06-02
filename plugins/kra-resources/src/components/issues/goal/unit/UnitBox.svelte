<script lang="ts">
  import kra from '../../../../plugin'
  import { Unit } from '@hcengineering/kra'
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
    label: kra.string.AddUnit,
    component: kra.component.AddUnitPopup,
    props: {
      space
    }
  }
</script>

<ObjectBox
  {size}
  {kind}
  {width}
  label={kra.string.SelectUnit}
  _class={kra.class.Unit}
  placeholder={kra.string.AddUnit}
  showNavigate={false}
  icon={kra.icon.Issue}
  bind:value
  {create}
  {focusIndex}
/>
