<script lang="ts">
  import { NavLink } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { kraTeamId, Team } from '@hcengineering/kra-team'

  export let team: Team
</script>

<div class="hulyNavPanel-item">
  <NavLink app={'kra-team'} space={team._id} special={'members'} shrink={1}>
    <div class="hulyNavPanel-item-content">
      <span class="hulyNavPanel-item-label">{team.name}</span>
    </div>
  </NavLink>
</div>
