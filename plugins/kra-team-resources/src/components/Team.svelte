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
    Component
  } from '@hcengineering/ui'
  import workbench, { SpecialNavModel } from '@hcengineering/workbench'
  import { onDestroy } from 'svelte'
  import { decodeObjectURI } from '@hcengineering/view'
  import TeamNavigator from './TeamNavigator.svelte'
  import { Team } from '@hcengineering/kra-team'
  import kraTeam from '../plugins'
  import Members from './Members.svelte'
  import { TreeSeparator } from '@hcengineering/workbench-resources'
  import { createQuery } from '@hcengineering/presentation'
  import { myTeams } from '../utils'
  import { currentTeam } from '../stores'
  import contact from '@hcengineering/contact'

  let currentSpecial: SpecialNavModel | undefined

  let currentSpace: Ref<Team> | undefined = undefined

  let replacedPanel: HTMLElement

  const myTeamQ = createQuery()

  $: myTeamQ.query(kraTeam.class.Team, {}, (res) => {
    myTeams.set(res)
  })

  const specials: SpecialNavModel[] = [
    {
      id: 'members',
      icon: contact.icon.Person,
      label: contact.string.Employees,
      component: kraTeam.component.AllMembers
    }
  ]

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

    const special = specials.find((s) => s.id === loc.path[3])
    if (special !== undefined) {
      currentSpecial = special
      currentSpace = undefined
      $currentTeam = undefined
      return
    }

    const [id] = decodeObjectURI(loc.path[3])
    currentSpace = id as Ref<Team>
    $currentTeam = id as Ref<Team>
    currentSpecial = undefined
  }

  defineSeparators('kra-team', [
    { minSize: 15, maxSize: 20, size: 20, float: 'navigator' },
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
            <Label label={kraTeam.string.TeamMembers} />
          </span>
        </div>
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

        <TeamNavigator
          currentTeam={currentSpace}
          on:selected={(space) => {
            currentSpace = space.detail
          }}
        />
      </div>
    </div>
    <Separator
      name="kra-team"
      float={$deviceInfo.navigator.float}
      index={0}
      color={'transparent'}
      separatorSize={0}
      short
    />
  {/if}
  <div bind:this={replacedPanel} class="hulyComponent">
    {#if currentSpace !== undefined}
      <Members {currentSpace} />
    {:else if currentSpecial !== undefined}
      <Component is={currentSpecial.component} props={currentSpecial.componentProps} />
    {/if}
  </div>
</div>
