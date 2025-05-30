<script lang="ts">
  import { Button, showPopup } from '@hcengineering/ui'
  import CreateReviewSession from './CreateReviewSession.svelte'
</script>

<Button
  on:click={() => {
    showPopup(CreateReviewSession, {}, 'center')
  }}
/>
