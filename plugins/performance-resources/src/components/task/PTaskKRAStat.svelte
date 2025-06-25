<script lang="ts">
  import { PTask } from '@hcengineering/performance'
  import { Icon, Loading, tooltip } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import { calculateCompletionLevel } from '../../utils/kra'
  import KpiProgressCircle from '../progress/kpi/KpiProgressCircle.svelte'

  export let docs: PTask[] | undefined = undefined
  export let category: string | undefined = undefined

  $: total = Promise.all(docs !== undefined ? docs.map(calculateCompletionLevel) : []).then((progresses) =>
    progresses.reduce((acc, progress) => (acc ?? 0) + (progress ?? 0), 0)
  )
</script>

{#await total}
  <Loading />
{:then total}
  {#if total !== undefined && category === 'kra'}
    <FixedColumn key="kra">
      <div class="flex-row-center flex-gap-1 total-weight">
        <Icon icon={performance.icon.GoalFlag} size="small" iconProps={{}} />
        <KpiProgressCircle value={Math.round(total)} />
        <span class="text-bold">{Math.round(total)}%</span>
      </div>
    </FixedColumn>
  {/if}
{/await}

<style lang="scss">
  .bar {
    width: 10rem;
    height: 8px;
    background-color: var(--theme-button-default);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: var(--theme-button-primary);
    border-radius: 4px;
  }
</style>
