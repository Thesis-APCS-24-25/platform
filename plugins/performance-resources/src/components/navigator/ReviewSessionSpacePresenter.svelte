<script lang="ts">
  import { Ref, Space } from '@hcengineering/core'
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import { Project } from '@hcengineering/task'
  import { navigate, type Action } from '@hcengineering/ui'
  import { TreeNode } from '@hcengineering/view-resources'
  import { getReviewSessionLink } from '../../navigation'

  export let space: ReviewSession
  export let currentSpace: Ref<Space> | undefined
  export let deselect: boolean = false
  export let getActions: (space: Project) => Promise<Action[]> = async () => []

  function handleReviewSessionSelected (_id: Ref<ReviewSession>): void {
    navigate(getReviewSessionLink(_id))
  }

</script>

{#if space}
  <TreeNode
    _id={space._id}
    title={space.name}
    empty
    actions={() => getActions(space)}
    selected={deselect ? false : currentSpace === space._id}
    type="nested-selectable"
    on:click={() => {
      handleReviewSessionSelected(space._id)
    }}
  />
{/if}
