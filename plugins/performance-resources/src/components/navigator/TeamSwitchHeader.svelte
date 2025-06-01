<script lang="ts">
  import TeamSelector from '../team/TeamSelector.svelte'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { currentTeam as selectedTeam } from '../../utils/team'
  import performance from '../../plugin'
  import { getCurrentLocation, Location, navigate } from '@hcengineering/ui'

  function onChange (event: CustomEvent<Ref<Team> | undefined>): void {
    if ($selectedTeam === event.detail) {
      return
    }
    $selectedTeam = event.detail
    localStorage.setItem(performance.string.SelectTeam, event.detail ?? '')
    const cur = getCurrentLocation()
    const loc: Location = {
      path: [cur.path[0], cur.path[1], cur.path[2]],
      fragment: cur.fragment
    }
    navigate(loc)
    // NOTE: This is a workaround for the fact that the team selector does not update the current team in the store
    // should be considered fixing in the future
    window.location.reload()
  }
</script>

<div class="antiNav-subheader subheader">
  <TeamSelector on:change={onChange} />
</div>

<style lang="scss">
  .subheader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: fit-content;
  }
</style>
