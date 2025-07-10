<script lang="ts">
  import { Ref, Role } from '@hcengineering/core'
  import { Icon, Label } from '@hcengineering/ui'
  import kraTeam from '../plugins'
  export let value: Role | undefined
</script>

{#if value?.name === 'Team Manager'}
  <div class="flex-row-center flex-gap-2">
    <Icon size="small" icon={kraTeam.icon.Manager} />
    <span class="manager font-medium-14"><Label label={kraTeam.string.TeamManager}/></span>
  </div>
{:else if value?.name === 'Team Member'}
  <span class="member"><Label label={kraTeam.string.TeamMember}/></span>
{/if}
