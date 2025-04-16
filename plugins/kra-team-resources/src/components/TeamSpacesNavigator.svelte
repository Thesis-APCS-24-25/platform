<script lang="ts">
  import { Team } from '@hcengineering/kra-team'
  import { TreeNode } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { Ref } from '@hcengineering/core'
  import TeamNavItem from './TeamNavItem.svelte'
  import { myTeams } from '../utils'

  let teams: Team[] = []
  export let currentTeam: Ref<Team> | undefined

  myTeams.subscribe((res) => {
    teams = res
  })
</script>

<TreeNode title={kraTeam.string.MyTeams}>
  {#each teams as team}
    <TeamNavItem {team} {currentTeam} />
  {/each}
</TreeNode>
