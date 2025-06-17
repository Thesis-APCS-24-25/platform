<script lang="ts">
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import ReviewSessionSpacePresenter from '../review-session/ReviewSessionSpacePresenter.svelte'
  import { Ref, Space } from '@hcengineering/core'
  import { getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { TreeNode } from '@hcengineering/view-resources'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import { Action, showPopup } from '@hcengineering/ui'
  import { navigatorModel } from '../../navigation'
  import { allKRAApproved, doKRAWeightCheck } from '../../utils/review-session'
  import WeightWarningPopup from './WeightWarningPopup.svelte'

  export let currentSpace: Ref<Space> | undefined
  export let currentSpecial: string | undefined
  export let deselect: boolean = false
  export let separate: boolean = false
  export let reviewSessions: ReviewSession[] = []

  const model = $navigatorModel.spaces[1]

  $: filtered = reviewSessions.filter((rs) => rs.status === ReviewSessionStatus.Drafting)

  $: visibleSpace = filtered.find((fs) => fs._id === currentSpace)
  $: empty = filtered.length === 0 || reviewSessions === undefined
  $: visible = visibleSpace !== undefined && currentSpecial !== undefined && !deselect && !empty

  function startReviewSession (rs: ReviewSession): Action {
    return {
      label: performance.string.StartReviewSession,
      icon: performance.icon.StartReviewSession,
      action: async (): Promise<void> => {
        const client = getClient()

        const allApproved = await allKRAApproved(client, rs)
        if (!allApproved) {
          showPopup(
            MessageBox,
            {
              label: performance.string.CannotStartReviewSession,
              message: performance.string.StartReviewSessionNotAllKRAApproved
            },
            'top'
          )
          return
        }
        const notFullEmployees = []
        for (const [employee, ok] of (await doKRAWeightCheck(client, rs))) {
          if (!ok) {
            notFullEmployees.push(employee)
          }
        }

        if (notFullEmployees.length > 0) {
          showPopup(
            WeightWarningPopup,
            {
              members: notFullEmployees
            },
            'top'
          )
        } else {
          showPopup(
            MessageBox,
            {
              label: performance.string.StartReviewSession,
              message: performance.string.StartReviewSessionConfirm
            },
            'top',
            async (ok: boolean): Promise<void> => {
              if (ok) {
                await client.update(rs, {
                  status: ReviewSessionStatus.InProgress
                })
              }
            }
          )
        }
      }
    }
  }

  async function getActions (rs: ReviewSession): Promise<Action[]> {
    return [startReviewSession(rs)]
  }
</script>

<TreeNode
  parent
  label={!empty ? model.label : performance.string.NoDraftingReviewSession}
  highlighted={visible}
  isFold={!empty}
  forciblyСollapsed={false}
  {empty}
  {visible}
>
  {#each filtered as space, i}
    {#if separate && model.specials !== undefined && i !== 0}<TreeSeparator line />{/if}
    <ReviewSessionSpacePresenter
      {currentSpace}
      {space}
      {model}
      {currentSpecial}
      {getActions}
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
