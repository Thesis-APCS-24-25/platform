<script lang="ts">
  import { PersonRefPresenter } from '@hcengineering/contact-resources'
  import { ProgressReport } from '@hcengineering/performance'
  import { DatePresenter, Label } from '@hcengineering/ui'
  import kra from '../../../plugin'
  import { MarkupPresenter } from '@hcengineering/view-resources'

  export let value: ProgressReport

  $: emptyNote = value.note === undefined || value.note === null || value.note.trim() === ''
</script>

<div class="container">
  <div class="title"></div>

  <div class="content">
    <div class="flex-row-center justify-between">
      <PersonRefPresenter value={value.reportBy} shouldShowName={false} />
      <DatePresenter value={value.modifiedOn} />
    </div>

    {#if value.value !== undefined && value.value !== null}
      <div class="value">Value: {value.value}</div>
    {/if}

    {#if !emptyNote}
      <div class="description">
        <MarkupPresenter value={value.note} />
      </div>
    {:else}
      <div class="description">
        <Label label={kra.string.NoNote} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.25rem;
  }

  .content {
    padding: 0.5rem;
  }

  .description {
    text-wrap: balance;
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  .value {
    margin-top: 0.5rem;
    font-weight: bold;
  }
</style>
