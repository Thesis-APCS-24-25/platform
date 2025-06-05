<script lang="ts">
  import TeamSelector from '../team/TeamSelector.svelte'
</script>

<div class="antiNav-subheader subheader">
  <TeamSelector />
</div>

<style lang="scss">
  .subheader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: fit-content;
  }
</style>
