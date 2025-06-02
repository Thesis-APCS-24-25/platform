<script lang="ts">
  import { getClient } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Ref } from '@hcengineering/core'
  import { Goal, Kpi, RatingScale } from '@hcengineering/kra'
  import KpiEditorPopup from './kpi/EditKpiPopup.svelte'
  import RatingScaleEditorPopup from './ratingscale/EditRatingScalePopup.svelte'

  export let goal: Ref<Goal>

  const goalData = getClient()
    .findOne(kra.class.Goal, {
      _id: goal
    })
    .then((res) => {
      if (res !== undefined) {
        if (res._class === kra.class.Kpi) {
          return {
            kpi: res as Kpi,
            ratingScale: undefined
          }
        } else if (res._class === kra.class.RatingScale) {
          return {
            kpi: undefined,
            ratingScale: res as RatingScale
          }
        } else {
          throw new Error('Unsupported goal type')
        }
      } else {
        throw new Error('Goal not found')
      }
    })
</script>

{#await goalData then { kpi, ratingScale }}
  {#if kpi !== undefined}
    <KpiEditorPopup {kpi} on:close/>
  {:else if ratingScale !== undefined}
    <RatingScaleEditorPopup {ratingScale} on:close/>
  {:else}
    Unsupported goal type
  {/if}
{/await}
