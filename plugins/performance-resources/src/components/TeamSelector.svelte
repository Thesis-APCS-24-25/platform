<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import { getOrInitCurrentTeam, switchCurrentTeam } from '../utils/team'
  import SpaceSelector from '@hcengineering/presentation/src/components/SpaceSelector.svelte'
  import performance from '../plugin'
  import { Ref } from '@hcengineering/core'

  const currentTeam = getOrInitCurrentTeam()
  async function handleSpaceChanged (e: CustomEvent<Ref<Team> | undefined>): Promise<void> {
    const team = e.detail
    if (team !== undefined) {
      await switchCurrentTeam(team)
    }
  }
</script>

{#await currentTeam then currentTeam}
  <SpaceSelector
    space={currentTeam?._id}
    size="large"
    kind="contrast"
    width="100%"
    shape="round2"
    justify="left"
    label={performance.string.SelectTeam}
    _class={kraTeam.class.Team}
    findDefaultSpace={getOrInitCurrentTeam}
    on:change={handleSpaceChanged}
  />
{/await}
