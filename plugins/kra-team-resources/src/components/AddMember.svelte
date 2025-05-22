<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import kraTeam from '../plugins'
  import contact, { Person, PersonAccount } from '@hcengineering/contact'
  import core, { Ref } from '@hcengineering/core'
  import ObjectBox from '@hcengineering/view-resources/src/components/ObjectBox.svelte'
  import { Team } from '@hcengineering/kra-team'
  import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
  export let currentSpace: Ref<Team> | undefined = undefined
  let selectedMember: Ref<Person> | undefined = undefined

  const client = getClient()
  const members = client
    .findOne(kraTeam.class.Team, {
      _id: currentSpace
    })
    .then((team) =>
      team?.members
        .map((accountRef) => $personIdByAccountId.get(accountRef as Ref<PersonAccount>))
        .filter((s) => s !== undefined) as Ref<Person>[]
    )
</script>

<Card
  label={kraTeam.string.AddMember}
  canSave={selectedMember !== undefined}
  okLabel={kraTeam.string.Add}
  on:close
  okAction={async () => {
    if (selectedMember !== undefined) {
      const client = getClient()
      const member = await client.findOne(contact.class.Person, {
        _id: selectedMember
      })
      if (member === undefined || currentSpace === undefined) {
        return
      }
      const account = $personAccountByPersonId.get(member._id)?.[0]
      if (account === undefined) {
        throw new Error('Account not found')
      }
      await client.updateDoc(kraTeam.class.Team, core.space.Space, currentSpace, {
        $push: {
          members: account._id
        }
      })
      // const hierarchy = client.getHierarchy()
      // if (!hierarchy.hasMixin(member, kraTeam.mixin.Member)) {
      //   await client.createMixin(member._id, member._class, member.space, kraTeam.mixin.Member, {})
      // }
    }
  }}
>
  {#await members then members}
    {#if members !== undefined}
      <ObjectBox
        label={kraTeam.string.ChooseMember}
        bind:value={selectedMember}
        _class={contact.class.Person}
        docQuery={{
          _id: {
            $nin: members
          }
        }}
      />
    {/if}
  {/await}
</Card>
