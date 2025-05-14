<script lang="ts">
  import { NavLink, getActions, TreeElement } from '@hcengineering/view-resources'
  import view from '@hcengineering/view'
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import core, { Ref } from '@hcengineering/core'
  import {
    Action,
    getPlatformColorDef,
    getPlatformColorForTextDef,
    Icon,
    IconEdit,
    IconWithEmoji,
    themeStore
  } from '@hcengineering/ui'
  import contact from '@hcengineering/contact'
  import { getResource } from '@hcengineering/platform'

  export let team: Team
  export let currentTeam: Ref<Team> | undefined

  $: selected = team._id === currentTeam
  const client = getClient()
  async function getTeamActions (): Promise<Action[]> {
    const result: Action[] = []
    const extraActions = await getActions(client, team, core.class.Space)
    for (const act of extraActions) {
      result.push({
        icon: act.icon ?? IconEdit,
        label: act.label,
        group: act.context.group,
        action: async (_ctx: any, evt: Event) => {
          const impl = await getResource(act.action)
          await impl(team, evt, act.actionProps)
        }
      })
    }
    return result
  }
</script>

<NavLink app={'kra-team'} space={team._id} special={'members'} shrink={1}>
  <TreeElement
    title={team.name}
    icon={team.icon === view.ids.IconWithEmoji ? IconWithEmoji : team.icon ?? kraTeam.icon.Teams}
    iconProps={team.icon === view.ids.IconWithEmoji
      ? { icon: team.color }
      : {
          fill:
            team.color !== undefined
              ? getPlatformColorDef(team.color, $themeStore.dark).icon
              : getPlatformColorForTextDef(team.name, $themeStore.dark).icon
        }}
    {selected}
    actions={getTeamActions}
  >
    <div class="member-count" slot="extra">
      {team.members.length}
      <Icon icon={contact.icon.Contacts} size={'smaller'} />
    </div>
  </TreeElement>
</NavLink>

<style lang="scss">
  .member-count {
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
    justify-content: center;
    gap: 0.25rem;
  }
</style>
