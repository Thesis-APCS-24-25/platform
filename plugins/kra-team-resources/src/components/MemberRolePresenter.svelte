<script lang="ts">
  import { Member, Team, TeamType } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import core, { Ref, Role, RolesAssignment } from '@hcengineering/core'
  import kraTeam from '../plugins'
  import { location } from '@hcengineering/ui'
  import { decodeObjectURI } from '@hcengineering/view'
  import { onDestroy } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { assignRoleToMember } from '../utils'

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
      roles,
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
</script>

{#await data then { team, typeType, role, rolesAssignment, roles }}
  {#if value !== undefined && team !== undefined && typeType !== undefined && rolesAssignment !== undefined}
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
      on:change={async (event) => {
        await assignRoleToMember(team._id, typeType, roles, value?._id, event.detail)
      }}
    />
  {/if}
{/await}
