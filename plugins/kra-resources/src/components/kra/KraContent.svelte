<script lang="ts">
  import { DocumentQuery, Ref, Space, WithLookup } from '@hcengineering/core'
  import { Component as ViewComponent } from '@hcengineering/ui'
  import kra from '../../plugin'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import { Kra } from '@hcengineering/kra'

  export let viewlet: WithLookup<Viewlet>
  export let viewOptions: ViewOptions
  export let query: DocumentQuery<Kra> = {}
  export let space: Ref<Space> | undefined
</script>

{#if viewlet?.$lookup?.descriptor?.component}
<ViewComponent
  is={viewlet.$lookup.descriptor.component}
  props={{
    _class: kra.class.Kra,
    config: viewlet.config,
    options: viewlet.options,
    viewOptions,
    viewOptionsConfig: viewlet.viewOptions?.other,
    viewlet,
    space,
    query
  }}
/>
{/if}
