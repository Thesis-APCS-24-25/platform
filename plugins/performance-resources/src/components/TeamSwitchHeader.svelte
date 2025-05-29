<script lang="ts">
  import TeamSelector from './TeamSelector.svelte'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'

  export let currentTeam: Ref<Team> | undefined = undefined
</script>

<div class="antiNav-subheader subheader">
  <TeamSelector bind:currentTeam/>
</div>

<style lang="scss">
  .subheader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: fit-content;
  }
</style>
