<script lang="ts">
  import { ObjectPopup } from '@hcengineering/presentation'
  import { TeamType } from '@hcengineering/kra-team'
  import core, { Ref, Role } from '@hcengineering/core'

  export let typeType: TeamType | undefined
  export let selected: Ref<Role> | undefined = undefined
</script>

<ObjectPopup
  _class={core.class.Role}
  {selected}
  docQuery={{
    attachedTo: typeType?._id
  }}
  on:close
>
  <svelte:fragment slot="item" let:item={role}>
    <div class="flex flex-grow overflow-label">
      {role.name}
    </div>
  </svelte:fragment>
</ObjectPopup>
