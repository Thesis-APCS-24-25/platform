<script lang="ts">
  import performance from '../plugin'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { ReviewSession } from '@hcengineering/performance'
  import { getClient } from '@hcengineering/presentation'
  import ObjectBox from '@hcengineering/view-resources/src/components/ObjectBox.svelte'

  export let currentTeam: Ref<Team>
  export let currentReviewSession: Ref<ReviewSession> | undefined = undefined

  async function findDefault (): Promise<ReviewSession | undefined> {
    const client = getClient()
    const rs = await client.findOne(
      performance.class.ReviewSession,
      {
        space: currentTeam
      }
    )
    return rs
  }

  $: void findDefault().then((rs) => {
    if (rs !== undefined) {
      currentReviewSession = rs._id
    }
  })
</script>

<ObjectBox
  width="100%"
  label={performance.string.ReviewSession}
  bind:value={currentReviewSession}
  _class={performance.class.ReviewSession}
  docQuery={{
    space: currentTeam
  }}
  showNavigate={false}
  {findDefault}
/>
