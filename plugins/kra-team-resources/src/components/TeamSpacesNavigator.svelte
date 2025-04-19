<script lang="ts">
  import { Team } from '@hcengineering/kra-team'
  import { TreeNode } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { Ref } from '@hcengineering/core'
  import TeamNavItem from './TeamNavItem.svelte'
  import { myTeams } from '../utils'
  import { Action, IconAdd, showPopup, themeStore } from '@hcengineering/ui'
  import CreateTeam from './CreateTeam.svelte'
  import { createEventDispatcher } from 'svelte'
    import { translateCB } from '@hcengineering/platform'

  let teams: Team[] = []
  export let currentTeam: Ref<Team> | undefined

  myTeams.subscribe((res) => {
    teams = res
  })

  const dispatch = createEventDispatcher()

  const addSpace: Action = {
    label: kraTeam.string.CreateTeam,
    icon: IconAdd,
    action: async (): Promise<void> => {
      dispatch('open')
      showPopup(CreateTeam, {}, 'top')
    }
  }

  async function actions (): Promise<Action[]> {
    return [addSpace]
  }

  let title: string | undefined
  $: translateCB(kraTeam.string.MyTeams, {}, $themeStore.language, (res) => {
    title = res
  })
</script>

<TreeNode {title} {actions}>
  {#each teams as team}
    <TeamNavItem {team} {currentTeam} />
  {/each}
</TreeNode>
