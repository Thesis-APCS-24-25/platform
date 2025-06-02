<script lang="ts">
  import { ButtonKind, ButtonSize, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import { Issue, RatingScale } from '@hcengineering/kra'
  import RatingScaleCircle from './RatingScaleCircle.svelte'
  import GoalPresenterContainer from '../GoalPresenterContainer.svelte'
  import RatingScaleEditPopup from './RatingScaleEditPopup.svelte'
  import { calculateResult } from '../../../../utils/goal'

  export let value: RatingScale
  export let issue: Issue
  export let size: ButtonSize = 'small'
  export let kind: ButtonKind = 'regular'
  export let readonly: boolean | undefined = false

  $: rating = calculateResult(value, undefined)

  const handleOpen = (rating: number, e: MouseEvent): void => {
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
  <GoalPresenterContainer disabled={readonly} {size} {kind} onClick={handleOpen.bind(null, rating ?? 0)}>
    <RatingScaleCircle value={rating ?? 0} />
    <div class="separator"></div>

    <div class="label">
      <strong class="current-value">{rating}</strong> <span class="divider">/</span> <span class="target-value">5</span>
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
    color: var(--theme-halfcontent-color)
  }
  .divider {
    color: var(--theme-halfcontent-color)
  }
  .target-value {
    color: var(--theme-halfcontent-color)
  }
</style>
