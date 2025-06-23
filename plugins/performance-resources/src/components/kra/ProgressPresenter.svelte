<script lang="ts">
  import { Class, Doc, Ref, WithLookup } from '@hcengineering/core'
  import { PTask } from '@hcengineering/performance'
  import ProgressPresenter from '../progress/ProgressPresenter.svelte'

  export let value: WithLookup<PTask> | undefined = undefined
  export let props: Record<string, any> = {}
  export let inline: boolean = false
  export let accent: boolean = false
  export let colorInherit: boolean = false
  export let shouldShowAvatar: boolean = true
  export let noUnderline: boolean = false
  export let disabled: boolean = false
  export let shouldShowName: boolean = true
  export let shrink: boolean = false
</script>

{#if value}
  <ProgressPresenter
    {value}
    {props}
    {inline}
    {accent}
    {colorInherit}
    {shouldShowAvatar}
    {noUnderline}
    {disabled}
    {shouldShowName}
    {shrink}
  />
{/if}
