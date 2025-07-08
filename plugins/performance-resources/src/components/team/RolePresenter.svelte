<script lang="ts">
  import kraTeam, { Member, Team, TeamType } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import { currentTeam } from '../../utils/team'
  import { PersonAccount } from '@hcengineering/contact'
  import core, { Ref, Role, RolesAssignment } from '@hcengineering/core'
  import { personAccountByIdStore, personAccountByPersonId } from '@hcengineering/contact-resources'

  export let value: Ref<PersonAccount> | undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const team = $currentTeam
  function getRolesAssignment(team?: Team, typeType?: TeamType, roles?: Role[]): RolesAssignment {
    if (team === undefined || typeType?.targetClass === undefined || roles === undefined) {
      return {}
    }

    const asMixin = hierarchy.as(team, typeType?.targetClass)

    return roles.reduce<RolesAssignment>((prev, { _id }) => {
      prev[_id] = (asMixin as any)[_id] ?? []

      return prev
    }, {})
  }

  $: data = client.findOne(kraTeam.class.Team, { _id: team }).then(async (team) => {
    const typeType = await client.findOne(kraTeam.class.TeamType, { _id: team?.type })
    const roles = await client.findAll(core.class.Role, { attachedTo: typeType?._id })
    const rolesAssignment = getRolesAssignment(team, typeType, roles)
    const role = roles.find((role) => {
      if (value !== undefined) {
        return rolesAssignment[role._id]?.includes(value)
      }
      return false
    })
    return {
      team,
      typeType,
      roles,
      role,
      rolesAssignment
    }
  })
</script>

{#await data then { team, typeType, roles, role, rolesAssignment }}
  {#if team !== undefined && typeType !== undefined && roles !== undefined && role !== undefined}
    {role.name}
  {/if}
{/await}
