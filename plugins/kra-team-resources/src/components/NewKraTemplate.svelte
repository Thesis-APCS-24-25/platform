<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import kraTeam from '../plugins'
  import { Team } from '@hcengineering/kra-team'
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import { Button, ButtonIcon, EditBox, ExpandCollapse } from '@hcengineering/ui'
  import Collapsed from './icons/Collapsed.svelte'
  import Expanded from './icons/Expanded.svelte'
  export let space: Ref<Team> | undefined

  let name = ''
  let description = ''
  const metrics = []
  let isCollapsed = true
</script>

<Card
  label={kraTeam.string.NewKraTemplate}
  okAction={() => {
    throw new Error('Not implemented')
  }}
>
  <div id="template-name" class="m-3 clear-mins">
    <EditBox
      focusIndex={1}
      bind:value={name}
      placeholder={kraTeam.string.KraNamePlaceholder}
      kind={'large-style'}
      autoFocus
      fullSize
    />
  </div>
  <div id="template-description" class="m-3 clear-mins">
    <EditBox
      focusIndex={2}
      bind:value={description}
      placeholder={kraTeam.string.KraDescriptionPlaceholder}
      kind={'large-style'}
      autoFocus
      fullSize
    />
  </div>

  {#if metrics.length > 0}
    <div class="flex-between clear-mins">
      <Button
        width="min-content"
        icon={isCollapsed ? Collapsed : Expanded}
        size="small"
        kind="ghost"
        label={kraTeam.string.MetricsList}
        labelParams={{ metrics: metrics.length }}
        on:click={() => (isCollapsed = !isCollapsed)}
      />
    </div>

    <ButtonIcon
      kind="secondary"
      icon={kraTeam.icon.Add}
      on:click={() => {
        throw new Error('Not implemented')
      }}
    ></ButtonIcon>
  {/if}
  <ExpandCollapse isExpanded={!isCollapsed}></ExpandCollapse>
</Card>
