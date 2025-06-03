<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { NavLink } from '@hcengineering/view-resources'
  import {
    defineSeparators,
    location,
    Separator,
    Location,
    deviceOptionsStore as deviceInfo,
    NavItem,
    Label,
    Component
  } from '@hcengineering/ui'
  import { SpecialNavModel } from '@hcengineering/workbench'
  import { onDestroy } from 'svelte'
  import { decodeObjectURI } from '@hcengineering/view'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import Navigator from './Navigator.svelte'
  import performance from '../../plugin'
  import TeamSwitchHeader from '../navigator/TeamSwitchHeader.svelte'
  import { ReviewSession } from '@hcengineering/performance'
  import { navigatorModel } from '../../navigation'

  let currentSpecial: SpecialNavModel | undefined

  let currentSpace: Ref<ReviewSession> | undefined = undefined

  let replacedPanel: HTMLElement

  const specials = navigatorModel.specials
  const spaces = navigatorModel.spaces

  const unsubcribe = location.subscribe((loc) => {
    syncLocation(loc)
  })
  onDestroy(() => {
    unsubcribe()
  })

  function syncLocation(loc: Location): void {
    if (loc.path[2] !== 'performance') {
      return
    }

    const special = specials.find((s) => s.id === loc.path[3])
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

  $: console.log(currentSpace, currentSpecial)

  defineSeparators('performance', [
    { minSize: 15, maxSize: 40, size: 15, float: 'navigator' },
    { size: 'auto', minSize: 20, maxSize: 'auto' },
    { size: 20, minSize: 20, maxSize: 50, float: 'aside' }
  ])

  $: $deviceInfo.replacedPanel = replacedPanel
  onDestroy(() => ($deviceInfo.replacedPanel = undefined))

  $: disabled = false
</script>

<div class="hulyPanels-container">
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
        <Navigator {currentSpace} currentSpecial={currentSpecial?.id} models={spaces} />
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
    {:else if currentSpace !== undefined}
    {/if}
  </div>
</div>
