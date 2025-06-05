<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import kraTeam from '../plugins'
  import contact, { Person, PersonAccount } from '@hcengineering/contact'
  import core, { Ref } from '@hcengineering/core'
  import ObjectBox from '@hcengineering/view-resources/src/components/ObjectBox.svelte'
  import { Team } from '@hcengineering/kra-team'
  import {
    personAccountByPersonId,
    PersonAccountRefPresenter,
    personIdByAccountId,
    PersonRefPresenter
  } from '@hcengineering/contact-resources'
  import { Button, IconAdd, showPopup, eventToHTMLElement, IconClose } from '@hcengineering/ui'
  import { ObjectBoxPopup } from '@hcengineering/view-resources'
  export let currentSpace: Ref<Team> | undefined = undefined
  const selectedMember: Ref<Person> | undefined = undefined

  const client = getClient()
  const members = client
    .findOne(kraTeam.class.Team, {
      _id: currentSpace
    })
    .then(
      (team) =>
        team?.members
          .map((accountRef) => $personIdByAccountId.get(accountRef as Ref<PersonAccount>))
          .filter((s) => s !== undefined) as Ref<Person>[]
    )

  let newMembers: Ref<Person>[] = []

  function handleUpdate (data: Ref<Person>[] | undefined): void {
    if (data !== undefined) {
      newMembers = data
    }
  }
</script>

<Card
  label={kraTeam.string.AddMember}
  canSave={newMembers.length > 0}
  okLabel={kraTeam.string.Add}
  width="small"
  on:close
  okAction={async () => {
    const newAccounts = newMembers.map((m) => $personAccountByPersonId.get(m)?.[0]?._id).filter((p) => p !== undefined)
    if (currentSpace !== undefined) {
      const client = getClient()
      for (const acc of newAccounts) {
        await client.updateDoc(kraTeam.class.Team, core.space.Space, currentSpace, {
          $push: {
            members: acc
          }
        })
      }
    }
  }}
>
  {#await members then members}
    <div class="flex-row-center flex-gap-2 flex-wrap">
      {#each newMembers as member}
        <div class="flex-row-center assign-pill pl-1 new">
          <div class="flex-row-center flex-gap-1">
            <PersonRefPresenter value={member} disabled />
          </div>
          <Button
            kind="ghost"
            shape="rectangle-left"
            icon={IconClose}
            iconProps={{
              size: 'small'
            }}
            on:click={() => {
              newMembers = newMembers?.filter((it) => it !== member)
            }}
          />
        </div>
      {/each}
      <Button
        label={kraTeam.string.AddMember}
        kind="regular"
        icon={IconAdd}
        on:click={(e) => {
          showPopup(
            ObjectBoxPopup,
            {
              selectedObjects: newMembers,
              ignoreObjects: members,
              _class: kraTeam.mixin.Member,
              multiSelect: true
            },
            eventToHTMLElement(e),
            undefined,
            handleUpdate
          )
        }}
      />
    </div>
  {/await}
</Card>

<style lang="scss">
  .assign-pill {
    background-color: var(--theme-button-default);
    border-radius: 0.3rem;
    border: 1px solid var(--theme-button-border);
    font-size: var(--hc-font-size-2);
    color: var(--hc-color-text-primary);
    cursor: pointer;

    &.new {
      border: 1px dashed var(--theme-button-border);
    }
  }

  .assign-pill:hover {
    background-color: var(--theme-button-hovered);
  }
</style>
