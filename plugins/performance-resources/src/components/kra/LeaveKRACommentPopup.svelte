<script lang="ts">
  import { ChatMessageInput } from '@hcengineering/chunter-resources'
  import { EmployeeKRA } from '@hcengineering/performance'
  import { IconCheckCircle, Label } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { createEventDispatcher } from 'svelte'

  export let object: EmployeeKRA
  export let waitToClose: boolean = false
  const dispatch = createEventDispatcher()
  function onSubmit (): void {
    waitToClose = true
    setTimeout(() => {
      dispatch('close', true)
      waitToClose = false
    }, 1000)
  }
</script>

<div class="container">
  <span>
    <Label label={performance.string.LeaveComment} />
  </span>
  <div class="chat">
    <ChatMessageInput {object} on:submit={onSubmit} autofocus shouldSaveDraft={false}/>
  </div>
  {#if waitToClose}
    <div class="notify">
      <IconCheckCircle size="small" fill="green" />
      <Label label={performance.string.ReviewSubmitted} />
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--theme-popup-color);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    box-shadow: var(--theme-popup-shadow);
  }

  .chat {
    margin-top: 0.5rem;
  }

  .notify {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
</style>
