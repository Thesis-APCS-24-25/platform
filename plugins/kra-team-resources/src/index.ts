import { type Resources } from '@hcengineering/platform'
import KraTemplates from './components/KraTemplates.svelte'
import CreateTeam from './components/CreateTeam.svelte'
import TeamSpacePresenter from './components/teams/TeamSpacePresenter.svelte'
import Members from './components/Members.svelte'
import MemberPresenter from './components/MemberPresenter.svelte'

export default async (): Promise<Resources> => ({
  component: {
    KraTemplates,
    CreateTeam,
    TeamSpacePresenter,
    Members,
    MemberPresenter,
  }
})
