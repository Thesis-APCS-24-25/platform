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
  import workbench, { SpecialNavModel } from '@hcengineering/workbench'
  import { onDestroy } from 'svelte'
  import { Team } from '@hcengineering/kra-team'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import performance from '../plugin'
  import TeamSwitchHeader from './TeamSwitchHeader.svelte'
  let currentSpecial: SpecialNavModel | undefined

  let currentSpace: Ref<Team> | undefined = undefined
  let replacedPanel: HTMLElement

  const specials: SpecialNavModel[] = [
    {
      id: 'dashboard',
      component: performance.component.PerformanceDashboard,
      label: performance.string.PerformanceDashboard,
      position: 'top'
    },
    {
      id: 'review-sessions',
      component: workbench.component.SpecialView,
      label: performance.string.AllReviewSessions,
      spaceClass: performance.class.ReviewSession,
      position: 'bottom'
    },
    {
      id: 'my-kras',
      component: performance.component.MyKRAs,
      label: performance.string.MyKRAs,
      spaceClass: performance.class.KRA,
      position: 'bottom'
    },
    {
      id: 'report',
      component: performance.component.PerformanceReports,
      componentProps: {
        createComponent: performance.component.CreateReport,
        createButton: performance.component.CreateReportButton
      },
      label: performance.string.PerformanceReports,
      spaceClass: performance.class.PerformanceReport,
      position: 'bottom'
    }
  ]

  const unsubcribe = location.subscribe((loc) => {
    syncLocation(loc)
  })
  onDestroy(() => {
    unsubcribe()
  })

  function syncLocation (loc: Location): void {
    if (loc.path[2] !== 'performance') {
      return
    }

    const special = specials.find((s) => s.id === loc.path[3])
    currentSpecial = special
  }

  defineSeparators('performance', [
    { minSize: 15, maxSize: 40, size: 20, float: 'navigator' },
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
        <TeamSwitchHeader bind:currentSpace />
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
      </div>
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
    {#if currentSpecial !== undefined}
      <Component
        is={currentSpecial.component}
        props={{
          ...currentSpecial.componentProps,
          baseQuery: {
            space: currentSpace
          },
          space: currentSpace,
          _class: currentSpecial.spaceClass,
          navigationModel: currentSpecial.navigationModel
        }}
      />
    {/if}
  </div>
</div>
