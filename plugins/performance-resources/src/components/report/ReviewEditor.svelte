<script lang="ts">
  import {
    Label,
    ButtonIcon,
    Icon,
    IconCheck,
    IconClose,
    IconDelete,
    IconAdd,
    showPopup
  } from '@hcengineering/ui'
  import { getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { checkPermission, getCurrentAccount, Ref, WithLookup } from '@hcengineering/core'
  import { PerformanceReport } from '@hcengineering/performance'
  import { PersonAccount } from '@hcengineering/contact'
  import kraTeam from '@hcengineering/kra-team'
  import { currentTeam } from '../../utils/team'
  import ReviewEditorValueEdit from './ReviewEditorValueEdit.svelte'
  import { IntlString } from '@hcengineering/platform'

  const client = getClient()

  export let object: WithLookup<PerformanceReport>

  const isCollapsed = false

  const reviewer: Ref<PersonAccount> | undefined = getCurrentAccount()._id as Ref<PersonAccount>

  let canReview = false
  currentTeam.subscribe((team) => {
    if (team === undefined) return
    void checkPermission(client, kraTeam.permission.GradeReport, team).then((result) => {
      canReview = result
    })
  })

  let editting = false

  $: notReviewYet = object.reviewer == null || object.score == null

  $: canSave = object.score != null

  $: isReviewer = getCurrentAccount()._id === object.reviewer

  let error: IntlString | null = null
</script>

<div class="review-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={performance.icon.PerformanceReview} size={'medium'} />
    <Label label={performance.string.Reviews} />
    {#if canReview && (isReviewer || notReviewYet)}
      {#if editting}
        <div class="flex-row-center flex-gap-1">
          <ButtonIcon
            icon={IconClose}
            kind="tertiary"
            size="small"
            on:click={async () => {
              editting = false
            }}
            inheritColor
            tooltip={{
              label: performance.string.Cancel
            }}
          />
          <ButtonIcon
            icon={IconCheck}
            kind="tertiary"
            size="small"
            on:click={async () => {
              if (!canSave) {
                error = performance.string.ScoreIsRequired
                setTimeout(() => {
                  error = null
                }, 3000)

                return
              }
              await client.updateDoc(performance.class.PerformanceReport, object.space, object._id, {
                content: object.content,
                score: object.score,
                reviewer
              })
              editting = false
            }}
            inheritColor
            tooltip={{
              label: performance.string.AddPerformanceReview
            }}
          />
        </div>
      {:else}
        <div class="flex-row-center flex-gap-1">
          {#if notReviewYet}
            <ButtonIcon
              icon={IconAdd}
              kind="tertiary"
              size="small"
              on:click={() => {
                editting = true
              }}
              inheritColor
              tooltip={{
                label: performance.string.AddPerformanceReview
              }}
            />
          {:else}
            <ButtonIcon
              icon={IconDelete}
              kind="tertiary"
              size="small"
              on:click={async () => {
                showPopup(
                  MessageBox,
                  {
                    label: performance.string.RemovePerformanceReview,
                    message: performance.string.AreYouSureYouWantToRemovePerformanceReview
                  },
                  'top',
                  async (confirm) => {
                    if (confirm === true) {
                      object.content = ''
                      object.score = null
                      object.reviewer = null
                      await client.update(object, {
                        content: object.content,
                        score: object.score,
                        reviewer: object.reviewer
                      })
                    }
                  }
                )
              }}
              inheritColor
              tooltip={{
                label: performance.string.RemovePerformanceReview
              }}
            />
            <ButtonIcon
              icon={performance.icon.PerformanceReview}
              kind="tertiary"
              size="small"
              on:click={() => {
                editting = true
              }}
              inheritColor
              tooltip={{
                label: performance.string.EditPerformanceReview
              }}
            />
          {/if}
        </div>
      {/if}
    {:else}
      <did />
    {/if}
  </div>

  <div class="content m-3">
    {#if notReviewYet && !editting}
      {#if canReview}
        <Label label={performance.string.AddPerformanceReviewDescription} />
      {:else}
        <Label label={performance.string.NoReviewsYet} />
      {/if}
    {:else}
      <ReviewEditorValueEdit
        readonly={!editting}
        bind:content={object.content}
        bind:score={object.score}
        bind:reviewer={object.reviewer}
      />
    {/if}
  </div>

  <div class="error">
    {#if error}
      <div>
        <Label label={error} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .review-section {
    margin-bottom: 1rem;
    border: 1px solid var(--button-border-color);
    border-radius: 0.25rem;
  }

  .review-section .error {
    color: var(--theme-error-color);
    margin: 0.5rem;
    display: flex;
    align-items: center;
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
