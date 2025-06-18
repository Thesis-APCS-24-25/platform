<script lang="ts">
  import {
    Button,
    showPopup,
    EditBox,
    Label,
    getPlatformColorDef,
    getPlatformColorForTextDef,
    themeStore,
    getColorNumberByText,
    IconWithEmoji
  } from '@hcengineering/ui'
  import { AccountArrayEditor } from '@hcengineering/contact-resources'
  import { Card, createQuery } from '@hcengineering/presentation'
  import kraTeam from '../plugins'
  import core, { Account, Role, RolesAssignment, Arr, Ref, SpaceType } from '@hcengineering/core'
  import view from '@hcengineering/view'
  import { Asset } from '@hcengineering/platform'
  import { IconPicker } from '@hcengineering/view-resources'

  import { createNewTeam } from '../utils'
  import { createEventDispatcher } from 'svelte'
  import { PersonAccount } from '@hcengineering/contact'

  let name = ''
  const description = ''
  const isPrivate = false
  let members: Arr<Ref<PersonAccount>> = []
  let icon: Asset = kraTeam.icon.Home
  let rolesAssignment: RolesAssignment | undefined = undefined
  let color = getColorNumberByText(name)

  let typeType: SpaceType | undefined = undefined
  const typeTypeQuery = createQuery()
  typeTypeQuery.query(core.class.SpaceType, { _id: kraTeam.spaceType.TeamType }, (res) => {
    typeType = res[0]
  })

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

  $: canSave = name.length > 0 && (rolesAssignment?.[kraTeam.role.TeamManager] ?? []).length > 0 && members.length > 0

  async function handleOk (): Promise<void> {
    if (typeType === undefined || rolesAssignment === undefined) {
      return
    }
    await createNewTeam(name, description, isPrivate, typeType, members, [], rolesAssignment, icon, color)
    dispatch('close')
  }

  function handleMembersChanged (newPersons: Ref<Account>[]): void | Promise<void> {
    membersChanged = true
    const newMembers = newPersons.map((m) => m as Ref<PersonAccount>).filter((m) => m !== undefined && m !== null)

    // If a member was removed we need to remove it from any roles assignments as well
    const newMembersSet = new Set(newMembers)
    const removedMembersSet = new Set(members.filter((m) => !newMembersSet.has(m)))

    if (removedMembersSet.size > 0 && rolesAssignment !== undefined) {
      for (const [key, value] of Object.entries(rolesAssignment)) {
        rolesAssignment[key as Ref<Role>] =
          value != null ? value.filter((m) => !removedMembersSet.has(m as Ref<PersonAccount>)) : undefined
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

<Card label={kraTeam.string.CreateTeam} okAction={handleOk} {canSave} width="medium" on:close>
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

      <div class="antiGrid-row">
        <div class="antiGrid-row__header">
          <Label label={kraTeam.string.Manager} />
        </div>
        <AccountArrayEditor
          value={rolesAssignment?.[kraTeam.role.TeamManager] ?? []}
          label={kraTeam.string.Members}
          includeItems={members}
          readonly={members.length === 0}
          onChange={(refs) => {
            handleRoleAssignmentChanged(kraTeam.role.TeamManager, refs)
          }}
          kind={'regular'}
          size={'large'}
        />
      </div>
    </div>
  </div>
</Card>
