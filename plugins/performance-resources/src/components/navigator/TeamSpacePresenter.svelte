<script lang="ts">
  import { Ref, Space, WithLookup } from '@hcengineering/core'
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import performance, { ReviewSession } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { getPlatformColorForTextDef,  Label,  navigate,  themeStore, type Action } from '@hcengineering/ui'
  import { TreeNode } from '@hcengineering/view-resources'
  import TreeElement from '@hcengineering/view-resources/src/components/navigator/TreeElement.svelte'
  import { getReviewSessionIdFromFragment } from '../../utils/ReviewSessionUtils'
  import { getReviewSessionLink } from '../../navigation'

  export let space: Team
  export let currentSpace: Ref<Space> | undefined
  export let currentFragment: string | undefined
  export let deselect: boolean = false
  export let forciblyСollapsed: boolean = false
  export let getActions: (space: Space) => Promise<Action[]> = async () => []

  const client = getClient()
  const query = createQuery()
  let reviewSessions: ReviewSession[] = []
  
  $: query.query(
    performance.class.ReviewSession,
    {
      space: space._id,
    },
    (result) => {
      reviewSessions = result
    }
  )

  function handleReviewSessionSelected (_id: Ref<ReviewSession>): void {
    navigate(getReviewSessionLink(_id))
  }

  $: selected = getReviewSessionIdFromFragment(currentFragment ?? '')

  let pressed: boolean = false

  let selectedReviewSession: ReviewSession | undefined = undefined

  $: if (selected !== undefined) {
    void client
      .findOne(
        performance.class.ReviewSession,
        { _id: selected },
      )
      .then((result: WithLookup<ReviewSession> | undefined) => {
        if (result !== undefined) {
          selectedReviewSession = result as ReviewSession
        } else {
          // There's some issue with resolving which needs to be fixed later
          void client
            .findOne(performance.class.ReviewSession, { _id: selected as unknown as Ref<ReviewSession> })
            .then((result) => {
              selectedReviewSession = result
            })
        }
      })
  } else {
    selectedReviewSession = undefined
  }
</script>

{#if space}
  <TreeNode
    _id={space?._id}
    folderIcon
    iconProps={{
      fill: getPlatformColorForTextDef(space.name, $themeStore.dark).icon
    }}
    title={space.name}
    highlighted={space._id === currentSpace && currentFragment !== undefined && !deselect}
    visible={(space._id === currentSpace && currentFragment !== undefined && !deselect) || forciblyСollapsed}
    showMenu={pressed}
    {forciblyСollapsed}
    actions={() => getActions(space)}
    type={'nested'}
    >
    {#if reviewSessions.length > 0}
      {#each reviewSessions as session}
        {#if session}
          <TreeElement
            _id={session._id}
            title={session.name}
            selected={selectedReviewSession?._id === session._id}
            empty
            on:click={() => {
              handleReviewSessionSelected(session._id)
            }}
          />
        {/if}
      {/each}
    {:else}
      <div class="pseudo-element flex-row-center content-dark-color text-md nowrap">
        <Label label={performance.string.NoReviewSessions} />
      </div>
    {/if}

    <!-- <svelte:fragment slot="visible">
      {#if (selected || forciblyСollapsed) && selectedReviewSession}
        {@const doc = selectedReviewSession}
        <TreeItem
          _id={doc._id}
          icon={performance.icon.Document}
          iconProps={{
            fill: 'currentColor'
          }}
          title={getDocumentName(doc)}
          actions={() => getDocumentActions(doc)}
          selected
          isFold
          empty
          forciblyСollapsed
        />
      {/if}
    </svelte:fragment> -->
  </TreeNode>
{/if}
