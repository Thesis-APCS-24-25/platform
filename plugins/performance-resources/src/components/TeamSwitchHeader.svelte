<script lang="ts">
  import TeamSelector from './TeamSelector.svelte'
  import ReviewSessionSelector from './ReviewSessionSelector.svelte'
  import NewReviewSessionHeader from './NewReviewSessionHeader.svelte'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { ReviewSession } from '@hcengineering/performance'

  export let currentTeam: Ref<Team> | undefined = undefined
  export let currentReviewSession: Ref<ReviewSession> | undefined = undefined
</script>

<div class="antiNav-subheader subheader">
  <TeamSelector bind:currentTeam/>
  {#if currentTeam !== undefined}
    <ReviewSessionSelector {currentTeam} bind:currentReviewSession/>
  {/if}
</div>
<NewReviewSessionHeader currentSpace={currentReviewSession} />

<style lang="scss">
  .subheader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: fit-content;
  }
</style>
