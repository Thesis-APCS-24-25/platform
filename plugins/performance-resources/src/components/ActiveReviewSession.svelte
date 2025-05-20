<script lang="ts">
  import ObjectPresenter from '@hcengineering/view-resources/src/components/ObjectPresenter.svelte'
  import performance from '../plugin'
  import { Ref } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { createQuery } from '@hcengineering/presentation'
  import { activeReviewSession } from '../store'

  export let currentSpace: Ref<Team>
  const query = createQuery()
  $: query.query(
    performance.class.ReviewSession,
    {
      space: currentSpace
    },
    (res) => {
      if (res !== undefined && res.length > 0) {
        $activeReviewSession = res[0]._id
      } else {
        $activeReviewSession = undefined
      }
    }
  )
</script>

{#if $activeReviewSession !== undefined}
  <ObjectPresenter objectId={$activeReviewSession} _class={performance.class.ReviewSession} />
{:else}
{/if}
