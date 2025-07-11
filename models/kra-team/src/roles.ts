import core from '@hcengineering/model-core'
import kraTeam from './plugin'

export default [
  {
    _id: kraTeam.role.TeamMember,
    name: 'Team Member',
    permissions: [kraTeam.permission.CreateKra]
  },
  {
    _id: kraTeam.role.TeamManager,
    name: 'Team Manager',
    permissions: [
      kraTeam.permission.CreateKra,
      kraTeam.permission.ApproveKra,
      kraTeam.permission.AssignWeightForAll,
      kraTeam.permission.ViewDashboard,
      kraTeam.permission.CreateReviewSession,
      kraTeam.permission.GradeReport,
      core.permission.ArchiveSpace
    ]
  }
]
