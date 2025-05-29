<script lang="ts">
  import { checkPermission, Ref } from '@hcengineering/core'
  import { NavLink, SpacePresenter } from '@hcengineering/view-resources'
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
  import team, { Team } from '@hcengineering/kra-team'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import performance from '../plugin'
  import TeamSwitchHeader from './TeamSwitchHeader.svelte'
  import { ReviewSession } from '@hcengineering/performance'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import ReviewSessionSpacePresenter from './review-session/ReviewSessionSpacePresenter.svelte'
  let currentSpecial: SpecialNavModel | undefined

  let currentTeam: Ref<Team> | undefined = undefined
  let currentReviewSession: Ref<ReviewSession> | undefined = undefined
  let reviewSessions: ReviewSession[] = []
  const reviewSessionQ = createQuery()
  $: reviewSessionQ.query(performance.class.ReviewSession, {
    space: currentTeam
  }, (res) => {
    reviewSessions = res
  })
  let replacedPanel: HTMLElement

  let specials: SpecialNavModel[] | undefined = undefined

  let canManageKra: boolean = false
  $: if (currentTeam !== undefined) {
    void checkPermission(getClient(), team.permission.ApproveKra, currentTeam).then((ok) => {
      canManageKra = ok
    })
  }
  function updateSpecial (
    currentTeam: Ref<Team> | undefined,
    currentReviewSession: Ref<ReviewSession> | undefined
  ): void {
    const specialIdx = specials?.findIndex((s) => s.id === currentSpecial?.id)
    specials = [
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
        componentProps: {
          space: currentTeam,
          _class: performance.class.ReviewSession
        },
        position: 'bottom'
      },
      ...(canManageKra
        ? [
            {
              id: 'all-kras',
              component: workbench.component.SpecialView,
              label: performance.string.KRA,
              spaceClass: performance.class.KRA,
              componentProps: {
                space: currentReviewSession,
                _class: performance.class.KRA
              },
              position: 'bottom'
            }
          ]
        : []),
      {
        id: 'my-kras',
        component: performance.component.MyKRAs,
        label: performance.string.MyKRAs,
        spaceClass: performance.class.KRA,
        componentProps: {
          space: currentReviewSession
        },
        position: 'bottom'
      },
      {
        id: 'report',
        component: performance.component.PerformanceReports,
        componentProps: {
          createComponent: performance.component.CreateReport,
          createButton: performance.component.CreateReportButton,
          space: currentReviewSession
        },
        label: performance.string.PerformanceReports,
        spaceClass: performance.class.PerformanceReport,
        position: 'bottom'
      }
    ]
    if (specialIdx !== undefined) {
      currentSpecial = specials[specialIdx]
    }
  }

  $: updateSpecial(currentTeam, currentReviewSession)

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

    const special = specials?.find((s) => s.id === loc.path[3])
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
        <TeamSwitchHeader bind:currentTeam bind:currentReviewSession />
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

        {#each reviewSessions as rv}
          <ReviewSessionSpacePresenter space={rv} currentSpace={currentReviewSession}/>
        {/each}
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
          ...currentSpecial.componentProps
        }}
      />
    {/if}
  </div>
</div>
