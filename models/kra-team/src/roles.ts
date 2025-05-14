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
    permissions: [kraTeam.permission.CreateKra, kraTeam.permission.ApproveKra]
  }
]
