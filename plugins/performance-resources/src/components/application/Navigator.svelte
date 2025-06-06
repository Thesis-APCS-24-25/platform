<script lang="ts">
  import { ReviewSession, ReviewSessionStatus } from '@hcengineering/performance'
  import { Ref, Space } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { currentTeam } from '../../utils/team'
  import SpaceNav from './SpaceNav.svelte'
  import { navigatorModel } from '../../navigation'
  import ActiveReviewSessionNav from './ActiveReviewSessionNav.svelte'
  import DraftingReviewSessionNav from './DraftingReviewSessionNav.svelte'
  import { Scroller } from '@hcengineering/ui'
  import { NavFooter } from '@hcengineering/workbench-resources'

  export let currentSpace: Ref<Space> | undefined
  export let currentSpecial: string | undefined
  export let deselect: boolean = false
  export let separate: boolean = false

  const models = navigatorModel.spaces

  let reviewSessions: ReviewSession[] = []
  const reviewSessionQ = createQuery()
  $: reviewSessionQ.query(
    performance.class.ReviewSession,
    {
      space: $currentTeam ?? ('' as Ref<Space>),
      archived: false
    },
    (res) => {
      reviewSessions = res as ReviewSession[]
    },
    {
      limit: 100
    }
  )

  function filter (reviewSessions: ReviewSession[], id: string): ReviewSession[] {
    if (id === 'active-review-sessions') {
      return reviewSessions.filter((ss) => ss.status === ReviewSessionStatus.InProgress)
    } else if (id === 'drafting-review-sessions') {
      return reviewSessions.filter((ss) => ss.status === ReviewSessionStatus.Drafting)
    } else if (id === 'concluded-review-sessions') {
      return reviewSessions.filter((ss) => ss.status === ReviewSessionStatus.Concluded)
    }
    return []
  }

  const activeReviewSessionModel = models[0]
  const draftingReviewSessionModel = models[1]
  const concludedReviewSessionModel = models[2]
</script>

<Scroller shrink>
  <ActiveReviewSessionNav
    {reviewSessions}
    model={activeReviewSessionModel}
    {currentSpace}
    {currentSpecial}
    {deselect}
    {separate}
  />
  <DraftingReviewSessionNav
    reviewSessions={filter(reviewSessions, draftingReviewSessionModel.id)}
    model={draftingReviewSessionModel}
    {currentSpace}
    {currentSpecial}
    {deselect}
    {separate}
  />
  <SpaceNav
    reviewSessions={filter(reviewSessions, concludedReviewSessionModel.id)}
    model={concludedReviewSessionModel}
    {currentSpace}
    {currentSpecial}
    {deselect}
    {separate}
  />
</Scroller>
<NavFooter />
