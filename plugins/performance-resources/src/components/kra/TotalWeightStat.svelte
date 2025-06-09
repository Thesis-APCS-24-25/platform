<script lang="ts">
  const shouldWarn = (value: number | undefined): boolean => {
    return value === undefined || Math.abs(value - 1) > 0.0001
  }
</script>

<div
  class="flex-row-center flex-gap-1 total-weight"
  use:tooltip={shouldWarn(sums.get(category))
    ? { label: performance.string.KRAWeightNotFullWarning }
    : { label: performance.string.KRAWeightFull }}
>
  <Icon
    icon={performance.icon.KRA}
    size="medium"
    iconProps={{
      ...(shouldWarn(sums.get(category))
        ? { fill: 'var(--theme-warning-color)' }
        : {
            fill: 'var(--theme-won-color)'
          })
    }}
  />
  <KraWeightPresenter value={sums.get(category) ?? 0} showPercent />
</div>
