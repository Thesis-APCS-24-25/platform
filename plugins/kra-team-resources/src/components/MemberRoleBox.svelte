<script lang="ts">
  import { TeamType } from '@hcengineering/kra-team'
  import core from '@hcengineering/core'
  import { ObjectBoxPopup } from '@hcengineering/view-resources'

  export let typeType: TeamType | undefined

</script>

<ObjectBoxPopup
  _class={core.class.Role}
  selected={undefined}
  docQuery={{
    attachedTo: typeType?._id
  }}
/>
