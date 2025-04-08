<script lang="ts">
  import { ObjectCreate, ObjectPopup } from '@hcengineering/presentation'
  import kra from '../../../../plugin'
  import { Issue } from '@hcengineering/kra'

  export let issue: Issue

  const create: ObjectCreate = {
    label: kra.string.AddUnit,
    component: kra.component.AddUnitPopup,
    props: {
      issue
    }
  }
</script>

<ObjectPopup _class={kra.class.Unit} {create} width="medium" size={'large'} type="presenter" on:close on:update/>
