<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { Member, Team } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'

  export let value: Ref<Member>
  export let team: Ref<Team> | undefined = undefined
</script>

<div class="antiSection">
</div>
