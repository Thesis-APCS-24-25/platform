import { Builder } from '@hcengineering/model'
import core from '@hcengineering/core'
import kraTeam from './plugin'

export function definePermissions(builder: Builder) {
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
}
