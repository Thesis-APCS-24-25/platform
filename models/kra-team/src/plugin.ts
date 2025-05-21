import { type Permission, type Ref, type Role } from '@hcengineering/core'
import kraTeam, { kraTeamId } from '@hcengineering/kra-team'
import { type IntlString, mergeIds } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import { type ViewAction } from '@hcengineering/view'

export default mergeIds(kraTeamId, kraTeam, {
  string: {
    Roles: '' as IntlString,
    Team: '' as IntlString,
    Teams: '' as IntlString,
    AllTeams: '' as IntlString,
    CreateTeam: '' as IntlString,
    Description: '' as IntlString,
    Metrics: '' as IntlString,
    Name: '' as IntlString,
    KRATemplates: '' as IntlString,
    Members: '' as IntlString,
    ApproveKra: '' as IntlString,
    ApproveKraDescription: '' as IntlString,
    CreateKra: '' as IntlString,
    CreateKraDescription: '' as IntlString,
    RemoveMember: '' as IntlString
  },
  component: {
    RolePresenter: '' as AnyComponent,
    MemberRolePresenter: '' as AnyComponent,
    Team: '' as AnyComponent,
    MemberPresenter: '' as AnyComponent,
    CreateTeam: '' as AnyComponent,
    Members: '' as AnyComponent,
    KraTemplates: '' as AnyComponent,
    TeamSpacePresenter: '' as AnyComponent
  },
  permission: {
    ApproveKra: '' as Ref<Permission>,
    CreateKra: '' as Ref<Permission>
  },
  role: {
    TeamMember: '' as Ref<Role>,
    TeamManager: '' as Ref<Role>
  },
  actionImpl: {
    RemoveMember: '' as ViewAction
  }
})
