<script lang="ts">
  import { createQuery, getClient, IconForward, SpaceSelector } from '@hcengineering/presentation'
  import { ReviewSession } from '@hcengineering/performance'
  import { getCurrentAccount, Ref, SortingOrder, Space } from '@hcengineering/core'
  import performance from '../plugin'
  import kraTeam, { Member, Team } from '@hcengineering/kra-team'
  import { createFocusManager, FocusHandler, Label } from '@hcengineering/ui'

  const client = getClient()
  const query = createQuery()

  const me = getCurrentAccount()

  export let team: Ref<Team> | undefined
  export let reviewSession: Ref<ReviewSession> | undefined

  $: void client.findOne(
    kraTeam.class.Team,
    {
      members: me._id as Ref<Member>
    }
  ).then((result) => {
    if (result !== undefined) {
      team = result._id
    }
  })

  $: if (team !== undefined) {
    query.query(
      performance.class.ReviewSession,
      {
        space: team as Ref<Space>,
        members: me._id
      },
      (res) => {
        reviewSession = res[0]?._id ?? undefined
      },
      {
        sort: {
          modifiedOn: SortingOrder.Descending
        },
        limit: 1
      }
    )
  }

  const manager = createFocusManager()
</script>

<FocusHandler {manager}/>

<div class='flex-row-baseline double-selector-container'>
  {#if team !== undefined}
    <div class='mx-2'>
      <SpaceSelector
        _class={kraTeam.class.Team}
        label={performance.string.SelectTeam}
        bind:space={team}
        kind={'regular'}
        size={'medium'}
        query={
          { members: me._id }
        }
      />
    </div>
    <div class='mx-2 antiCard-header__divider'>
      <IconForward size={'small'} />
    </div>
    {#if reviewSession !== undefined}
      <div class='mx-2'>
        <SpaceSelector
          _class={performance.class.ReviewSession}
          label={performance.string.SelectReviewSession}
          bind:space={reviewSession}
          kind={'regular'}
          size={'medium'}
          query={{
            space: team,
            members: me._id
          }}
        />
      </div>
    {:else}
      <div class="hulyNavItem-container mx-2 pseudo-element flex-row-center content-dark-color text-md nowrap">
        <Label label={performance.string.NoReviewSessions} />
      </div>
    {/if}
  {:else}
    <div class="hulyNavItem-container mx-2 pseudo-element flex-row-center content-dark-color text-md nowrap">
      <Label label={performance.string.NoTeam} />
    </div>
  {/if}
</div>

<style>
  .double-selector-container {
    align-items: center;
  }
</style>
