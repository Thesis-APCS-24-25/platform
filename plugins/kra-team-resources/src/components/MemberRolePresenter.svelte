<script lang="ts">
  import { Member, Team, TeamType } from '@hcengineering/kra-team'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import core, { Account, Ref, Role, RolesAssignment, Space } from '@hcengineering/core'
  import kraTeam from '../plugins'
  import contact from '@hcengineering/contact'
  import { currentTeam } from '../utils'
  import { Button, location, SelectPopup, showPopup } from '@hcengineering/ui'
  import { decodeObjectURI } from '@hcengineering/view'
  import { onDestroy } from 'svelte'
  import { ObjectBox, ObjectPresenter } from '@hcengineering/view-resources'
  import { deepEqual } from 'fast-equals'
  import { Project } from '@hcengineering/task'

  export let value: Member | undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()

  let currentSpace: Ref<Team> | undefined = undefined

  const unsubcribe = location.subscribe((loc) => {
    const [id] = decodeObjectURI(loc.path[3])
    currentSpace = id as Ref<Team>
  })
  onDestroy(() => {
    unsubcribe()
  })

  $: data = client.findOne(kraTeam.class.Team, { _id: currentSpace }).then(async (team) => {
    const typeType = await client.findOne(kraTeam.class.TeamType, { _id: team?.type })
    const roles = await client.findAll(core.class.Role, { attachedTo: typeType?._id })
    const rolesAssignment = getRolesAssignment(team, typeType, roles)
    const role = roles.find((role) => {
      if (value !== undefined) {
        return rolesAssignment[role._id]?.includes(value?._id)
      }
      return false
    })
    return {
      team,
      typeType,
      role: role?._id,
      rolesAssignment
    }
  })

  function getRolesAssignment (team?: Team, typeType?: TeamType, roles?: Role[]): RolesAssignment {
    if (team === undefined || typeType?.targetClass === undefined || roles === undefined) {
      return {}
    }

    const asMixin = hierarchy.as(team, typeType?.targetClass)

    return roles.reduce<RolesAssignment>((prev, { _id }) => {
      prev[_id] = (asMixin as any)[_id] ?? []

      return prev
    }, {})
  }

  async function handleRoleChanged (
    team: Team,
    typeType: TeamType,
    rolesAssignment: RolesAssignment,
    event: CustomEvent<Ref<Role>>
  ): Promise<void> {
    if (value === undefined) {
      return
    }

    const { detail: role } = event
    const memberId = value._id

    const newAssignment = Object.entries(rolesAssignment).reduce<RolesAssignment>((acc, [key, members]) => {
      const updatedMembers = members?.filter((id) => id !== memberId) ?? []
      if (key === role) {
        updatedMembers.push(memberId)
      }
      return { ...acc, [key]: updatedMembers }
    }, {})

    if (!deepEqual(newAssignment, rolesAssignment)) {
      await client.updateMixin(team._id, kraTeam.class.Team, core.space.Space, typeType.targetClass, newAssignment)
    }
  }
</script>

{#await data then { team, typeType, role, rolesAssignment }}
  {#if team !== undefined && typeType !== undefined && rolesAssignment !== undefined}
    <ObjectBox
      _class={core.class.Role}
      docQuery={{
        attachedTo: typeType?._id
      }}
      value={role}
      kind="list"
      allowDeselect
      label={kraTeam.string.Role}
      showNavigate={false}
      on:change={handleRoleChanged.bind(undefined, team, typeType, rolesAssignment)}
    />
  {/if}
{/await}
