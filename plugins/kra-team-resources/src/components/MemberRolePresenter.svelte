<script lang="ts">
  import { Member, Team, TeamType } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import core, { Ref, Role, RolesAssignment } from '@hcengineering/core'
  import kraTeam from '../plugins'
  import { location } from '@hcengineering/ui'
  import { decodeObjectURI } from '@hcengineering/view'
  import { onDestroy } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { personAccountByPersonId } from '@hcengineering/contact-resources'

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
        const p = $personAccountByPersonId.get(value?._id)?.[0]
        return p !== undefined ? rolesAssignment[role._id]?.includes(p?._id) : false
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

  async function handleRoleChanged (
    team: Team,
    typeType: TeamType,
    roles: Role[],
    event: CustomEvent<Ref<Role>>
  ): Promise<void> {
    if (value === undefined) {
      return
    }

    const { detail: role } = event
    const memberId = $personAccountByPersonId.get(value._id)?.[0]._id

    const updateData = {
      $push: {} as any,
      $pull: {} as any
    }
    updateData.$push[role] = memberId
    roles.forEach((r) => {
      if (r._id !== role) {
        updateData.$pull[r._id] = memberId
      }
    })
    await client.updateMixin(team._id, kraTeam.class.Team, core.space.Space, typeType.targetClass, updateData)
  }
</script>

{#await data then { team, typeType, roles, role, rolesAssignment }}
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
      on:change={handleRoleChanged.bind(undefined, team, typeType, roles)}
    />
  {/if}
{/await}
