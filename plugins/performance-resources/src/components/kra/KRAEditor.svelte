<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { ObjectBox } from '@hcengineering/view-resources'
  import performance from '../../plugin'

  export let value: Ref<KRA>
  export let onChange: ((ref: Ref<KRA>) => void | Promise<void>) | undefined
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let width: string | undefined = undefined

  async function handleChange (ev: CustomEvent<Ref<KRA>>): Promise<void> {
    if (onChange !== undefined) {
      await onChange(ev.detail)
    }
  }
</script>

<ObjectBox
  _class={performance.class.KRA}
  searchField={'title'}
  label={performance.string.NoKRA}
  {value}
  {readonly}
  {kind}
  {size}
  {width}
  allowDeselect
  on:change={handleChange}
/>
