import { type Builder, Prop } from '@hcengineering/model'
import { TTeamTypeData } from './types'
import kraTeam from './plugin'
import core from '@hcengineering/core'
import roles from './roles'
import { getRoleAttributeProps } from '@hcengineering/setting'

const permissions = [
  kraTeam.permission.CreateKra,
  kraTeam.permission.ApproveKra,
  kraTeam.permission.CreateReviewSession,
  kraTeam.permission.ViewDashboard,
  kraTeam.permission.AssignWeightForAll
]

export function defineSpaceTypes (builder: Builder): void {
  for (const role of roles) {
    const { label, roleType } = getRoleAttributeProps(role.name)

    Prop(roleType, label)(TTeamTypeData.prototype, role._id)
  }

  builder.createModel(TTeamTypeData)
  builder.createDoc(
    kraTeam.class.TeamTypeDescriptor,
    core.space.Model,
    {
      name: kraTeam.string.Team,
      description: kraTeam.string.Description,
      icon: kraTeam.icon.Team,
      baseClass: kraTeam.class.Team,
      availablePermissions: [...permissions]
    },
    kraTeam.descriptor.TeamType
  )

  builder.createDoc(
    kraTeam.class.TeamType,
    core.space.Model,
    {
      name: 'Default Team',
      descriptor: kraTeam.descriptor.TeamType,
      roles: roles.length,
      targetClass: kraTeam.mixin.TeamTypeData
    },
    kraTeam.spaceType.TeamType
  )

  roles.forEach((role) => {
    builder.createDoc(
      core.class.Role,
      core.space.Model,
      {
        attachedTo: kraTeam.spaceType.TeamType,
        attachedToClass: kraTeam.class.TeamType,
        collection: 'roles',
        name: role.name,
        permissions: role.permissions
      },
      role._id
    )
  })
}
