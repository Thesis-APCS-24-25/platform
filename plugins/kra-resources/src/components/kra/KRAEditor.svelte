<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { Issue } from '@hcengineering/kra'
  import performance, { KRA } from '@hcengineering/performance'
  import { getClient } from '@hcengineering/presentation'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { FixedColumn, ObjectBox } from '@hcengineering/view-resources'

  export let value: WithLookup<Issue>
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let width: string | undefined = undefined

  const client = getClient()

  async function handleChange (ev: CustomEvent<Ref<KRA>>): Promise<void> {
    await client.update(value, { kra: ev.detail })
  }
</script>

{#if kind === 'list'}
  <FixedColumn key="kra-editor-total">
    <ObjectBox
      _class={performance.class.KRA}
      searchField={'title'}
      label={performance.string.NoKRA}
      value={value.kra}
      {readonly}
      {kind}
      {size}
      {width}
      allowDeselect
      showNavigate={false}
      on:change={handleChange}
      />
  </FixedColumn>
{:else}
  <ObjectBox
    _class={performance.class.KRA}
    searchField={'title'}
    label={performance.string.NoKRA}
    value={value.kra}
    {readonly}
    {kind}
    {size}
    {width}
    allowDeselect
    on:change={handleChange}
  />
{/if}
