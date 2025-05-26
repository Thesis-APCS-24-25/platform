<script lang="ts">
  import { Goal, Issue, Kpi, RatingScale } from '@hcengineering/kra'
  import { IconAdd, Label, showPopup, ButtonIcon, IconDetails, IconDelete, IconEdit } from '@hcengineering/ui'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import RatingScaleEditor from './ratingscale/RatingScale.svelte'
  import KpiEditor from './kpi/Kpi.svelte'
  import AddGoalPopup from './AddGoalPopup.svelte'
  import EditGoalPopup from './EditGoalPopup.svelte'
  import { createQuery, getClient, MessageBox } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'
  import { removeGoal } from '../../../utils/goal'

  export let issue: Issue

  let goal: Goal | null = null
  const isCollapsed = false

  const goalQuery = createQuery()

  $: goalQuery.query(
    kra.class.Goal,
    {
      _id: issue.goal
    },
    (res) => {
      if (res.length > 0) {
        goal = res[0]
      } else {
        goal = null
      }
    },
    {
      lookup: {
        unit: kra.class.Unit
      }
    }
  )

  let kpi: Kpi | null = null
  let ratingScale: RatingScale | null = null

  $: if (goal !== null) {
    if (goal._class === kra.class.Kpi) {
      kpi = goal as WithLookup<Kpi>
      ratingScale = null
    } else if (goal._class === kra.class.RatingScale) {
      ratingScale = goal as RatingScale
      kpi = null
    }
  }

  const dispatch = createEventDispatcher()

  async function onNewGoal (e: Ref<Goal> | undefined): Promise<void> {
    if (e !== undefined) {
      const client = getClient()
      await client.updateDoc(kra.class.Issue, issue.space, issue._id, {
        goal: e
      })
    }
  }

  function handleCreateGoal (e: MouseEvent): void {
    e.stopPropagation()
    showPopup(
      AddGoalPopup,
      {
        issue: issue._id,
        space: issue.space
      },
      'top',
      onNewGoal
    )
  }

  function handleRemoveGoal (): void {
    showPopup(
      MessageBox,
      {
        label: kra.string.RemoveGoalDialogTitle,
        message: kra.string.RemoveGoalDialogMessage
      },
      'top',
      async (result?: boolean) => {
        if (result === true) {
          await removeGoal(issue)
          dispatch('close')
        }
      }
    )
  }

  function handleEditGoal (): void {
    showPopup(EditGoalPopup, {
      goal: issue.goal
    })
  }
</script>

<div class="goal-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={IconDetails} size="medium" fill={'var(--caption-color)'} />
    <Label label={kra.string.Goal} />
    {#if goal}
      <div>
        <ButtonIcon icon={IconEdit} kind="tertiary" size="small" on:click={handleEditGoal} />
        <ButtonIcon icon={IconDelete} kind="tertiary" size="small" on:click={handleRemoveGoal} />
      </div>
    {:else}
      <ButtonIcon icon={IconAdd} kind="tertiary" size="small" on:click={handleCreateGoal} />
    {/if}
  </div>
  <div class="content">
    {#if goal}
      {#if kpi}
        <KpiEditor {issue} {kpi} />
      {:else if ratingScale}
        <RatingScaleEditor {issue} {ratingScale} />
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
    border: 1px solid var(--theme-divider-color, #e0e0e0);
    border-radius: 0.25rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, var(--theme-primary-color, #4c6ef5), var(--theme-secondary-color, #7048e8));
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
