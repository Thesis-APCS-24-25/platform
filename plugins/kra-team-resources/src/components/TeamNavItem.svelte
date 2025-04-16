<script lang="ts">
  import { classIcon, NavLink, TreeItem } from '@hcengineering/view-resources'
  import kraTeam from '../plugins'
  import { kraTeamId, Team } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { Icon, Label } from '@hcengineering/ui'
  import contact from '@hcengineering/contact'

  export let team: Team
  export let currentTeam: Ref<Team> | undefined

  $: selected = team._id === currentTeam
  const client = getClient()
</script>

<NavLink app={'kra-team'} space={team._id} special={'members'} shrink={1}>
  <TreeItem title={team.name} icon={classIcon(client, team._class)} {selected}>
    <div class="member-count" slot="extra">
      {team.members.length}
      <Icon icon={contact.icon.Contacts} size={'smaller'} />
    </div>
  </TreeItem>
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
