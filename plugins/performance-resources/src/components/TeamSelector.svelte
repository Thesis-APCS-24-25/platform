<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import SpaceSelector from '@hcengineering/presentation/src/components/SpaceSelector.svelte'
  import performance from '../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import { currentTeam as selectedTeam } from '../utils/team'
  import { getCurrentLocation, navigate, setResolvedLocation } from '@hcengineering/ui'

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

  function onChange (event: CustomEvent<Ref<Team> | undefined>): void {
    if ($selectedTeam === event.detail) {
      return
    }
    $selectedTeam = event.detail
    localStorage.setItem(performance.string.SelectTeam, event.detail ?? '')
    const cur = getCurrentLocation()
    navigate(cur)
    // NOTE: This is a workaround for the fact that the team selector does not update the current team in the store
    // should be considered fixing in the future
    window.location.reload()
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
  on:change={onChange}
/>
