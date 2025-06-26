<script lang="ts">
  import { Issue } from '@hcengineering/kra'
  import { ButtonIcon, Icon, IconDelete, IconEdit, Label, showPopup } from '@hcengineering/ui'
  import kra from '../../../plugin'
  import performance, { Kpi, Progress } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'
  import KpiEditor from './kpi/KpiEditor.svelte'
  import ProgressEditor from './ProgressEditor.svelte'
  import RemoveProgressPopup from '@hcengineering/performance-resources/src/components/progress/RemoveProgressPopup.svelte'
  import { ProgressReportEditPopup } from '@hcengineering/performance-resources'
  import AddProgressPopup from '@hcengineering/performance-resources/src/components/progress/AddProgressPopup.svelte'
  import EditProgressEmptyContent from './EditProgressEmptyContent.svelte'
  import EditKpiPopup from '@hcengineering/performance-resources/src/components/progress/kpi/EditKpiPopup.svelte'

  export let issue: Issue

  export let progress: Progress | undefined = undefined
  console.log('EditProgress', issue, progress)
  const progressQuery = createQuery()
  $: if (issue.progress != null) {
    progressQuery.query(performance.class.Progress, { _id: issue.progress }, (res) => {
      if (res.length > 0) {
        progress = res[0]
      } else {
        progress = undefined
      }
    })
  }
  const asKpi = (progress: Progress): Kpi => progress as Kpi
  const isCollapsed = false
</script>

<div class="goal-section">
  <div class="header" class:collapsed={isCollapsed}>
    <div class="flex-row-center flex-gap-2">
      <Icon icon={performance.icon.Progress} size="medium" />
      <span class="font-bold-14 progress-title">
        <Label label={performance.string.Progress} />
      </span>
    </div>
    {#if progress}
      <div>
        <ButtonIcon
          icon={kra.icon.WriteReport}
          kind="tertiary"
          size="small"
          inheritColor
          tooltip={{
            label: kra.string.Report
          }}
          on:click={() => {
            showPopup(ProgressReportEditPopup, {
              space: issue.space,
              attachedTo: issue.progress,
              assignee: issue.assignee
            })
          }}
        />
        <ButtonIcon
          icon={IconEdit}
          kind="tertiary"
          size="small"
          inheritColor
          tooltip={{
            label: kra.string.Edit
          }}
          on:click={() => {
            if (progress?._class === performance.class.Kpi) {
              showPopup(EditKpiPopup, {
                kpi: asKpi(progress),
                issue: issue._id,
                space: issue.space,
                canChangeTask: false
              })
              return
            }
            showPopup(AddProgressPopup, {
              progress,
              canChangeTask: false
            })
          }}
        />
        <ButtonIcon
          icon={IconDelete}
          kind="tertiary"
          size="small"
          inheritColor
          tooltip={{
            label: kra.string.RemoveProgress
          }}
          on:click={() => {
            showPopup(RemoveProgressPopup, {
              object: issue
            }, 'top')
          }}
        />
      </div>
    {/if}
  </div>

  <div class="content">
    {#if progress}
      {#if progress._class === performance.class.Kpi}
        {@const kpi = asKpi(progress)}
        <KpiEditor {kpi} />
      {:else}
        <ProgressEditor {progress} />
      {/if}
    {:else}
      <EditProgressEmptyContent {issue} />
    {/if}
  </div>
</div>

<style lang="scss">
  .progress-title {
    color: white;
  }

  .goal-section {
    margin-bottom: 1rem;
    border: 1px solid var(--button-border-color);
    border-radius: 0.25rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--theme-goal-panel-header);
    padding: 0.5rem;
    border-radius: 0.25rem 0.25rem 0 0;
    color: white;

    &.collapsed {
      border-radius: 0.25rem;
    }
  }

  .content {
    padding: 0.75rem;
    padding-top: 0.5rem;
  }
</style>
