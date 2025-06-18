<script lang="ts">
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import ReviewSessionSpacePresenter from '../review-session/ReviewSessionSpacePresenter.svelte'
  import { Ref, Space } from '@hcengineering/core'
  import { createQuery, getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { currentTeam } from '../../utils/team'
  import { TreeNode } from '@hcengineering/view-resources'
  import { SpacesNavModel } from '@hcengineering/workbench'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import { Asset } from '@hcengineering/platform'
  import { Action, Label, showPopup } from '@hcengineering/ui'

  export let model: SpacesNavModel
  export let currentSpace: Ref<Space> | undefined
  export let currentSpecial: string | undefined
  export let deselect: boolean = false
  export let separate: boolean = false
  export let reviewSessions: ReviewSession[] = []

  $: filtered = reviewSessions.filter((rs) => rs.status === ReviewSessionStatus.InProgress)

  $: visibleSpace = filtered.find((fs) => fs._id === currentSpace)
  $: empty = filtered.length === 0 || reviewSessions === undefined
  $: visible = visibleSpace !== undefined && currentSpecial !== undefined && !deselect && !empty

  function concludeReviewSession (rs: ReviewSession): Action {
    return {
      label: performance.string.ConcludeReviewSession,
      icon: performance.icon.ConcludeReviewSession,
      action: async (): Promise<void> => {
        const client = getClient()
        showPopup(
          MessageBox,
          {
            label: performance.string.ConcludeReviewSessionMessage,
            message: performance.string.ConcludeReviewSessionConfirm
          },
          'top',
          async (ok: boolean): Promise<void> => {
            if (ok) {
              await client.update(rs, {
                status: ReviewSessionStatus.Concluded
              })
            }
          }
        )
      }
    }
  }
  async function getActions (rs: ReviewSession): Promise<Action[]> {
    return [concludeReviewSession(rs)]
  }
</script>

<TreeNode
  parent
  label={!empty ? model.label : performance.string.NoActiveReviewSession}
  highlighted={visible}
  isFold={!empty}
  forciblyСollapsed={false}
  {empty}
  {visible}
>
  {#each filtered as space, i}
    {#if separate && model.specials !== undefined && i !== 0}<TreeSeparator line />{/if}
    <ReviewSessionSpacePresenter
      {getActions}
      {currentSpace}
      {space}
      {model}
      {currentSpecial}
      forciblyСollapsed={false}
    />
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
