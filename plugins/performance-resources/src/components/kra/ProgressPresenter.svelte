<script lang="ts">
  import { Class, Doc, Ref, Space } from '@hcengineering/core'
  import { getClient, hasResource } from '@hcengineering/presentation'
  import performance, { ProgressPresenter } from '@hcengineering/performance'
  import { Component } from '@hcengineering/ui'
  import { Task } from '@hcengineering/task'

  export let _class: Ref<Class<Doc>>
  export let value: Doc<Space> | undefined = undefined
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
  $: presenterMixin = hierarchy.classHierarchyMixin<Class<Task>, ProgressPresenter>(
    _class,
    performance.mixin.ProgressPresenter
  )
  console.log('???', _class, presenterMixin?.presenter)
</script>

{#if presenterMixin}
  <Component
    is={presenterMixin.presenter}
    props={{
      ...props,
      _class,
      value,
      inline,
      accent,
      colorInherit,
      shouldShowAvatar,
      noUnderline,
      disabled,
      shouldShowName,
      shrink
    }}
  />
{/if}
