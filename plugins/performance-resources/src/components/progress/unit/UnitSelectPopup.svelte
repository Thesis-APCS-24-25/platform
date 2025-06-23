<script lang="ts">
  import { ObjectCreate, ObjectPopup } from '@hcengineering/presentation'
  import kra from '../../../../plugin'
  import { Project } from '@hcengineering/kra'
  import { Ref } from '@hcengineering/core'

  export let space: Ref<Project>

  const create: ObjectCreate = {
    label: kra.string.AddUnit,
    component: kra.component.AddUnitPopup,
    props: {
      space
    }
  }
</script>

<ObjectPopup
  ignoreObjects={[kra.ids.RatingScaleUnit]}
  _class={kra.class.Unit}
  {create}
  width="medium"
  size={'large'}
  type="presenter"
  on:close
  on:update
/>
