<script lang="ts">
  import { Ref, Space } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import performance, { ReviewSession } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { getPlatformColorForTextDef, Label, navigate, themeStore, type Action } from '@hcengineering/ui'
  import { TreeNode } from '@hcengineering/view-resources'
  import TreeElement from '@hcengineering/view-resources/src/components/navigator/TreeElement.svelte'
  import { getReviewSessionLink } from '../../navigation'
  import { team } from '../../store'
  import { onDestroy } from 'svelte'

  export let space: Team
  export let currentSpace: Ref<Space> | undefined
  // export let currentFragment: string | undefined
  export let deselect: boolean = false
  export let forciblyСollapsed: boolean = false
  export let getActions: (space: Space) => Promise<Action[]> = async () => []

  const client = getClient()
  const query = createQuery()
  let reviewSessions: ReviewSession[] = []

  let currentTeam: Ref<Team>
  $: void client.findOne(
    performance.class.ReviewSession,
    {
      _id: currentSpace as Ref<ReviewSession>
    }
  ).then((result) => {
    if (result !== undefined) {
      currentTeam = result.space as Ref<Team>
      team.set(currentTeam)
    }
  })
  const unsubscribe = team.subscribe((value) => { currentTeam = value })

  onDestroy(unsubscribe)

  query.query(
    performance.class.ReviewSession,
    {
      space: space._id
    },
    (result) => {
      reviewSessions = []
      if (result !== undefined) {
        reviewSessions = result
      }
    },
    {
      limit: 50 // BUG: findAll returns all records even if they do not match
    }
  )

  function handleReviewSessionSelected (_id: Ref<ReviewSession>): void {
    selected = _id
    team.set(space._id)
    navigate(getReviewSessionLink(_id))
  }

  let selected: Ref<ReviewSession> | undefined = currentSpace as Ref<ReviewSession>

  const pressed: boolean = false
</script>

{#if space}
  <TreeNode
    _id={space?._id}
    folderIcon
    iconProps={{
      fill: getPlatformColorForTextDef(space.name, $themeStore.dark).icon
    }}
    title={space.name}
    highlighted={space._id === currentTeam && !deselect}
    visible={(space._id === currentTeam && !deselect) || forciblyСollapsed}
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
            selected={space._id === currentTeam && selected === session._id && !deselect}
            empty
            on:click={() => { handleReviewSessionSelected(session._id) }}
          />
        {/if}
      {/each}
    {:else}
      <div class="pseudo-element flex-row-center content-dark-color text-md nowrap">
        <Label label={performance.string.NoReviewSessions} />
      </div>
    {/if}

    <!-- <svelte:fragment slot="visible">
      {#if (selected || forciblyСollapsed) && selected}
        {@const doc = selected}
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
