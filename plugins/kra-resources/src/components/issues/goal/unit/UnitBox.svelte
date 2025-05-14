<script lang="ts">
  import kra from '../../../../plugin'
  import { Project, Unit } from '@hcengineering/kra'
  import { ObjectCreate } from '@hcengineering/presentation'
  import ObjectBox from '@hcengineering/view-resources/src/components/ObjectBox.svelte'
  import { Ref } from '@hcengineering/core'

  export let space: Ref<Project>
  export let value: Ref<Unit> | null = null

  export let focusIndex = -1

  const create: ObjectCreate = {
    label: kra.string.AddUnit,
    component: kra.component.AddUnitPopup,
    props: {
      space
    }
  }
</script>

<ObjectBox
  size="large"
  kind="regular"
  label={kra.string.SelectUnit}
  _class={kra.class.Unit}
  placeholder={kra.string.AddUnit}
  showNavigate={false}
  icon={kra.icon.Issue}
  bind:value
  {create}
  {focusIndex}
/>
