<script lang="ts">
  import { Account, Ref, WithLookup } from '@hcengineering/core'
  import { SpaceHeader, ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import { createQuery } from '@hcengineering/presentation'
  import contact from '@hcengineering/contact'
  import { Team } from '@hcengineering/kra-team'
  import { themeStore } from '@hcengineering/ui'
  import { translate } from '@hcengineering/platform'

  export let currentSpace: Ref<Team> | undefined = undefined

  let members: Ref<Account>[] = []

  const liveQuery = createQuery()

  $: liveQuery.query(
    kraTeam.class.Team,
    {
      _id: currentSpace
    },
    (rs) => {
      members = rs[0]?.members ?? []
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
</script>

<SpaceHeader
  label={label ?? ''}
  _class={kraTeam.class.Member}
  bind:viewlet
  bind:search
  viewletQuery={{ attachTo: kraTeam.class.Member }}
  space={contact.space.Contacts}
>
  <svelte:fragment slot="header-tools">
    <ViewletSettingButton bind:viewOptions bind:viewlet />
  </svelte:fragment>
</SpaceHeader>

{#if viewlet !== undefined && viewOptions}
  <ViewletContentView
    _class={contact.class.PersonAccount}
    space={contact.space.Contacts}
    {viewOptions}
    {viewlet}
    {query}
  />
{/if}
