<script lang="ts">
  import { Button, showPopup } from "@hcengineering/ui"
  import CreateReviewSession from "./CreateReviewSession.svelte"
</script>
  
  <div class="antiNav-subheader" >
  <Button
    width="100%"
    justify="left"
    kind='primary'
    label="Create Review Session"
    on:click={(_) => {showPopup(CreateReviewSession)}}
  />
  </div>