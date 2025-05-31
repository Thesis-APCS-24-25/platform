<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import SpaceSelector from '@hcengineering/presentation/src/components/SpaceSelector.svelte'
  import performance from '../../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import { currentTeam as selectedTeam } from '../../utils/team'

  export let currentTeam: Ref<Team> | undefined = undefined

  const me = getCurrentAccount()._id
  async function findDefaultSpace (): Promise<Team | undefined> {
    const client = getClient()
    $selectedTeam = localStorage.getItem(performance.string.SelectTeam) as Ref<Team> | undefined
    if ($selectedTeam === undefined) {
      const team = await client.findOne(kraTeam.class.Team, {
        members: me
      })
      if (team !== undefined) {
        $selectedTeam = team._id
        localStorage.setItem(performance.string.SelectTeam, team._id)
      }
      return team
    }
    return await client.findOne(kraTeam.class.Team, {
      _id: $selectedTeam
    })
  }
</script>

<SpaceSelector
  bind:space={currentTeam}
  size="large"
  kind="contrast"
  width="100%"
  shape="round2"
  justify="left"
  label={performance.string.SelectTeam}
  _class={kraTeam.class.Team}
  query={{
    members: me
  }}
  {findDefaultSpace}
  on:change
/>
