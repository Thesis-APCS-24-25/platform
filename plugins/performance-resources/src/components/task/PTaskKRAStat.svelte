<script lang="ts">
  import { KRA, PTask } from '@hcengineering/performance'
  import { Icon, Loading, tooltip } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import { calculateCompletionLevel } from '../../utils/kra'
  import KpiProgressCircle from '../progress/kpi/KpiProgressCircle.svelte'
  import { Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import { Member } from '@hcengineering/kra-team'

  const client = getClient()

  export let docs: PTask[] | undefined = undefined
  export let value: Ref<KRA> | undefined | null = undefined
  export let category: string | undefined = undefined

  let weight: number | undefined

  $: if (category === 'kra' && docs !== undefined && docs.length > 0 && value != null) {
    void client.findOne(
      performance.class.EmployeeKRA,
      {
        kra: value,
        assignee: docs[0].assignee as Ref<Member>
      }
    ).then((res) => {
      weight = res?.weight
    })
  }

  $: total = Promise.all(docs !== undefined ? docs.map(calculateCompletionLevel) : []).then((progresses) =>
    progresses.reduce((acc, progress) => (acc ?? 0) + (progress ?? 0), 0)
  )
</script>

{#await total}
  <Loading />
{:then total}
  {#if total !== undefined && category === 'kra' && value != null}
    <FixedColumn key="kra">
      <div
        class="flex-row-center flex-gap-1 total-weight"
        use:tooltip={{ label: performance.string.KRACompletionLevel }}
      >
        <KpiProgressCircle value={Math.round(total * 100)} size={'small'}/>
        <span class="text-bold">{Math.round(total * 100)}%</span>
        {#if weight !== undefined}
          x
          <span class="flex-row-center">
            <Icon icon={performance.icon.Weight} size={'inline'}/>
            {weight}%
          </span>
        {/if}
      </div>
    </FixedColumn>
  {/if}
{/await}

<style lang="scss">
  // .bar {
  //   width: 10rem;
  //   height: 8px;
  //   background-color: var(--theme-button-default);
  //   border-radius: 4px;
  //   overflow: hidden;
  // }

  // .progress {
  //   height: 100%;
  //   background-color: var(--theme-button-primary);
  //   border-radius: 4px;
  // }
</style>
