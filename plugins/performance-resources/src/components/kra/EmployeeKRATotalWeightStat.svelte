<script lang="ts">
  import { EmployeeKRA } from '@hcengineering/performance'
  import { tooltip, Icon } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import KraWeightPresenter from './KRAWeightPresenter.svelte'
  import performance from '../../plugin'

  export let docs: EmployeeKRA[] | undefined = undefined
  export let category: string | undefined = undefined

  const shouldWarn = (value: number | undefined): boolean => {
    return value === undefined || Math.abs(value - 100) !== 0
  }

  $: sum =
    docs?.reduce((acc, kra) => {
      if (kra.weight !== undefined) {
        return acc + kra.weight
      }
      return acc
    }, 0) ?? 0
  $: warning = shouldWarn(sum)
</script>

{#if docs !== undefined && category === 'assignee'}
  <FixedColumn key="weight">
    <div
      class="flex-row-center flex-gap-1 total-weight"
      use:tooltip={warning
        ? { label: performance.string.KRAWeightNotFullWarning }
        : { label: performance.string.KRAWeightFull }}
    >
      <Icon
        icon={performance.icon.KRA}
        size="medium"
        iconProps={{
          ...(warning
            ? { fill: 'var(--theme-warning-color)' }
            : {
                fill: 'var(--theme-won-color)'
              })
        }}
      />
      <KraWeightPresenter value={sum} showPercent />
    </div>
  </FixedColumn>
{/if}
