<script lang="ts">
  import core, { Account, Ref, WithLookup } from '@hcengineering/core'
  import {
    SpaceHeader,
    Table,
    TableBrowser,
    ViewletContentView,
    ViewletSettingButton
  } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import { createQuery, getClient, ObjectPopup } from '@hcengineering/presentation'
  import contact, { Person, PersonAccount } from '@hcengineering/contact'
  import { Member, Team } from '@hcengineering/kra-team'
  import { Button, showPopup, themeStore } from '@hcengineering/ui'
  import { translate } from '@hcengineering/platform'
  import AddMember from './AddMember.svelte'
  import { personIdByAccountId } from '@hcengineering/contact-resources'

  export let currentSpace: Ref<Team> | undefined = undefined

  let members: Ref<Member>[] = []

  const liveQuery = createQuery()

  $: liveQuery.query(
    kraTeam.class.Team,
    {
      _id: currentSpace
    },
    (rs) => {
      members = rs[0]?.members
        .map((personRef) => {
          return $personIdByAccountId.get(personRef as Ref<PersonAccount>)
        })
        .filter((personRef) => {
          return personRef !== undefined
        }) as Ref<Member>[] ?? []
    }
  )

  let search = ''
  let viewlet: WithLookup<Viewlet> | undefined
  let viewOptions: ViewOptions | undefined

  $: query = {
    _id: { $in: members }
  }

  let label: string | undefined

  $: if (label === undefined) {
    void translate(kraTeam.string.Members, {}, $themeStore.language).then((res) => {
      label = res
    })
  }

  function handleAddMember (): void {
    showPopup(
      AddMember,
      {
        currentSpace
      },
      'centered'
    )
  }
</script>

<SpaceHeader
  label={label ?? ''}
  _class={kraTeam.mixin.Member}
  bind:viewlet
  bind:search
  viewletQuery={{ attachTo: kraTeam.mixin.Member }}
  space={contact.space.Contacts}
>
  <svelte:fragment slot="header-tools">
    <ViewletSettingButton bind:viewOptions bind:viewlet />
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button label={kraTeam.string.AddMember} kind="primary" on:click={handleAddMember} />
  </svelte:fragment>
</SpaceHeader>

{#if viewlet !== undefined && viewOptions}
  <ViewletContentView _class={kraTeam.mixin.Member} space={contact.space.Contacts} {viewOptions} {viewlet} {query} />
{/if}
