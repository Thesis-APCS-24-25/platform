<script lang="ts">
  import { createQuery } from '@hcengineering/presentation'
  import ReportPanel from '../report/ReportPanel.svelte'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { PerformanceReport, ReviewSession } from '@hcengineering/performance'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { Label } from '@hcengineering/ui'

  export let currentSpace: Ref<ReviewSession>

  const me = getCurrentAccount()
  let report: PerformanceReport | undefined = undefined
  const query = createQuery()
  $: query.query(
    performance.class.PerformanceReport,
    {
      space: currentSpace,
      reviewee: me._id as Ref<PersonAccount>
    },
    (res) => {
      if (res.length > 0) {
        report = res[0] as PerformanceReport
      } else {
        report = undefined
      }
    },
    {
      limit: 1
    }
  )
</script>

{#if report}
  <ReportPanel _id={report._id} _class={performance.class.PerformanceReport} />
{:else}
  <div class="empty uppercase">
    <Label label={performance.string.NoMyReportDescription} />
  </div>
{/if}

<style>
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--theme-trans-color);
  }
</style>
