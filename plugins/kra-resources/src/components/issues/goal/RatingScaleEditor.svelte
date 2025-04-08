<script lang="ts">
  import RatingScalePresenter from './RatingScalePresenter.svelte'
  import {
    Button,
    ButtonKind,
    ButtonSize,
    eventToHTMLElement,
    IconLike,
    SelectPopup,
    SelectPopupValueType,
    showPopup
  } from '@hcengineering/ui'
  import { RatingScale } from '@hcengineering/kra'

  export let value: RatingScale | undefined = undefined
  export let isEditable: boolean = true
  export let focusIndex: number | undefined = undefined
  export let size: ButtonSize = 'large'
  export let kind: ButtonKind = 'regular'
  export let onChange: ((value: any) => void) | undefined = undefined

  const popupValues: SelectPopupValueType[] = [1, 2, 3, 4, 5].map((v) => {
    return {
      id: v,
      component: RatingScalePresenter,
      props: {
        value: v
      }
    }
  })

  function showRatingPopup (e: MouseEvent): void {
    e.stopPropagation()
    if (!isEditable) {
      return
    }

    showPopup(SelectPopup, { value: popupValues }, eventToHTMLElement(e), changeRating)
  }

  function changeRating (result: any): void | Promise<void> {
    if (!isEditable || result === undefined || result === value || result === null) {
      return
    }
    value = result
    onChange?.(result)
  }
</script>

RatingScale

{#if value}
  <Button disabled={!isEditable} {kind} {size} on:click={showRatingPopup} icon={IconLike} {focusIndex}>
    <svelte:fragment slot="content">
      <RatingScalePresenter {size} {value} {kind} />
    </svelte:fragment>
  </Button>
{/if}
