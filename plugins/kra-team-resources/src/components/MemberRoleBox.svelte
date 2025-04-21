<script lang="ts">
  import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import { ObjectPopup } from '@hcengineering/presentation'
  import kraTeam, { TeamType } from '@hcengineering/kra-team'
  import core from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
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
