import { type Builder } from '@hcengineering/model'
import core from '@hcengineering/core'
import kraTeam from './plugin'

export function definePermissions (builder: Builder): void {
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: kraTeam.string.ApproveKra,
      description: kraTeam.string.ApproveKraDescription
    },
    kraTeam.permission.ApproveKra
  )
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: kraTeam.string.CreateKra,
      description: kraTeam.string.CreateKraDescription
    },
    kraTeam.permission.CreateKra
  )
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: kraTeam.string.CreateReviewSession,
      description: kraTeam.string.CreateReviewSessionDescription
    },
    kraTeam.permission.CreateReviewSession
  )
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: kraTeam.string.AssignWeightForAll,
      description: kraTeam.string.AssignWeightForAllDescription
    },
    kraTeam.permission.AssignWeightForAll
  )
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: kraTeam.string.ViewDashboard,
      description: kraTeam.string.ViewDashboardDescription
    },
    kraTeam.permission.ViewDashboard
  )
}
