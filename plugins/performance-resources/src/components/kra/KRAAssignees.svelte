<script lang="ts">
  import performance from '../../plugin'
  import { Button, Chevron, closeTooltip, eventToHTMLElement, ExpandCollapse, showPopup } from '@hcengineering/ui'
  import { restrictionStore } from '@hcengineering/view-resources'
  import KraAssigneeTable from './KRAAssigneeTable.svelte'
  import KraAssigneesPopup from './KRAAssigneesPopup.svelte'
  import { createQuery } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'

  export let hasAssignees = true
  export let kra: Ref<KRA>

  let isCollapsed = true

  let items: EmployeeKRA[] = []

  const itemQ = createQuery()
  itemQ.query(
    performance.class.EmployeeKRA,
    {
      kra
    },
    (res) => {
      if (res !== undefined) {
        items = res
      }
    }
  )

  function openNewAssigneeDialog (event: MouseEvent): void {
    showPopup(
      KraAssigneesPopup,
      {
        items
      },
      eventToHTMLElement(event)
    )
  }
</script>

<div class="flex-between mb-1">
  {#if hasAssignees}
    {#if $$slots.header}
      <slot name="header" />
    {:else}
      <Button
        label={performance.string.Assignees}
        width="min-content"
        kind="ghost"
        on:click={() => {
          isCollapsed = !isCollapsed
        }}
      >
        <svelte:fragment slot="content">
          <Chevron
            size={'small'}
            expanded={!isCollapsed}
            outline
            fill={'var(--caption-color)'}
            marginRight={'.375rem'}
          />
          <slot name="chevron" />
        </svelte:fragment>
      </Button>
    {/if}
  {/if}
  <div class="flex-row-center gap-2 no-print">
    {#if !$restrictionStore.readonly}
      <Button
        id="add-sub-issue"
        icon={performance.icon.AssignKRA}
        label={hasAssignees ? undefined : performance.string.AssignTo}
        labelParams={{ subIssues: 0 }}
        kind={'ghost'}
        showTooltip={{ label: performance.string.AssignTo, direction: 'bottom' }}
        on:click={(e) => {
          isCollapsed = false
          closeTooltip()
          openNewAssigneeDialog(e)
        }}
      />
    {/if}
  </div>
</div>
{#if hasAssignees}
  {#if !isCollapsed}
    <ExpandCollapse isExpanded={!isCollapsed}>
      <div class:collapsed={isCollapsed}>
        <KraAssigneeTable
          query={{
            kra
          }}
        />
      </div>
    </ExpandCollapse>
  {/if}
{/if}
