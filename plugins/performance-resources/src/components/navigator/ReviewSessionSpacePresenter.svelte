<script lang="ts">
  import { Ref, Space } from '@hcengineering/core'
  import { ReviewSession } from '@hcengineering/performance'
  // import { Icon, IconWithEmoji, getPlatformColorDef, getPlatformColorForTextDef, themeStore } from '@hcengineering/ui'
  // import performance from '../../plugin'

  import { NavLink } from '@hcengineering/view-resources'
  import { SpecialElement } from '@hcengineering/workbench-resources'
  
  export let space: ReviewSession
  export let currentSpace: Ref<Space> | undefined
  export let deselect: boolean = false
</script>
  
  {#if space}
    <NavLink space={space._id}>
      <SpecialElement
        indent
        label={space.name}
        selected={deselect ? false : currentSpace === space._id}
      />
    </NavLink>
  {/if}