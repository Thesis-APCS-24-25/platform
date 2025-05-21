<script lang="ts">
  import {
    Button,
    showPopup,
    EditBox,
    Label,
    Toggle,
    getPlatformColorDef,
    getPlatformColorForTextDef,
    themeStore,
    getColorNumberByText,
    IconWithEmoji
  } from '@hcengineering/ui'
  import { AccountArrayEditor } from '@hcengineering/contact-resources'
  import presentation, { Card, createQuery } from '@hcengineering/presentation'
  import kraTeam from '../plugins'
  import core, { Account, Role, RolesAssignment, Arr, Ref, SpaceType, SortingOrder } from '@hcengineering/core'
  import view from '@hcengineering/view'
  import { Asset } from '@hcengineering/platform'
  import { IconPicker } from '@hcengineering/view-resources'

  import { createNewTeam } from '../utils'
  import { createEventDispatcher } from 'svelte'

  let name = ''
  const description = ''
  let isPrivate = false
  let members: Arr<Ref<Account>> = []
  let icon: Asset = kraTeam.icon.Home
  let owners: Ref<Account>[] = []
  let rolesAssignment: RolesAssignment | undefined = undefined
  let color = getColorNumberByText(name)

  let typeType: SpaceType | undefined = undefined
  const typeTypeQuery = createQuery()
  typeTypeQuery.query(core.class.SpaceType, { _id: kraTeam.spaceType.TeamType }, (res) => {
    typeType = res[0]
  })

  let roles: Role[] = []
  const rolesQuery = createQuery()
  $: if (typeType !== undefined) {
    rolesQuery.query(
      core.class.Role,
      { attachedTo: typeType._id },
      (res) => {
        roles = res
        //
        // if (rolesAssignment === undefined && typeType !== undefined) {
        //   rolesAssignment = getRolesAssignment()
        // }
      },
      {
        sort: {
          name: SortingOrder.Ascending
        }
      }
    )
  } else {
    rolesQuery.unsubscribe()
  }

  // function getRolesAssignment (): RolesAssignment {
  //   if (project === undefined || typeType?.targetClass === undefined || roles === undefined) {
  //     return {}
  //   }
  //
  //   const asMixin = hierarchy.as(project, typeType?.targetClass)
  //
  //   const res = roles.reduce<RolesAssignment>((prev, { _id }) => {
  //     prev[_id] = (asMixin as any)[_id] ?? []
  //
  //     return prev
  //   }, {})
  //   alert(`${project._id} | ${JSON.stringify(res)}`)
  //   return res
  // }
  //
  let isColorSelected = false
  let membersChanged = false

  const dispatch = createEventDispatcher()

  $: canSave = name.length > 0

  async function handleOk (): Promise<void> {
    if (typeType === undefined || rolesAssignment === undefined) {
      return
    }
    await createNewTeam(name, description, isPrivate, typeType, members, owners, rolesAssignment, icon, color)
    dispatch('close')
  }

  function handleMembersChanged (newMembers: Ref<Account>[]): void | Promise<void> {
    membersChanged = true
    // If a member was removed we need to remove it from any roles assignments as well
    const newMembersSet = new Set(newMembers)
    const removedMembersSet = new Set(members.filter((m) => !newMembersSet.has(m)))

    if (removedMembersSet.size > 0 && rolesAssignment !== undefined) {
      for (const [key, value] of Object.entries(rolesAssignment)) {
        rolesAssignment[key as Ref<Role>] = value != null ? value.filter((m) => !removedMembersSet.has(m)) : undefined
      }
    }

    members = newMembers
  }

  function handleRoleAssignmentChanged (roleId: Ref<Role>, newMembers: Ref<Account>[]): void {
    if (rolesAssignment === undefined) {
      rolesAssignment = {}
    }

    rolesAssignment[roleId] = newMembers
  }

  function handleOwnersChanged (newOwners: Ref<Account>[]): void | Promise<void> {
    owners = newOwners

    const newMembersSet = new Set([...members, ...newOwners])
    members = Array.from(newMembersSet).map((m) => m)
  }

  function chooseIcon (): void {
    const update = (result: any): void => {
      if (result !== undefined && result !== null) {
        icon = result.icon
        color = result.color
        isColorSelected = true
      }
    }
    showPopup(IconPicker, { icon, color }, 'top', update, update)
  }
</script>

<Card label={kraTeam.string.CreateTeam} okAction={handleOk} {canSave} on:close>
  <div class="antiGrid">
    <div class="antiGrid-row">
      <div class="antiGrid-row__header">
        <Label label={kraTeam.string.TeamName} />
      </div>
      <div class="padding">
        <EditBox
          id="project-title"
          bind:value={name}
          placeholder={kraTeam.string.TeamNamePlaceholder}
          kind={'large-style'}
          autoFocus
        />
      </div>
    </div>

    <div class="antiGrid">
      <div class="antiGrid-row">
        <div class="antiGrid-row__header">
          <Label label={kraTeam.string.ChooseIcon} />
        </div>
        <Button
          icon={icon === view.ids.IconWithEmoji ? IconWithEmoji : icon ?? kraTeam.icon.Home}
          iconProps={icon === view.ids.IconWithEmoji
            ? { icon: color }
            : {
                fill:
                  color !== undefined
                    ? getPlatformColorDef(color, $themeStore.dark).icon
                    : getPlatformColorForTextDef(name, $themeStore.dark).icon
              }}
          size={'large'}
          on:click={chooseIcon}
        />
      </div>

      <div class="antiGrid-row">
        <div class="antiGrid-row__header">
          <Label label={core.string.Owners} />
        </div>
        <AccountArrayEditor
          value={owners}
          label={core.string.Owners}
          onChange={handleOwnersChanged}
          kind={'regular'}
          size={'large'}
        />
      </div>

      <div class="antiGrid-row">
        <div class="antiGrid-row__header withDesciption">
          <Label label={presentation.string.MakePrivate} />
          <span><Label label={presentation.string.MakePrivateDescription} /></span>
        </div>
        <Toggle id={'project-private'} bind:on={isPrivate} disabled={!isPrivate && members.length === 0} />
      </div>

      <div class="antiGrid-row">
        <div class="antiGrid-row__header">
          <Label label={kraTeam.string.Members} />
        </div>
        <AccountArrayEditor
          value={members}
          label={kraTeam.string.Members}
          onChange={handleMembersChanged}
          kind={'regular'}
          size={'large'}
        />
      </div>

      {#each roles as role}
        <div class="antiGrid-row">
          <div class="antiGrid-row__header">
            <Label label={kraTeam.string.RoleLabel} params={{ role: role.name }} />
          </div>
          <AccountArrayEditor
            value={rolesAssignment?.[role._id] ?? []}
            label={kraTeam.string.Members}
            includeItems={members}
            readonly={members.length === 0}
            onChange={(refs) => {
              handleRoleAssignmentChanged(role._id, refs)
            }}
            kind={'regular'}
            size={'large'}
          />
        </div>
      {/each}
    </div>
  </div>
</Card>
