<script lang="ts">
  import { ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import { Issue, RatingScale } from '@hcengineering/kra'
  import RatingScaleCircle from './RatingScaleCircle.svelte'
  import GoalPresenterContainer from './GoalPresenterContainer.svelte'
  import RatingScaleEditPopup from './ratingscale/RatingScaleEditPopup.svelte'
  import { calculateGoal } from '../../../utils/goal'

  export let value: RatingScale
  export let issue: Issue
  export let size: ButtonSize = 'small'
  export let kind: ButtonKind = 'regular'

  $: rating = calculateGoal(value, undefined)

  function handleOpen (e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      RatingScaleEditPopup,
      {
        issue,
        ratingScale: value,
        value: rating
      },
      eventToHTMLElement(e)
    )
  }
</script>

{#await rating then rating}
  <GoalPresenterContainer {size} {kind} onClick={handleOpen}>
    <RatingScaleCircle value={rating ?? 0} />
    <div class="separator"></div>

    <div class="label">
      <span class="current-value">{rating}</span> <span class="divider">/</span> <span class="target-value">5</span>
    </div>
  </GoalPresenterContainer>
{/await}

<style>
  .separator {
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background-color: var(--theme-divider-color, #e0e0e0);
  }
  .current-value {
    font-weight: 600;
    font-size: 1.1em;
  }
  .divider {
    opacity: 0.7;
  }
  .target-value {
    opacity: 0.7;
  }
</style>
