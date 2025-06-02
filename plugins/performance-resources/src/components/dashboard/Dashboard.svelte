<script lang="ts">
  import presentation, { getClient } from '@hcengineering/presentation'
  import Chart from './Chart.svelte'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { concatLink, Doc, Hierarchy, Ref } from '@hcengineering/core'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { getPanelURI, locationToUrl, navigate, parseLocation } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { getObjectLinkFragment } from '@hcengineering/view-resources'
  import { getMetadata } from '@hcengineering/platform'

  const client = getClient()
  const hierarchy = client.getHierarchy()

  export let currentSpace: Ref<ReviewSession> | undefined

  async function getHref (object: Doc): Promise<string> {
    const panelComponent = hierarchy.classHierarchyMixin(object._class, view.mixin.ObjectPanel)
    const comp = panelComponent?.component ?? performance.component.EditKRA
    const loc = await getObjectLinkFragment(hierarchy, object, undefined, comp)
    const frontUrl = getMetadata(presentation.metadata.FrontUrl) ?? window.location.origin
    return concatLink(frontUrl, locationToUrl(loc))
  }

  async function handleSegmentClick (event: { detail: { employee: PersonAccount, kra: KRA } }): Promise<void> {
    const { kra } = event.detail
    let href: string | undefined =
    kra !== undefined
      ? '#' + getPanelURI(performance.component.EditKRA, kra._id, Hierarchy.mixinOrClass(kra), 'content')
      : undefined
    href = await getHref(kra)
    try {
      const url = new URL(href)
      const frontUrl = getMetadata(presentation.metadata.FrontUrl) ?? window.location.origin
      if (url.origin === frontUrl) {
        const loc = parseLocation(url)

        navigate(loc)
      }
    } catch {}
  }
</script>

<div class='dashboard'>
  {#if currentSpace !== undefined}
    <div class='dashboard-content'>
      <Chart
        on:segmentClick={handleSegmentClick}
          space={currentSpace}
      />
    </div>
  {/if}
</div>

<style>
  .dashboard {
    width: 100%;
    height: 100%;
  }

  .dashboard-content {
    width: 100%;
    height: calc(90% - 20px);
  }
</style>
