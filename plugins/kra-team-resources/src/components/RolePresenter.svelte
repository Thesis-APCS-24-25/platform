<script lang="ts">
  import { Ref, Role } from '@hcengineering/core'
  export let value: Role | undefined
  export let inline: boolean = false
  export let accent: boolean = false
  export let colorInherit: boolean = false
  export let shouldShowAvatar: boolean = true
  export let noUnderline: boolean = true
  export let disabled: boolean = false
  export let shouldShowName: boolean = true
  export let shrink: number = 1

</script>

{value?.name}
