<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import ObjectPresenter from '@hcengineering/view-resources/src/components/ObjectPresenter.svelte'
  import performance from '../../plugin'
  import { Label } from '@hcengineering/ui'

  export let value: Ref<KRA>
  export let inline: boolean = false
  export let accent: boolean = false
  export let shouldShowAvatar: boolean = true
  export let noUnderline: boolean = false
  export let disabled: boolean = false
  export let shouldShowName: boolean = true
  export let shrink: number = 0
</script>

{#if value !== undefined && value !== performance.ids.NoKRARef}
  <ObjectPresenter
    objectId={value}
    _class={performance.class.KRA}
    {shouldShowAvatar}
    {shouldShowName}
    {disabled}
    {inline}
    {noUnderline}
    {shrink}
    {accent}
    on:accent-color
  />
{:else}
  <span>
    <Label label={performance.string.NoKRA} />
  </span>
{/if}
