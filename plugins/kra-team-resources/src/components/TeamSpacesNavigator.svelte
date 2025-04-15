<script lang="ts">
  import { Team } from '@hcengineering/kra-team'
  import { createQuery } from '@hcengineering/presentation'
  import kraTeam from '../plugins'
  import core from '@hcengineering/core'
  import TeamNavItem from './TeamNavItem.svelte'

  let teams: Team[] = []

  const teamQuery = createQuery()
  teamQuery.query(kraTeam.class.Team, {}, (res) => {
    teams = res
  })
</script>

{#each teams as team}
  <TeamNavItem {team} />
{/each}
