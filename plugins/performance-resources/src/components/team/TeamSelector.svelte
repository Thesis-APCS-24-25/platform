<script lang="ts">
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import performance from '../../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { getClient, createQuery } from '@hcengineering/presentation'
  import { currentTeam as selectedTeam } from '../../utils/team'
  import {
    AnySvelteComponent,
    Button,
    eventToHTMLElement,
    Icon,
    IconChevronDown,
    IconWithEmoji,
    showPopup
  } from '@hcengineering/ui'
  import SpacesPopup from '@hcengineering/presentation/src/components/SpacesPopup.svelte'
  import { ComponentType, createEventDispatcher } from 'svelte'
  import { Asset } from '@hcengineering/platform'
  import view from '@hcengineering/view'

  const me = getCurrentAccount()._id
  const dispatch = createEventDispatcher()
  async function findDefaultSpace (): Promise<Team | undefined> {
    const client = getClient()
    $selectedTeam = (localStorage.getItem(performance.string.SelectTeam) ?? undefined) as Ref<Team> | undefined
    if ($selectedTeam === undefined) {
      const team = await client.findOne(kraTeam.class.Team, {
        members: me
      })
      if (team !== undefined) {
        $selectedTeam = team._id
        localStorage.setItem(performance.string.SelectTeam, team._id)
      }
      return team
    }
    if ($selectedTeam === undefined) {
      $selectedTeam = '' as Ref<Team>
      return undefined
    }
    return await client.findOne(kraTeam.class.Team, {
      _id: $selectedTeam
    })
  }

  let team: Team | undefined = undefined
  const teamQ = createQuery()
  $: teamQ.query(
    kraTeam.class.Team,
    {
      _id: $selectedTeam ?? '' as Ref<Team>
    },
    (res) => {
      team = res[0]
    }
  )
  export let iconWithEmoji: AnySvelteComponent | Asset | ComponentType | undefined = view.ids.IconWithEmoji
  export let defaultIcon: AnySvelteComponent | Asset | ComponentType = kraTeam.icon.Team

  $: void findDefaultSpace()
</script>

<Button
  size="large"
  kind="primary"
  width="100%"
  justify="center"
  icon={team?.icon === iconWithEmoji && iconWithEmoji !== undefined ? IconWithEmoji : team?.icon ?? defaultIcon}
  iconProps={team?.icon === iconWithEmoji && iconWithEmoji !== undefined
    ? { icon: team?.color, size: 'medium' }
    : { size: 'medium' }}
  on:click={(ev) => {
    showPopup(
      SpacesPopup,
      {
        _class: kraTeam.class.Team,
        selected: $selectedTeam
      },
      eventToHTMLElement(ev),
      (res) => {
        if (res !== undefined) {
          dispatch('change', res._id)
        }
      }
    )
  }}
>
  <svelte:fragment slot="content">
    <span class="uppercase name">
      {team?.name}
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
