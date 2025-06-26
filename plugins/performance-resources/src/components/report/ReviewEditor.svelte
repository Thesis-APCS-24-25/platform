<script lang="ts">
  import { Label, ButtonIcon, Icon, IconCheck, NumberInput, Component } from '@hcengineering/ui'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { Data, generateId, getCurrentAccount, Ref, WithLookup } from '@hcengineering/core'
  import { PerformanceReport, PerformanceReview } from '@hcengineering/performance'
  import { StyledTextBox } from '@hcengineering/text-editor-resources'
  import view from '@hcengineering/view'
  import { FixedColumn, MarkupPresenter } from '@hcengineering/view-resources'
  import {
    PersonAccountPresenter,
    PersonAccountRefPresenter,
    PersonRefPresenter
  } from '@hcengineering/contact-resources'
  import ScorePresenter from './ScorePresenter.svelte'

  const client = getClient()

  export let object: WithLookup<PerformanceReport>

  let reviews: WithLookup<PerformanceReview>[] | undefined = undefined
  const isCollapsed = false

  const reviewQuery = createQuery()

  let score: number | undefined = undefined
  let content: string = ''
  const emptyReview: Data<PerformanceReview> = {
    content: '',
    score: 0,
    report: object._id
  }
  let yourReview: Data<PerformanceReview> | PerformanceReview = emptyReview
  reviewQuery.query(
    performance.class.PerformanceReview,
    {
      report: object._id
    },
    (result) => {
      reviews = result
      yourReview = (reviews?.find((v) => v.createdBy === getCurrentAccount()._id) ?? emptyReview) as
        | Data<PerformanceReview>
        | PerformanceReview
      score = yourReview?.score
      content = yourReview?.content ?? ''
    }
  )

  // async function onRemovePerformanceReview (review: Ref<PerformanceReview>): Promise<void> {
  //   await client.removeDoc(performance.class.PerformanceReview, object.space, review)
  // }
  //
  // function handleCreatePerformanceReview (): void {
  //   showPopup(AddReviewPopup, { type: 'add', report: object._id, space: object.space }, 'top')
  // }
  //
  // function handleRemovePerformanceReview (): void {
  //   if (yourReview !== undefined) {
  //     void onRemovePerformanceReview(yourReview._id)
  //   }
  // }
  //
  // function handleEditPerformanceReview (): void {
  //   showPopup(
  //     AddReviewPopup,
  //     {
  //       type: 'edit',
  //       report: object._id,
  //       space: object.space,
  //       _id: yourReview?._id,
  //       content: yourReview?.content,
  //       score: yourReview?.score
  //     },
  //     'top'
  //   )
  // }
  //
  let editting = false
  $: if (score !== undefined && isFinite(score) && score > 0 && score <= 100) {
    if (yourReview !== undefined) yourReview.score = score
  }
</script>

<div class="review-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={performance.icon.PerformanceReview} size={'medium'} />
    <Label label={performance.string.Reviews} />
    {#if editting}
      <div>
        <ButtonIcon
          icon={IconCheck}
          kind="tertiary"
          size="small"
          on:click={async () => {
            if ('_id' in yourReview) {
              await client.updateDoc(performance.class.PerformanceReview, object.space, yourReview._id, {
                ...yourReview
              })
            } else {
              await client.createDoc(performance.class.PerformanceReview, object.space, yourReview)
            }
            editting = false
          }}
          inheritColor
          tooltip={{
            label: performance.string.AddPerformanceReview
          }}
        />
      </div>
    {:else}
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
  <div class="content m-3">
    <div class="flex-row-center justify-between flex-gap-2 review-input items-start">
      <FixedColumn key="person" addClass="flex-shrink">
        <PersonAccountPresenter value={getCurrentAccount()} shouldShowName={false} />
      </FixedColumn>
      <FixedColumn key="comment" addClass="flex-grow">
        <StyledTextBox
          bind:content
          alwaysEdit
          placeholder={performance.string.ReviewContentPlaceholder}
          enableBackReferences={true}
          readonly={!editting}
          on:value={(e) => {
            yourReview.content = e.detail
          }}
        />
      </FixedColumn>
      <FixedColumn key="score">
        <div class="score">
          <div class="flex-row-center flex-gap-1">
            <input datatype="number" class="score-input" bind:value={score} disabled={!editting} />
            <span class="score-postfix">/100</span>
          </div>
        </div>
      </FixedColumn>
    </div>
    {#if reviews !== undefined && reviews.length > 0}
      <div class="divider" />
      {@const filteredReviews = reviews.filter((review) => '_id' in yourReview && review._id !== yourReview._id)}
      {#each filteredReviews as review}
        <div class="flex-row-center justify-between flex-gap-2">
          <FixedColumn key="person" addClass="flex-shrink">
            {#if review.createdBy}
              <PersonAccountRefPresenter value={review.createdBy} shouldShowName={false} />
            {:else}
              <PersonRefPresenter value={null} />
            {/if}
          </FixedColumn>
          <FixedColumn key="comment" addClass="flex-grow">
            <MarkupPresenter value={review.content} />
          </FixedColumn>
          <FixedColumn key="score">
            <ScorePresenter value={review.score} />
          </FixedColumn>
        </div>
        <!-- <Component is={view.component.ObjectPresenter} props={{ value: review }} /> -->
      {/each}
    {:else}
      <div class="empty-state">
        <Label label={performance.string.NoReviews} />
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
