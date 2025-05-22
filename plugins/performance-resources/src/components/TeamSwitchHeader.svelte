<script lang="ts">
  import TeamSelector from './TeamSelector.svelte'
  import ActiveReviewSession from './ActiveReviewSession.svelte'
  import NewReviewSessionHeader from './NewReviewSessionHeader.svelte'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { getOrInitCurrentTeam } from '../utils/team'
  import { team } from '../store'
  import { onDestroy } from 'svelte'

  export let currentSpace: Ref<Team> | undefined = undefined

  void getOrInitCurrentTeam().then((team) => {
    currentSpace = team?._id
  })

  const unsub = team.subscribe((team) => {
    currentSpace = team
  })
  onDestroy(() => {
    unsub()
  })
</script>

<div class="antiNav-subheader subheader">
  <TeamSelector />
  {#if currentSpace !== undefined}
    <ActiveReviewSession {currentSpace} />
  {/if}
</div>
<NewReviewSessionHeader {currentSpace} />

<style lang="scss">
  .subheader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: fit-content;
  }
</style>
