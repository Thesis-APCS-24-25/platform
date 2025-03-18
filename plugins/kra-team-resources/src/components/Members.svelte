<script lang="ts">
  import { Account, DocumentQuery, Space, WithLookup } from '@hcengineering/core'
  import { SpaceHeader, ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import { Member } from '@hcengineering/kra-team'

  export let currentSpace: Space | undefined

  const currentMembers = currentSpace?.members ?? []

  let search = ''
  let viewlet: WithLookup<Viewlet> | undefined
  let viewOptions: ViewOptions | undefined

  let query: DocumentQuery<Account> = {
    _id: { $in: currentMembers }
  }
</script>

<SpaceHeader
  label={kraTeam.string.Members}
  _class={kraTeam.class.Member}
  bind:viewlet
  bind:search
  viewletQuery={{ attachTo: kraTeam.class.Member }}
  space={currentSpace?._id}
>
  <svelte:fragment slot="header-tools">
    <ViewletSettingButton bind:viewOptions bind:viewlet />
  </svelte:fragment>
</SpaceHeader>

{#if viewlet && viewOptions}
  <ViewletContentView _class={kraTeam.class.Member} space={currentSpace?._id} {viewOptions} {viewlet} {query} />
{/if}
