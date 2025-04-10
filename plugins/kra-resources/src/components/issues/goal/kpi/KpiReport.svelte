<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Unit } from '@hcengineering/kra'
  import { createQuery } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import Report from '../../../../../setting-resources/src/components/icons/Report.svelte'

  export let value: WithLookup<Report>

  const attachedTo = value.$lookup?.attachedTo

  let unit: Unit | undefined = undefined
  const unitQuery = createQuery()
  unitQuery.query(kra.class.Unit, { _id: attachedTo?.unit }, (res) => {
    if (res.length > 0) {
      unit = res[0]
    }
  })
</script>

{#if unit?.prefix === true}
  <span class="unit">
    {unit.symbol}
  </span>
{/if}
{value.value}
{#if unit?.prefix === false}
  <span class="unit">
    {unit.symbol}
  </span>
{/if}

<style lang="scss">
  .unit {
    font-weight: bold;
  }
</style>
