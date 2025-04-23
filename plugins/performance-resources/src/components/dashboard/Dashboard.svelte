<script lang="ts">
  import presentation, { getClient, SpaceSelector } from '@hcengineering/presentation'
  import Chart from './Chart.svelte'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { concatLink, Doc, getCurrentAccount, Hierarchy, Ref, SortingOrder } from '@hcengineering/core'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { getPanelURI, IconForward, locationToUrl, navigate, parseLocation } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { getObjectLinkFragment } from '@hcengineering/view-resources'
  import { getMetadata } from '@hcengineering/platform'
  import kraTeam, { Team } from '@hcengineering/kra-team'

  const client = getClient()
  const hierarchy = client.getHierarchy()

  const me = getCurrentAccount()

  let team: Ref<Team>
  let _space: Ref<ReviewSession>

  $: void client.findOne(
    kraTeam.class.Team,
    {
      members: me._id
    }
  ).then((result) => {
    if (result !== undefined) {
      team = result
    }
  })

  $: void client.findOne(
    performance.class.ReviewSession,
    {},
    {
      sort: {
        modifiedOn: SortingOrder.Descending
      }
    }
  ).then((res) => {
    if (res !== undefined) {
      _space = res._id
    }
  })

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

<div>
  <div class='dashboard-header flex-row-baseline'>
    <div>
      <SpaceSelector
        _class={kraTeam.class.Team}
        label={performance.string.SelectTeam}
        bind:space={team}
        kind={'regular'}
        size={'medium'}
      />
    </div>
    <div>
      <IconForward size={'medium'} />
    </div>
    <div>
      <SpaceSelector
        _class={performance.class.ReviewSession}
        label={performance.string.ReviewSessionName}
        bind:space={_space}
        kind={'regular'}
        size={'medium'}
      />
    </div>
  </div>
  {#if _space}
    <Chart
    on:segmentClick={handleSegmentClick}
      space={_space}
    />
  {:else}
    <span>None</span>
  {/if}
</div>

<style>
  .dashboard-header {
    padding: 1rem;
    align-items: center;
  }

  .dashboard-header > div {
    margin-right: 0.5rem;
  }
</style>
