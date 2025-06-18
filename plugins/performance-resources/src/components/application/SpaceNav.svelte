<script lang="ts">
  import { ReviewSession } from '@hcengineering/performance'
  import ReviewSessionSpacePresenter from '../review-session/ReviewSessionSpacePresenter.svelte'
  import { Ref } from '@hcengineering/core'
  import { TreeNode } from '@hcengineering/view-resources'
  import { SpacesNavModel } from '@hcengineering/workbench'
  import { TreeSeparator } from '@hcengineering/workbench-resources'

  export let model: SpacesNavModel
  export let currentSpace: Ref<ReviewSession> | undefined
  export let currentSpecial: string | undefined
  export let deselect: boolean = false
  export let separate: boolean = false
  export let reviewSessions: ReviewSession[] = []

  $: visibleSpace = reviewSessions.find((fs) => fs._id === currentSpace)
  $: empty = reviewSessions.length === 0 || reviewSessions === undefined
  $: visible = visibleSpace !== undefined && currentSpecial !== undefined && !deselect && !empty
</script>

<TreeNode parent label={model.label} highlighted={visible} isFold={!empty} {empty} {visible}>
  {#each reviewSessions as space, i}
    {#if separate && model.specials !== undefined && i !== 0}<TreeSeparator line />{/if}
    <ReviewSessionSpacePresenter {currentSpace} {space} {model} {currentSpecial} forciblyСollapsed={false} />
  {/each}

  <svelte:fragment slot="visible">
    {#if visibleSpace}
      <ReviewSessionSpacePresenter
        {model}
        space={visibleSpace}
        {currentSpace}
        {currentSpecial}
        {deselect}
        forciblyСollapsed
      />
    {/if}
  </svelte:fragment>
</TreeNode>
