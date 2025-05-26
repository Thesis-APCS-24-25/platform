<script lang="ts">
  import kra from '../../../plugin'
  import { Card } from '@hcengineering/presentation'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { Goal, Issue, Project } from '@hcengineering/kra'
  import { DropdownIntlItem, DropdownLabelsIntl } from '@hcengineering/ui'
  import AddKpi from './kpi/AddKpi.svelte'
  import AddRatingScale from './ratingscale/AddRatingScale.svelte'
  import { Ref } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'

  export let issue: Ref<Issue>
  export let space: Ref<Project>
  export let canEditIssue: boolean = true

  let kpiForm: AddKpi | undefined
  let ratingScaleForm: AddRatingScale | undefined

  const items: DropdownIntlItem[] = [
    {
      id: 'none',
      label: kra.string.SelectGoalType
    },
    {
      id: 'kpi',
      label: kra.string.Kpi
    },
    {
      id: 'rating-scale',
      label: kra.string.RatingScale
    }
  ]

  const dispatch = createEventDispatcher()

  let selected: DropdownIntlItem['id'] = 'none'

  let canSaveKpi = false
  let canSaveRatingScale = false
  $: canSave = selected !== 'none' && issue !== undefined && (canSaveKpi || canSaveRatingScale)

  let id: Ref<Goal> | undefined = undefined

  function handleIssueChange (evt: CustomEvent<Ref<Issue>>): void {
    issue = evt.detail
  }

  async function save (): Promise<void> {
    if (!canSave) {
      return
    }

    if (selected === 'kpi' && kpiForm !== undefined) {
      id = await kpiForm.save()
    } else if (selected === 'rating-scale' && ratingScaleForm !== undefined) {
      id = await ratingScaleForm.save()
    }
  }
</script>

<Card
  label={kra.string.AddGoal}
  okAction={save}
  {canSave}
  width="medium"
  on:close={() => {
    dispatch('close', id)
  }}
>
  <svelte:fragment slot="header">
    {#if canEditIssue}
      <ObjectBox
        docQuery={{
          goal: undefined
        }}
        size="small"
        kind="regular"
        showNavigate={false}
        icon={kra.icon.Issue}
        value={issue}
        on:change={handleIssueChange}
        _class={kra.class.Issue}
        label={kra.string.Issue}
      />
    {/if}
    <DropdownLabelsIntl {items} label={kra.string.ChooseGoal} bind:selected />
  </svelte:fragment>

  <svelte:fragment slot="pool">
    <slot name="pool" />
  </svelte:fragment>

  {#if selected === 'kpi'}
    <AddKpi {space} bind:canSave={canSaveKpi} bind:this={kpiForm} {issue} />
  {:else if selected === 'rating-scale'}
    <AddRatingScale {space} bind:canSave={canSaveRatingScale} bind:this={ratingScaleForm} {issue} />
  {/if}
</Card>
