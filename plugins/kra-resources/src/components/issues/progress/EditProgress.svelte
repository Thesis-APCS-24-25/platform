<script lang="ts">
  import { Issue } from '@hcengineering/kra'
  import { ButtonIcon, Icon, IconAdd, IconDelete, IconEdit, Label, showPopup } from '@hcengineering/ui'
  import kra from '../../../plugin'
  import performance, { Kpi, Progress } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'
  import KpiEditor from './kpi/KpiEditor.svelte'
  import ProgressEditor from './ProgressEditor.svelte'

  export let issue: Issue

  export let progress: Progress | undefined = undefined

  const progressQuery = createQuery()
  $: progressQuery.query(performance.class.Progress, { _id: issue.progress }, (res) => {
    if (res.length > 0) {
      progress = res[0]
    } else {
      progress = undefined
    }
  })

  const asKpi = (progress: Progress): Kpi => (progress as Kpi)
  let isCollapsed = false
</script>

<div class="goal-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={kra.icon.Goal} size="medium" />
    <Label label={kra.string.Goal} />
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
        />
        <ButtonIcon
          icon={IconEdit}
          kind="tertiary"
          size="small"
          inheritColor
          tooltip={{
            label: kra.string.EditGoal
          }}
        />
        <ButtonIcon
          icon={IconDelete}
          kind="tertiary"
          size="small"
          inheritColor
          tooltip={{
            label: kra.string.RemoveGoal
          }}
        />
      </div>
    {:else}
      <ButtonIcon
        icon={IconAdd}
        kind="tertiary"
        size="small"
        inheritColor
        tooltip={{
          label: kra.string.AddGoal
        }}
      />
    {/if}
  </div>
  <div class="content">
    {#if progress}
      {#if progress._class === performance.class.Kpi}
        {@const kpi = asKpi(progress)}
        <KpiEditor {kpi} />
      {:else }
        <ProgressEditor {progress} />
      {/if}
    {:else}
      <div class="empty-state">
        <Label label={kra.string.NoGoalAttached} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
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
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
