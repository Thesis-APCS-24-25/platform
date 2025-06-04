<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import performance from '../../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import { currentTeam as selectedTeam } from '../../utils/team'
  import {
    AnySvelteComponent,
    Button,
    eventToHTMLElement,
    Icon,
    IconChevronDown,
    IconWithEmoji,
    showPopup,
    getCurrentLocation,
    navigate
  } from '@hcengineering/ui'
  import SpacesPopup from '@hcengineering/presentation/src/components/SpacesPopup.svelte'
  import { ComponentType, createEventDispatcher } from 'svelte'
  import { Asset } from '@hcengineering/platform'
  import view from '@hcengineering/view'

  const me = getCurrentAccount()._id
  const dispatch = createEventDispatcher()

  let team: Team | undefined = undefined
  let teams: Team[] = []
  const teamQ = createQuery()

  const SELECT_TEAM_KEY = performance.string.SelectTeam

  $: fetchTeams()

  function fetchTeams (): void {
    teamQ.query(kraTeam.class.Team, { members: me }, (res) => {
      teams = res
      if (res.length > 0) {
        const storedTeamId = localStorage.getItem(SELECT_TEAM_KEY) as Ref<Team> | undefined
        team = res.find((t) => t._id === storedTeamId) ?? res[0]
        $selectedTeam = team._id
        localStorage.setItem(SELECT_TEAM_KEY, team._id)
      } else {
        resetTeamSelection()
      }
    })
  }

  function resetTeamSelection (): void {
    team = undefined
    $selectedTeam = undefined
    localStorage.removeItem(SELECT_TEAM_KEY)
  }

  export let iconWithEmoji: AnySvelteComponent | Asset | ComponentType = view.ids.IconWithEmoji
  export let defaultIcon: AnySvelteComponent | Asset | ComponentType = kraTeam.icon.Team

  function handleButtonClick (ev: MouseEvent): void {
    showPopup(
      SpacesPopup,
      {
        _class: kraTeam.class.Team,
        selected: $selectedTeam
      },
      eventToHTMLElement(ev),
      (res) => {
        if (res !== undefined) {
          updateSelectedTeam(res)
          dispatch('change', res)
        }
      }
    )
  }

  function updateSelectedTeam (selected: Team): void {
    if ($selectedTeam === selected._id) return

    team = selected
    $selectedTeam = selected._id
    localStorage.setItem(SELECT_TEAM_KEY, $selectedTeam)

    const cur = getCurrentLocation()
    const loc = {
      path: [cur.path[0], cur.path[1], cur.path[2]],
      fragment: cur.fragment
    }
    navigate(loc)
  }
</script>

<Button
  size="large"
  kind="primary"
  width="100%"
  justify="center"
  icon={team?.icon === iconWithEmoji ? IconWithEmoji : team?.icon ?? defaultIcon}
  iconProps={team?.icon === iconWithEmoji ? { icon: team?.color, size: 'medium' } : { size: 'medium' }}
  on:click={handleButtonClick}
>
  <svelte:fragment slot="content">
    <span class="uppercase name">
      {team?.name ?? 'No Team Selected'}
    </span>
  </svelte:fragment>
  <svelte:fragment slot="iconRight">
    <Icon icon={IconChevronDown} size="small" />
  </svelte:fragment>
</Button>

<style lang="scss">
  .name {
    width: 100%;
    font-weight: 600;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
