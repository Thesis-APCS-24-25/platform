<script lang="ts">
  import core, { DocumentQuery, Ref, Space, WithLookup } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import { IssueTemplate } from '@hcengineering/kra'
  import { Component } from '@hcengineering/ui'
  import view, { ViewOptions, Viewlet, ViewletPreference } from '@hcengineering/view'
  import tracker from '../../plugin'
  import CreateIssueTemplate from './CreateIssueTemplate.svelte'

  export let viewlet: WithLookup<Viewlet>
  export let viewOptions: ViewOptions
  export let query: DocumentQuery<IssueTemplate> = {}
  export let space: Ref<Space> | undefined

  const preferenceQuery = createQuery()
  let preference: ViewletPreference | undefined

  $: viewlet &&
    preferenceQuery.query(
      view.class.ViewletPreference,
      {
        space: core.space.Workspace,
        attachedTo: viewlet._id
      },
      (res) => {
        preference = res[0]
      },
      { limit: 1 }
    )

  const createItemDialog = CreateIssueTemplate
  const createItemLabel = tracker.string.IssueTemplate
</script>

{#if viewlet?.$lookup?.descriptor?.component}
  <Component
    is={viewlet.$lookup.descriptor.component}
    props={{
      _class: tracker.class.IssueTemplate,
      config: preference?.config ?? viewlet.config,
      options: viewlet.options,
      createItemDialog,
      createItemLabel,
      viewOptions,
      viewOptionsConfig: viewlet.viewOptions?.other,
      viewlet,
      space,
      query
    }}
  />
{/if}
