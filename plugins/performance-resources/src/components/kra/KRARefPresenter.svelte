<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import ObjectPresenter from '@hcengineering/view-resources/src/components/ObjectPresenter.svelte'
  import performance from '../../plugin'
  import { Label } from '@hcengineering/ui'
  import { ObjectPresenterType } from '@hcengineering/view'

  export let value: Ref<KRA> | null
  export let inline: boolean = false
  export let accent: boolean = false
  export let shouldShowAvatar: boolean = true
  export let noUnderline: boolean = false
  export let disabled: boolean = false
  export let shrink: number = 0
  export let kind: 'list-header' | 'list' | 'link-bordered' = 'list'
  export let type: ObjectPresenterType = 'link'
</script>

{#if value != null}
  <ObjectPresenter
    objectId={value}
    _class={performance.class.KRA}
    props={{
      kind,
      type
    }}
    {shouldShowAvatar}
    {disabled}
    {inline}
    {noUnderline}
    {shrink}
    {accent}
    on:accent-color
  />
{:else}
  <span class="placeholder">
    <Label label={performance.string.NoKRA} />
  </span>
{/if}

<style>
  .placeholder {
    color: var(--theme-text-placeholder-color);
    font-style: italic;
  }
</style>
