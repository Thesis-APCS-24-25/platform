<script lang="ts">
  import { Doc, Ref, Class, SortingOrder } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import { SpaceView } from '@hcengineering/workbench-resources'
  import contact from '@hcengineering/contact'
  import {
    Component,
    defineSeparators,
    getCurrentLocation,
    location,
    navigate,
    Separator,
    Location,
    restoreLocation,
    deviceOptionsStore as deviceInfo
  } from '@hcengineering/ui'
  import { NavigatorModel, SpecialNavModel } from '@hcengineering/workbench'
  import { InboxNotificationsClientImpl } from '@hcengineering/notification-resources'
  import { onMount, onDestroy } from 'svelte'
  import { chunterId } from '@hcengineering/chunter'
  import view, { decodeObjectURI, Viewlet } from '@hcengineering/view'
  import { parseLinkId, getObjectLinkId } from '@hcengineering/view-resources'
  import { ActivityMessage } from '@hcengineering/activity'
  import TeamNavigator from './TeamNavigator.svelte'
  import { kraTeamId, Team } from '@hcengineering/kra-team'
  import kraTeam from '../plugins'
  import ViewletContentView from '@hcengineering/view-resources/src/components/ViewletContentView.svelte'
  import Members from './Members.svelte'

  const notificationsClient = InboxNotificationsClientImpl.getClient()
  const contextByDocStore = notificationsClient.contextByDoc
  const objectQuery = createQuery()
  const client = getClient()

  const navigatorModel: NavigatorModel = {
    spaces: [],
    specials: []
  }

  const linkProviders = client.getModel().findAllSync(view.mixin.LinkIdProvider, {})

  let currentSpecial: SpecialNavModel | undefined

  let currentSpace: Ref<Team> | undefined = undefined

  let replacedPanel: HTMLElement

  const unsubcribe = location.subscribe((loc) => {
    syncLocation(loc)
  })
  onDestroy(() => {
    unsubcribe()
  })

  function syncLocation (loc: Location): void {
    if (loc.path[2] !== 'kra-team') {
      return
    }

    const [id] = decodeObjectURI(loc.path[3])
    currentSpace = id as Ref<Team>
  }

  defineSeparators('kra-team', [
    { minSize: 15, maxSize: 40, size: 20, float: 'navigator' },
    { size: 'auto', minSize: 20, maxSize: 'auto' },
    { size: 20, minSize: 20, maxSize: 50, float: 'aside' }
  ])

  $: $deviceInfo.replacedPanel = replacedPanel
  onDestroy(() => ($deviceInfo.replacedPanel = undefined))
</script>

<div class="hulyPanels-container">
  {#if $deviceInfo.navigator.visible}
    <div
      class="antiPanel-navigator {$deviceInfo.navigator.direction === 'horizontal'
        ? 'portrait'
        : 'landscape'} border-left"
      class:fly={$deviceInfo.navigator.float}
    >
      <div class="antiPanel-wrap__content hulyNavPanel-container">
        <TeamNavigator
          on:selected={(space) => {
            currentSpace = space.detail
          }}
        />
      </div>
      {#if !($deviceInfo.isMobile && $deviceInfo.isPortrait && $deviceInfo.minWidth)}
        <Separator name="chat" float={$deviceInfo.navigator.float ? 'navigator' : true} index={0} />
      {/if}
    </div>
    <Separator
      name="chat"
      float={$deviceInfo.navigator.float}
      index={0}
      color={'transparent'}
      separatorSize={0}
      short
    />
  {/if}
  <div bind:this={replacedPanel} class="hulyComponent">
    <Members {currentSpace} />
  </div>
</div>
