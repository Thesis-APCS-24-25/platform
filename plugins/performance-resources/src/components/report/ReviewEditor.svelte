<script lang="ts">
  import { IconAdd, Label, showPopup, ButtonIcon, IconDelete, Component, Icon } from '@hcengineering/ui'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { getCurrentAccount, Ref, WithLookup } from '@hcengineering/core'
  import { PerformanceReport, PerformanceReview } from '@hcengineering/performance'
  import view from '@hcengineering/view'
  import AddReviewPopup from './AddReviewPopup.svelte'

  const client = getClient()

  export let object: WithLookup<PerformanceReport>

  let yourReview: PerformanceReview | undefined = undefined
  let reviews: WithLookup<PerformanceReview>[] | undefined = undefined
  const isCollapsed = false

  const reviewQuery = createQuery()

  reviewQuery.query(
    performance.class.PerformanceReview,
    {
      report: object._id
    },
    (result) => {
      reviews = result
    }
  )

  $: yourReview = reviews?.find(v => v.createdBy === getCurrentAccount()._id)

  async function onRemovePerformanceReview (review: Ref<PerformanceReview>): Promise<void> {
    await client.removeDoc(
      performance.class.PerformanceReview,
      object.space,
      review
    )
  }

  function handleCreatePerformanceReview (): void {
    showPopup(AddReviewPopup, { type: 'add', report: object._id, space: object.space }, 'top')
  }

  function handleRemovePerformanceReview (): void {
    if (yourReview !== undefined) {
      void onRemovePerformanceReview(yourReview._id)
    }
  }

  function handleEditPerformanceReview (): void {
    showPopup(AddReviewPopup, {
      type: 'edit',
      report: object._id,
      space: object.space,
      _id: yourReview?._id,
      content: yourReview?.content,
      score: yourReview?.score
    }, 'top')
  }
</script>

<div class="review-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon
      icon={performance.icon.PerformanceReview}
      size={'medium'}
    />
    <Label label={performance.string.Reviews} />
    {#if yourReview !== undefined}
      <div>
        <ButtonIcon
          icon={performance.icon.PerformanceReview}
          kind="tertiary"
          size="small"
          on:click={handleEditPerformanceReview}
          inheritColor
          tooltip={{
            label: performance.string.EditPerformanceReview
          }}
        />
        <ButtonIcon
          icon={IconDelete}
          kind="tertiary"
          size="small"
          on:click={handleRemovePerformanceReview}
          inheritColor
          tooltip={{
            label: performance.string.RemovePerformanceReview
          }}
        />
      </div>
    {:else}
      <ButtonIcon
        icon={IconAdd}
        kind="tertiary"
        size="small"
        on:click={handleCreatePerformanceReview}
        inheritColor
        tooltip={{
          label: performance.string.AddPerformanceReview
        }}
      />
    {/if}
  </div>
  <div class="content">
    {#if reviews !== undefined && reviews.length > 0}
      {#each reviews as review}
        <Component
          is={view.component.ObjectPresenter}
          props={{ value: review }}
        />
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
</style>
