<script lang="ts">
  import { Ref, Role } from '@hcengineering/core'
  import { Icon } from '@hcengineering/ui'
  import kraTeam from '../plugins'
  export let value: Role | undefined
</script>

{#if value?.name === 'Team Manager'}
  <div class="flex-row-center flex-gap-2">
    <Icon size="small" icon={kraTeam.icon.Manager} />
    <span class="manager font-medium-14">Team Manager</span>
  </div>
{:else if value?.name === 'Team Member'}
  <span class="member">Team Member</span>
{/if}
