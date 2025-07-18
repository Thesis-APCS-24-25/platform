<script lang="ts">
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { NavLink } from '@hcengineering/view-resources'
  import {
    defineSeparators,
    location,
    Separator,
    Location,
    deviceOptionsStore as deviceInfo,
    NavItem,
    Label,
    Component,
    restoreLocation
  } from '@hcengineering/ui'
  import { SpacesNavModel, SpecialNavModel } from '@hcengineering/workbench'
  import { onDestroy } from 'svelte'
  import { decodeObjectURI } from '@hcengineering/view'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import Navigator from './Navigator.svelte'
  import performance from '../../plugin'
  import TeamSwitchHeader from '../navigator/TeamSwitchHeader.svelte'
  import { performanceId, ReviewSession } from '@hcengineering/performance'
  import { navigatorModel } from '../../navigation'
  import kraTeam from '@hcengineering/kra-team'
  import { createQuery } from '@hcengineering/presentation'

  let currentSpecial: SpecialNavModel | undefined

  let currentSpace: Ref<ReviewSession> | undefined = undefined

  let replacedPanel: HTMLElement

  let needRestoreLoc = true

  let specials: SpecialNavModel[] = $navigatorModel.specials ?? []
  let spaces: SpacesNavModel[] = $navigatorModel.spaces ?? []

  const unsub = navigatorModel.subscribe((n) => {
    specials = n?.specials ?? []
    spaces = n?.spaces ?? []
    syncLocation($location)
  })
  onDestroy(() => {
    unsub()
    unsubcribe()
  })

  const unsubcribe = location.subscribe((loc) => {
    syncLocation(loc)
  })

  function syncLocation (loc: Location): void {
    if (loc.path[2] !== performanceId) {
      return
    }

    if (needRestoreLoc) {
      needRestoreLoc = false
      restoreLocation(loc, performanceId)
      return
    }

    needRestoreLoc = false

    const special = specials?.find((s) => s.id === loc.path[3])
    if (special !== undefined) {
      currentSpecial = special
      currentSpace = undefined
      return
    }

    const [id] = decodeObjectURI(loc.path[3])
    currentSpace = id as Ref<ReviewSession>

    let spaceSpecial = undefined
    for (const space of spaces) {
      for (const special of space.specials ?? []) {
        if (special.id === loc.path[4]) {
          spaceSpecial = special
          break
        }
      }
    }

    if (spaceSpecial !== undefined) {
      currentSpecial = spaceSpecial
      return
    }

    currentSpecial = undefined
  }

  defineSeparators('performance', [
    { minSize: 15, maxSize: 40, size: 15, float: 'navigator' },
    { size: 'auto', minSize: 20, maxSize: 'auto' },
    { size: 20, minSize: 20, maxSize: 50, float: 'aside' }
  ])

  $: $deviceInfo.replacedPanel = replacedPanel
  onDestroy(() => ($deviceInfo.replacedPanel = undefined))

  $: disabled = false

  const teamQ = createQuery()
  let haveTeam = false
  $: teamQ.query(
    kraTeam.class.Team,
    {
      members: getCurrentAccount()._id
    },
    (res) => {
      if (res.length > 0) {
        haveTeam = true
      } else {
        haveTeam = false
      }
    }
  )
</script>

<div class="hulyPanels-container">
  {#if !haveTeam}
    <div class="hulyComponent flex justify-stretch items-center placeholder">
      <div class="upper-gap" />
      <span class="title">
        <Label label={performance.string.NotInAnyTeam} />
      </span>
      <div class="lower-gap" />
    </div>
  {:else}
    {#if $deviceInfo.navigator.visible}
      <div class="min-h-3 flex-no-shrink" />
      <div
        class="antiPanel-navigator {$deviceInfo.navigator.direction === 'horizontal'
          ? 'portrait'
          : 'landscape'} border-left"
        class:fly={$deviceInfo.navigator.float}
      >
        <div class="antiPanel-wrap__content hulyNavPanel-container">
          <div class="hulyNavPanel-header" class:withButton={false}>
            <span class="overflow-label">
              <Label label={performance.string.PerformanceApplication} />
            </span>
          </div>

          <TeamSwitchHeader />

          {#if specials}
            {#each specials as special, row}
              {#if row > 0 && specials[row].position !== specials[row - 1].position}
                <TreeSeparator line />
              {/if}
              <NavLink space={special.id} {disabled}>
                <NavItem
                  label={special.label}
                  icon={special.icon}
                  selected={currentSpecial !== undefined && currentSpecial.id === special.id}
                  {disabled}
                />
              </NavLink>
            {/each}
          {/if}

          <div class="antiVSpacer" />
          <Navigator {currentSpace} currentSpecial={currentSpecial?.id} />
        </div>
      </div>
      <Separator
        name="performance"
        float={$deviceInfo.navigator.float}
        index={0}
        color={'transparent'}
        separatorSize={0}
        short
      />
    {/if}
    <div bind:this={replacedPanel} class="hulyComponent">
      {#if currentSpace !== undefined && currentSpecial !== undefined}
        <Component is={currentSpecial.component} props={{ ...currentSpecial.componentProps, currentSpace }} />
      {:else if currentSpecial !== undefined}
        <Component is={currentSpecial.component} props={currentSpecial.componentProps} />
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .placeholder {
    .title {
      height: 100%;
      width: 60%;
      font-size: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: stretch;
      font-weight: bold;
      color: var(--theme-trans-color);
      text-align: center;
      flex-grow: 1;
    }
    .upper-gap {
      height: 100%;
      flex-grow: 4;
    }
    .lower-gap {
      height: 100%;
      flex-grow: 6;
    }
  }
</style>
