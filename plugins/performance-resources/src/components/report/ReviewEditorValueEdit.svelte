<script lang="ts">
  import { Label } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { getCurrentAccount, Markup, Ref } from '@hcengineering/core'
  import { StyledTextBox } from '@hcengineering/text-editor-resources'
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import RolePresenter from '../team/RolePresenter.svelte'
  import { PersonAccount } from '@hcengineering/contact'

  export let reviewer: Ref<PersonAccount> | null
  export let content: Markup | null = ''
  export let score: number | null
  export let readonly = false

  $: if (reviewer == null) {
    reviewer = getCurrentAccount()._id as Ref<PersonAccount>
  }

  $: content = content ?? ''
</script>

{#if reviewer}
  <div class="flex-row-center justify-stretch flex-gap-4 review-input items-start">
    <PersonAccountRefPresenter avatarSize="medium" value={reviewer} shouldShowName={false} />
    <div class="flex-column flex-gap-1 justify-start flex-grow pl-4">
      <div class="flex-row-center flex-gap-1 items-start justify-start">
        <PersonAccountRefPresenter
          value={reviewer}
          avatarSize="medium"
          shouldShowAvatar={false}
          shouldShowName={true}
        />
        <span style="font-style: italic;">
          (<RolePresenter value={reviewer} />)
        </span>
        <Label label={performance.string.Comment} />
      </div>
      {#if content != null}
        <StyledTextBox
          {content}
          alwaysEdit
          placeholder={performance.string.ReviewContentPlaceholder}
          enableBackReferences={true}
          {readonly}
          on:value={(e) => {
            content = e.detail ?? ''
          }}
        />
      {/if}
    </div>

    <div class="score">
      <div class="flex-row-center flex-gap-1">
        <input datatype="number" class="score-input" bind:value={score} disabled={readonly} />
        <span class="score-postfix">/100</span>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .review-section {
    margin-bottom: 1rem;
    border: 1px solid var(--button-border-color);
    border-radius: 0.25rem;
  }

  .divider {
    height: 1px;
    background-color: var(--theme-divider-color);
    margin: 0.5rem 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--theme-goal-panel-header);
    padding: 0.5rem;
    border-radius: 0.25rem 0.25rem 0 0;
    color: white;

    &.collapsed {
      border-radius: 0.25rem;
    }
  }

  .content {
    padding: 0.75rem;
    padding-top: 0.5rem;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .review-input {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    .score {
      display: flex;
      flex-direction: column;
      align-items: center;

      .score-input {
        width: 100px;
        padding: 0.25rem;
        border: 1px solid var(--button-border-color);
        font-size: 2rem;
        text-align: center;
        border-radius: 0.25rem;
      }

      .score-postfix {
        font-size: 1.5rem;
        color: var(--theme-text-placeholder-color);
      }
    }
  }
</style>
