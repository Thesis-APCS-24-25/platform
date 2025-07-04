import { type Resources } from '@hcengineering/platform'
import KraTemplates from './components/KraTemplates.svelte'
import CreateTeam from './components/CreateTeam.svelte'
import TeamSpacePresenter from './components/teams/TeamSpacePresenter.svelte'
import Members from './components/Members.svelte'
import Team from './components/Team.svelte'
import MyTeams from './components/MyTeams.svelte'
import MemberRolePresenter from './components/MemberRolePresenter.svelte'
import RolePresenter from './components/RolePresenter.svelte'
import { currentTeam } from './stores'
import { removePersonsFromTeam } from './utils'
import { get } from 'svelte/store'
import { type Person } from '@hcengineering/contact'
import AllMembers from './components/AllMembers.svelte'

export * from './utils'

async function removeMember (doc: Person | Person[]): Promise<void> {
  const team = get(currentTeam)
  if (team === undefined) {
    return
  }
  if (!Array.isArray(doc)) {
    doc = [doc]
  }
  const refs = doc.map((p) => p._id)
  await removePersonsFromTeam(refs, team)
}

async function shouldDisplayRemoveMemberAction (_doc: Person | Person[]): Promise<boolean> {
  const team = get(currentTeam)
  if (team === undefined) {
    return false
  }
  return true
}

export default async (): Promise<Resources> => ({
  component: {
    KraTemplates,
    CreateTeam,
    TeamSpacePresenter,
    Members,
    MemberRolePresenter,
    RolePresenter,
    Team,
    AllMembers,
    MyTeams
  },
  function: {
    ShouldDisplayRemoveMemberAction: shouldDisplayRemoveMemberAction
  },
  actionImpl: {
    RemoveMember: removeMember
  }
})
