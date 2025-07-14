<script lang="ts">
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import ReviewSessionSpacePresenter from '../review-session/ReviewSessionSpacePresenter.svelte'
  import { getCurrentAccount, Ref, Space } from '@hcengineering/core'
  import { getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { TreeNode } from '@hcengineering/view-resources'
  import { SpacesNavModel } from '@hcengineering/workbench'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import { Action, showPopup } from '@hcengineering/ui'
  import { checkRole, currentTeam } from '../../utils/team'
  import kraTeam, { Member } from '@hcengineering/kra-team'
  import view from '@hcengineering/view'

  export let model: SpacesNavModel
  export let currentSpace: Ref<Space> | undefined
  export let currentSpecial: string | undefined
  export let deselect: boolean = false
  export let separate: boolean = false
  export let reviewSessions: ReviewSession[] = []

  const me = getCurrentAccount()

  $: filtered = reviewSessions.filter((rs) => rs.status === ReviewSessionStatus.Concluded)

  $: visibleSpace = filtered.find((fs) => fs._id === currentSpace)
  $: empty = filtered.length === 0 || reviewSessions === undefined
  $: visible = visibleSpace !== undefined && currentSpecial !== undefined && !deselect && !empty

  function archiveReviewSession (rs: ReviewSession): Action {
    return {
      label: performance.string.ArchiveReviewSession,
      icon: view.icon.Archive,
      action: async (): Promise<void> => {
        const client = getClient()
        showPopup(
          MessageBox,
          {
            label: performance.string.ArchiveReviewSessionConfirm,
            message: performance.string.ArchiveReviewSessionConfirm
          },
          'top',
          async (ok: boolean): Promise<void> => {
            if (ok) {
              await client.update(rs, {
                archived: true
              })
            }
          }
        )
      }
    }
  }
  async function getActions (rs: ReviewSession): Promise<Action[]> {
    if ($currentTeam === undefined) return []
    if (await checkRole(
      me.person as Ref<Member>,
      kraTeam.role.TeamManager,
      $currentTeam
    )) { return [archiveReviewSession(rs)] }
    return []
  }
</script>

<TreeNode
  parent
  label={!empty ? model.label : performance.string.NoConcludedReviewSession}
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
