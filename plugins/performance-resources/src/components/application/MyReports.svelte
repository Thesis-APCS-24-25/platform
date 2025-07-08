<script lang="ts">
  import performance from '../../plugin'
  import { TableBrowser } from '@hcengineering/view-resources'
  import { createQuery } from '@hcengineering/presentation'
  import { currentTeam } from '../../utils/team'
  import { ReviewSession } from '@hcengineering/performance'
  import { Breadcrumb, Header } from '@hcengineering/ui'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { PersonAccount } from '@hcengineering/contact'

  const me = getCurrentAccount()._id as Ref<PersonAccount>

  let reviewSessions: ReviewSession[] | undefined = undefined
  const query = createQuery()
  $: query.query(
    performance.class.ReviewSession,
    {
      space: $currentTeam
    },
    (res) => {
      reviewSessions = res as ReviewSession[]
    }
  )
</script>

<Header>
  <Breadcrumb icon={performance.icon.Reports} label={performance.string.MyReports} size='large'/>
</Header>
<TableBrowser
  _class={performance.class.PerformanceReport}
  query={{
    space: { $in: reviewSessions?.map((rs) => rs._id) },
    reviewee: me
  }}
  config={[
    { key: 'space', label: performance.string.ReviewSession },
    {
      key: '',
      label: performance.string.Report
    },
    {
      key: '',
      presenter: performance.component.ScorePresenter,
      label: performance.string.ScorePreview
    },
    {
      key: 'score',
      presenter: performance.component.ScorePresenter,
      label: performance.string.GradedScore
    }
  ]}
/>
