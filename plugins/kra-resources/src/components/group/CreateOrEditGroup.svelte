<script lang="ts">
  import { Analytics } from '@hcengineering/analytics'
  import { Employee } from '@hcengineering/contact'
  import { AccountArrayEditor, AssigneeBox } from '@hcengineering/contact-resources'
  import core, {
    Account,
    Data,
    DocumentUpdate,
    Ref,
    Role,
    RolesAssignment,
    SortingOrder,
    SpaceType,
    generateId,
    getCurrentAccount
  } from '@hcengineering/core'
  import { Asset } from '@hcengineering/platform'
  import presentation, { Card, createQuery, getClient } from '@hcengineering/presentation'
  import task, { ProjectType, TaskType } from '@hcengineering/task'
  import { taskTypeStore, typeStore } from '@hcengineering/task-resources'
  import {
    Button,
    Component,
    EditBox,
    IconWithEmoji,
    Label,
    Toggle,
    getColorNumberByText,
    getPlatformColorDef,
    getPlatformColorForTextDef,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { IconPicker } from '@hcengineering/view-resources'
  import { deepEqual } from 'fast-equals'
  import { createEventDispatcher } from 'svelte'
  import kra from '../../plugin'
  import { Group } from '@hcengineering/kra'

  export let group: Group | undefined = undefined

  const isNew = group == null
  let name: string = group?.name ?? ''
  let description = group?.description ?? ''
  let canSave = true
  let members: Ref<Account>[] = []
  let icon: Asset | undefined = group?.icon ?? kra.icon.Home
  let color = group?.color ?? getColorNumberByText(name)
  let isPrivate = false
  let owners: Ref<Account>[] = []
  let rolesAssignment: RolesAssignment | undefined

  const client = getClient()

  function collectGroupData(): Omit<Data<Group>, 'type'> {
    return {
      name,
      description,
      private: true,
      members,
      archived: false
    }
  }

  async function handleSave() {
    if (isNew) {
      await createGroup()
    }
  }
  function chooseColor() {}
  function chooseIcon(ev: MouseEvent): void {
    const update = (result: any) => {
      if (result !== undefined && result !== null) {
        icon = result.icon
        color = result.color
      }
    }
    showPopup(IconPicker, { icon, color }, 'top', update, update)
  }

  const dispatch = createEventDispatcher()

  function close(id?: Ref<Group>): void {
    dispatch('close', id)
  }

  function handleMembersChanged(newMembers: Ref<Account>[]): void {
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

  function handleOwnersChanged(newOwners: Ref<Account>[]): void {
    owners = newOwners

    const newMembersSet = new Set([...members, ...newOwners])
    members = Array.from(newMembersSet)
  }

  async function createGroup(): Promise<void> {
    const groupId = generateId<Group>()
    await client.createDoc(
      kra.class.Group,
      core.space.Space,
      { ...collectGroupData(), type: kra.spaceType.Group },
      groupId
    )
    close(groupId)
  }
</script>

<Card
  label={isNew ? kra.string.NewGroup : kra.string.EditGroup}
  okLabel={isNew ? presentation.string.Create : presentation.string.Save}
  okAction={handleSave}
  {canSave}
  accentHeader
  width={'medium'}
  gap={'gapV-6'}
  onCancel={close}
  on:changeContent
>
  <div class="antiGrid">
    <div class="antiGrid-row">
      <div class="antiGrid-row__header">
        <Label label={kra.string.GroupTitle} />
      </div>
      <div class="padding">
        <EditBox
          id="group-title"
          bind:value={name}
          placeholder={kra.string.GroupTitlePlaceholder}
          kind={'large-style'}
          autoFocus
        />
      </div>
    </div>

    <div class="antiGrid-row">
      <div class="antiGrid-row__header topAlign">
        <Label label={kra.string.Description} />
      </div>
      <div class="padding clear-mins">
        <EditBox id="group-description" bind:value={description} placeholder={kra.string.GroupDescriptionPlaceholder} />
      </div>
    </div>
  </div>

  <div class="antiGrid">
    <div class="antiGrid-row">
      <div class="antiGrid-row__header">
        <Label label={kra.string.ChooseIcon} />
      </div>
      <Button
        icon={icon === view.ids.IconWithEmoji ? IconWithEmoji : icon ?? kra.icon.Home}
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
        allowGuests
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
        <Label label={kra.string.Members} />
      </div>
      <AccountArrayEditor
        value={members}
        label={kra.string.Members}
        onChange={handleMembersChanged}
        kind={'regular'}
        size={'large'}
        allowGuests
      />
    </div>
  </div></Card
>
