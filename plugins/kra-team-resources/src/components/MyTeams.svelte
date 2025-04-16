<script lang="ts">
  import { SpecialView } from '@hcengineering/workbench-resources'
  import kraTeam from '../plugins'
  import { myTeams } from '../utils'
  import { Team } from '@hcengineering/kra-team'

  let teams: Team[] = []
  myTeams.subscribe((res) => {
    teams = res
  })

</script>

<SpecialView
  _class={kraTeam.class.Team}
  icon={kraTeam.icon.Teams}
  label={kraTeam.string.MyTeams}
  baseQuery={{
    _id: {
      $in: teams.map((team) => team._id)
    }
  }}
/>
