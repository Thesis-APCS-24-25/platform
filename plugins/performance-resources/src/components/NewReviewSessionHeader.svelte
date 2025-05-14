<script lang="ts">
  import { AccountRole, Ref, Space, getCurrentAccount, hasAccountRole } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import {
    Button,
    ButtonWithDropdown,
    IconAdd,
    IconDropdown,
    Label,
    Loading,
    SelectPopupValueType,
    showPopup
  } from '@hcengineering/ui'

  import performance from '../plugin'
  import CreateKra from './kra/CreateKRA.svelte'
  import CreateReviewSession from './review-session/CreateReviewSession.svelte'
  import kraTeam, { Member, Team } from '@hcengineering/kra-team'
  import { ReviewSession } from '@hcengineering/performance'

  export let currentSpace: Ref<Space> | undefined
  // export let currentFragment: string | undefined

  // const client = getClient()
  const queryCurrent = createQuery()
  const queryTeam = createQuery()
  const queryReviewSession = createQuery()

  const me = getCurrentAccount()

  let loading = true
  let hasReviewSession = false
  let hasTeam = false
  let currentTeam: Team | undefined
  let currentReviewSession: ReviewSession | undefined

  queryCurrent.query(
    performance.class.ReviewSession,
    {
      _id: currentSpace as Ref<ReviewSession>,
      members: me._id
    },
    (res) => {
      if (res !== undefined) {
        currentReviewSession = res[0]
      }
    },
    {
      limit: 1, projection: { _id: 1 }
    }
  )

  queryTeam.query(
    kraTeam.class.Team,
    { archived: false, members: me._id as Ref<Member> },
    (res) => {
      if (res !== undefined) {
        hasTeam = res.length > 0
        if (currentReviewSession !== undefined) {
          currentTeam = res.find((team) => team._id === currentReviewSession?.space)
        }
      }
    },
    {
      limit: 1, projection: { _id: 1 }
    }
  )

  queryReviewSession.query(
    performance.class.ReviewSession,
    { archived: false, members: me._id },
    (res) => {
      if (res !== undefined) {
        hasReviewSession = res.length > 0
      }
      loading = false
    },
    {
      limit: 1, projection: { _id: 1 }
    }
  )

  async function newKRA (): Promise<void> {
    showPopup(CreateKra, { team: currentTeam }, 'top')
  }

  async function newReviewSession (): Promise<void> {
    showPopup(
      CreateReviewSession,
      { team: currentTeam },
      'top'
    )
  }

  async function dropdownItemSelected (res?: SelectPopupValueType['id']): Promise<void> {
    if (res === performance.string.CreateKRA) {
      await newKRA()
    } else if (res === performance.string.CreateReviewSession) {
      await newReviewSession()
    }
  }

  const dropdownItems = hasAccountRole(me, AccountRole.User)
    ? [
        { id: performance.string.CreateKRA, label: performance.string.CreateKRA },
        { id: performance.string.CreateReviewSession, label: performance.string.CreateReviewSession }
      ]
    : [{ id: performance.string.CreateKRA, label: performance.string.CreateKRA }]
</script>

{#if loading}
  <Loading shrink />
{:else}
  <div class="antiNav-subheader">
    {#if hasTeam}
      {#if hasReviewSession}
        <ButtonWithDropdown
          icon={IconAdd}
          justify={'left'}
          kind={'primary'}
          label={performance.string.CreateKRA}
          on:click={newKRA}
          mainButtonId={performance.string.CreateKRA}
          dropdownIcon={IconDropdown}
          {dropdownItems}
          on:dropdown-selected={(ev) => {
            void dropdownItemSelected(ev.detail)
          }}
        />
      {:else}
        <Button
          id={performance.string.CreateReviewSession}
          icon={IconAdd}
          label={performance.string.CreateReviewSession}
          justify={'left'}
          width={'100%'}
          kind={'primary'}
          gap={'large'}
          on:click={newReviewSession}
        />
      {/if}
    {:else}
      <Label
        label={performance.string.NoTeam}
      />
    {/if}
  </div>
{/if}
