<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import SpaceSelector from '@hcengineering/presentation/src/components/SpaceSelector.svelte'
  import performance from '../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'

  export let currentTeam: Ref<Team> | undefined = undefined

  const me = getCurrentAccount()._id
  async function findDefaultSpace (): Promise<Team | undefined> {
    const client = getClient()
    return await client.findOne(kraTeam.class.Team, {
      members: me
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
/>
