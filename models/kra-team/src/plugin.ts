import { type Member } from '@hcengineering/contact'
import { kraTeamId } from '@hcengineering/kra-team'
import kraTeam from '@hcengineering/kra-team-resources/src/plugins'
import { type IntlString, mergeIds, type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'
import { type ViewActionAvailabilityFunction, type ViewAction } from '@hcengineering/view'

export default mergeIds(kraTeamId, kraTeam, {
  string: {
    Roles: '' as IntlString,
    Teams: '' as IntlString,
    Description: '' as IntlString,
    Metrics: '' as IntlString,
    Name: '' as IntlString,
    KRATemplates: '' as IntlString,
    ApproveKra: '' as IntlString,
    ApproveKraDescription: '' as IntlString,
    CreateKra: '' as IntlString,
    CreateKraDescription: '' as IntlString,
    CreateReviewSession: '' as IntlString,
    CreateReviewSessionDescription: '' as IntlString,
    AssignWeightForAll: '' as IntlString,
    AssignWeightForAllDescription: '' as IntlString,
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
  function: {
    ShouldDisplayRemoveMemberAction: '' as Resource<ViewActionAvailabilityFunction<Member>>
  },
  actionImpl: {
    RemoveMember: '' as ViewAction
  }
})
