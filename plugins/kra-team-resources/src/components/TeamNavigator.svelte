<script lang="ts">
  import kraTeam from '../plugins'
  import { Label, Scroller } from '@hcengineering/ui'
  import TeamSpacesNavigator from './TeamSpacesNavigator.svelte'
  import { NavFooter } from '@hcengineering/workbench-resources'

</script>

<div class="hulyNavPanel-header">
  <span class="overflow-label">
    <Label label={kraTeam.string.Team} />
  </span>
</div>

<Scroller shrink>
    <TeamSpacesNavigator />
</Scroller>
<NavFooter />
