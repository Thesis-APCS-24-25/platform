<script lang="ts">
  import { Class, Doc, Ref, Space } from '@hcengineering/core'
  import { getClient, hasResource } from '@hcengineering/presentation'
  import performance, { ProgressPresenter } from '@hcengineering/performance'
  import { Component } from '@hcengineering/ui'
  import { Task } from '@hcengineering/task'

  export let value: Doc<Space> | undefined = undefined
  export let _class: Ref<Class<Doc>> | undefined = value?._class
  export let props: Record<string, any> = {}
  export let inline: boolean = false
  export let accent: boolean = false
  export let colorInherit: boolean = false
  export let shouldShowAvatar: boolean = true
  export let noUnderline: boolean = false
  export let disabled: boolean = false
  export let shouldShowName: boolean = true
  export let shrink: boolean = false

  const client = getClient()
  const hierarchy = client.getHierarchy()
  $: presenterMixin =
    _class !== undefined
      ? hierarchy.classHierarchyMixin<Class<Task>, ProgressPresenter>(_class, performance.mixin.ProgressPresenter)
      : undefined
</script>

{#if presenterMixin}
  <Component
    is={presenterMixin.presenter}
    props={{
      _class,
      value,
      inline,
      accent,
      colorInherit,
      shouldShowAvatar,
      noUnderline,
      disabled,
      readonly: disabled,
      editable: !disabled,
      shouldShowName,
      shrink,
      ...props
    }}
  />
{/if}
