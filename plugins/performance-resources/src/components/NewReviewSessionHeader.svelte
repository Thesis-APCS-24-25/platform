<script lang="ts">
  import { AccountRole, Ref, Space, getCurrentAccount, hasAccountRole } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import {
    Button,
    ButtonWithDropdown,
    IconAdd,
    IconDropdown,
    Loading,
    SelectPopupValueType,
    showPopup
  } from '@hcengineering/ui'
  import { openDoc } from '@hcengineering/view-resources'

  import performance from '../plugin'
  import CreateKra from './kra/CreateKRA.svelte';
  import CreateReviewSession from './review-session/CreateReviewSession.svelte'
  import { getKRAIdFromFragment } from '../utils/KraUtils'

  export let currentSpace: Ref<Space> | undefined
  export let currentFragment: string | undefined

  const client = getClient()
  const query = createQuery()

  const me = getCurrentAccount()

  let loading = true
  let hasReviewSession = false
  query.query(
    performance.class.ReviewSession,
    { archived: false, members: me._id },
    (res) => {
      hasReviewSession = res.length > 0
      loading = false
    },
    { limit: 1, projection: { _id: 1 } }
  )

  $: parent = getKRAIdFromFragment(currentFragment ?? '')

  async function newKRA (): Promise<void> {
    showPopup(CreateKra, { space: currentSpace, parent }, 'top', async (id) => {
      if (id !== undefined && id !== null) {
        const doc = await client.findOne(performance.class.KRA, { _id: id })
        if (doc !== undefined) {
          void openDoc(client.getHierarchy(), doc)
        }
      }
    })
  }

  async function newReviewSession (): Promise<void> {
    showPopup(CreateReviewSession, {}, 'top')
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
    {#if hasReviewSession}
      <ButtonWithDropdown
        icon={IconAdd}
        justify={'left'}
        kind={'primary'}
        label={performance.string.CreateKRA}
        on:click={newKRA}
        mainButtonId={'new-KRA'}
        dropdownIcon={IconDropdown}
        {dropdownItems}
        on:dropdown-selected={(ev) => {
          void dropdownItemSelected(ev.detail)
        }}
      />
    {:else}
      <Button
        id={'new-ReviewSession'}
        icon={IconAdd}
        label={performance.string.CreateReviewSession}
        justify={'left'}
        width={'100%'}
        kind={'primary'}
        gap={'large'}
        on:click={newReviewSession}
      />
    {/if}
  </div>
{/if}
