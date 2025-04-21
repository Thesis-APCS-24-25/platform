<script lang="ts">
  import kraTeam from '../plugins'
  import { Label, Scroller } from '@hcengineering/ui'
  import TeamSpacesNavigator from './TeamSpacesNavigator.svelte'
  import { NavFooter } from '@hcengineering/workbench-resources'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'

  export let currentTeam: Ref<Team> | undefined
</script>

<Scroller shrink>
  <TeamSpacesNavigator {currentTeam} />
</Scroller>
<NavFooter />
