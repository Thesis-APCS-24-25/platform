<script lang="ts">
  import { Progress, Kpi, PTask, } from '@hcengineering/performance'
  import { IconAdd, Label, showPopup, ButtonIcon, IconDelete, IconEdit } from '@hcengineering/ui'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import KpiEditor from './kpi/Kpi.svelte'
  import AddProgressPopup from './AddProgressPopup.svelte'
  import EditProgressPopup from './EditProgressPopup.svelte'
  import { createQuery, getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'
  import KpiReportsPopup from '../kpi/KpiReportsPopup.svelte'

  export let issue: PTask

  let progress: Progress | null = null
  const isCollapsed = false

  const progressQuery = createQuery()

  $: progressQuery.query(
    performance.class.Progress,
    {
      _id: issue.progress
    },
    (res) => {
      if (res.length > 0) {
        progress = res[0]
      } else {
        progress = null
      }
    },
    {
      lookup: {
        unit: performance.class.Unit
      }
    }
  )

  const dispatch = createEventDispatcher()

  async function onNewProgress (e: Ref<Progress> | undefined): Promise<void> {
    if (e !== undefined) {
      const client = getClient()
      await client.updateDoc(performance.class.PTask, issue.space, issue._id, {
        progress: e
      })
    }
  }

  function handleCreateProgress (e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      AddProgressPopup,
      {
        issue: issue._id,
        space: issue.space
      },
      'top',
      onNewProgress
    )
  }

  function handleRemoveProgress (): void {
    showPopup(
      MessageBox,
      {
        label: performance.string.RemoveProgressDialogTitle,
        message: performance.string.RemoveProgressDialogMessage
      },
      'top',
      async (result?: boolean) => {
        if (result === true) {
          await removeProgress(issue)
          dispatch('close')
        }
      }
    )
  }

  function handleEditProgress (): void {
    showPopup(EditProgressPopup, {
      progress: issue.progress
    })
  }

  async function handleEdit (type: 'progress' | 'kpi'): Promise<void> {
    if (type === 'progress' && ratingScale !== null) {
      showPopup(RatingScaleEditPopup, {
        issue,
        ratingScale
      })
    } else if (type === 'kpi' && kpi !== null) {
      showPopup(KpiReportsPopup, { kpi, issue }, 'center')
    }
  }
</script>

<div class="progress-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={performance.icon.Progress} size="medium" />
    <Label label={performance.string.Progress} />
    {#if progress}
      <div>
        <ButtonIcon
          icon={performance.icon.WriteReport}
          kind="tertiary"
          size="small"
          on:click={handleEdit.bind(null, kpi !== null ? 'progress' : 'rating-scale')}
          inheritColor
          tooltip={{
            label: performance.string.Report
          }}
        />
        <ButtonIcon
          icon={IconEdit}
          kind="tertiary"
          size="small"
          on:click={handleEditProgress}
          inheritColor
          tooltip={{
            label: performance.string.EditProgress
          }}
        />
        <ButtonIcon
          icon={IconDelete}
          kind="tertiary"
          size="small"
          on:click={handleRemoveProgress}
          inheritColor
          tooltip={{
            label: performance.string.RemoveProgress
          }}
        />
      </div>
    {:else}
      <ButtonIcon
        icon={IconAdd}
        kind="tertiary"
        size="small"
        on:click={handleCreateProgress}
        inheritColor
        tooltip={{
          label: performance.string.AddProgress
        }}
      />
    {/if}
  </div>
  <div class="content">
    {#if progress}
      {#if kpi}
        <KpiEditor {kpi} />
      {/if}
    {:else}
      <div class="empty-state">
        <Label label={performance.string.NoProgressAttached} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .progress-section {
    margin-bottom: 1rem;
    border: 1px solid var(--button-border-color);
    border-radius: 0.25rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--theme-progress-panel-header);
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
