<script lang="ts">
  import presentation, { getClient, SpaceSelector } from '@hcengineering/presentation'
  import Chart from './Chart.svelte'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { concatLink, Doc, getCurrentAccount, Hierarchy, Ref, SortingOrder, Space } from '@hcengineering/core'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { getPanelURI, IconForward, Label, locationToUrl, navigate, parseLocation } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { getObjectLinkFragment } from '@hcengineering/view-resources'
  import { getMetadata } from '@hcengineering/platform'
  import kraTeam, { Member, Team } from '@hcengineering/kra-team'

  const client = getClient()
  const hierarchy = client.getHierarchy()

  const me = getCurrentAccount()

  let team: Ref<Team> | undefined
  let _space: Ref<ReviewSession> | undefined

  $: void client.findOne(
    kraTeam.class.Team,
    {
      members: me._id as Ref<Member>
    }
  ).then((result) => {
    if (result !== undefined) {
      team = result._id
    }
  })

  $: if (team !== undefined) {
    void client.findOne(
      performance.class.ReviewSession,
      {
        space: team as Ref<Space>,
        members: me._id
      },
      {
        sort: {
          modifiedOn: SortingOrder.Descending
        },
        limit: 1
      }
    ).then((res) => {
      _space = res?._id ?? undefined
    })
  }

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
    {#if team !== undefined}
      <div>
        <SpaceSelector
          _class={kraTeam.class.Team}
          label={performance.string.SelectTeam}
          bind:space={team}
          kind={'regular'}
          size={'medium'}
          query={
            { members: me._id }
          }
        />
      </div>
      <div>
        <IconForward size={'medium'} />
      </div>
      {#if _space !== undefined}
        <div>
          <SpaceSelector
            _class={performance.class.ReviewSession}
            label={performance.string.SelectReviewSession}
            bind:space={_space}
            kind={'regular'}
            size={'medium'}
            query={{
              space: team,
              members: me._id
            }}
          />
        </div>
      {:else}
        <div class="hulyNavItem-container pseudo-element flex-row-center content-dark-color text-md nowrap">
          <Label label={performance.string.NoReviewSessions} />
        </div>
      {/if}
    {:else}
      <div class="hulyNavItem-container pseudo-element flex-row-center content-dark-color text-md nowrap">
        <Label label={performance.string.NoTeam} />
      </div>
    {/if}
  </div>
  {#if _space !== undefined}
    <Chart
    on:segmentClick={handleSegmentClick}
      space={_space}
    />
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
