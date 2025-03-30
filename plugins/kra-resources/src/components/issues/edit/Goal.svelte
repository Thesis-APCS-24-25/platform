<script lang="ts">
  import { Goal, Issue } from '@hcengineering/kra'
  import Kpi from './Kpi.svelte'
  import {
    Button,
    IconAdd,
    IconScale,
    Label,
    closeTooltip,
    showPopup,
    Chevron,
    ExpandCollapse,
    ButtonIcon,

    IconInfo,

    IconDetails


  } from '@hcengineering/ui'
  import tracker from '../../../plugin'
  import { getGoal } from '../../../utils/goal'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import RatingScale from './RatingScale.svelte'

  export let issue: Issue

  let goal: Goal | null = null
  let isCollapsed = false

  getGoal(issue, (v) => {
    goal = v
  })

  function handleCreateGoal(e: MouseEvent): void {
    throw new Error('Function not implemented.')
  }
</script>

<div class="goal-section">
  <div class="header" class:collapsed={isCollapsed}>
    <Icon icon={IconDetails} size="medium" fill={'var(--caption-color)'} />
    <Label label={tracker.string.Goal}/>
    <button
      on:click={() => {
        isCollapsed = !isCollapsed
      }}
    >
      <Chevron size={'small'} expanded={!isCollapsed} outline fill={'var(--caption-color)'} marginRight={'.375rem'} />
    </button>
    <!-- <div class="buttons"> -->
    <!--   <Button -->
    <!--     icon={goal ? IconScale : IconAdd} -->
    <!--     kind={'ghost'} -->
    <!--     showTooltip={{ label: goal ? tracker.string.ChangeGoal : tracker.string.AttachGoal, direction: 'bottom' }} -->
    <!--     on:click={() => { -->
    <!--       showPopup( -->
    <!--         tracker.component.SelectGoal, -->
    <!--         { -->
    <!--           currentGoal: goal, -->
    <!--           onSelect: handleAttachGoal -->
    <!--         }, -->
    <!--         'top' -->
    <!--       ) -->
    <!--     }} -->
    <!--   /> -->
    <!-- </div> -->
  </div>

  {#if !isCollapsed}
    <ExpandCollapse isExpanded={!isCollapsed}>
      <div class="content">
        {#if goal}
          {#if goal._class === tracker.class.Kpi}
            <Kpi kpi={goal} />
          {:else}
            <RatingScale ratingScale={goal} />
          {/if}
        {:else}
          <div class="empty-state">
            <span>{tracker.string.NoGoalAttached}</span>
            <ButtonIcon icon={IconAdd} kind="tertiary" size="small" on:click={handleCreateGoal} />
          </div>
        {/if}
      </div>
    </ExpandCollapse>
  {/if}
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
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
