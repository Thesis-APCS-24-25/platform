<script lang="ts">
  import kra from '../../../plugin'
  import { Card } from '@hcengineering/presentation'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { Goal, Issue, Project, Kpi, RatingScale } from '@hcengineering/kra'
  import { DropdownIntlItem, DropdownLabelsIntl, Label } from '@hcengineering/ui'
  import EditKpi from './kpi/EditKpi.svelte'
  import EditRatingScale from './ratingscale/EditRatingScale.svelte'
  import { Ref } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'

  export let issue: Ref<Issue>
  export let space: Ref<Project>
  export let canEditIssue: boolean = true

  let template: Goal | undefined = undefined
  $: templateKpi = (template?._class === kra.class.Kpi ? template : undefined) as Kpi | undefined
  $: templateRatingScale = (template?._class === kra.class.RatingScale ? template : undefined) as
    | RatingScale
    | undefined

  let kpiForm: EditKpi | undefined
  let ratingScaleForm: EditRatingScale | undefined

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

  function handleTemplateSelected (evt: CustomEvent<Goal | undefined>): void {
    if (evt.detail === undefined) {
      return
    }
    const goal = evt.detail
    if (goal._class === kra.class.Kpi) {
      selected = 'kpi'
      template = goal
    } else if (goal._class === kra.class.RatingScale) {
      selected = 'rating-scale'
      template = goal
    } else {
      selected = 'none'
    }
  }
</script>

<Card
  label={kra.string.AddGoal}
  okAction={save}
  {canSave}
  width="small"
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

  <svelte:fragment slot="subheader">
    <Label label={kra.string.Template} />
    <span class="m-1">:</span>
    <ObjectBox
      kind='regular'
      _class={kra.class.Goal}
      label={kra.string.ChooseTemplate}
      value={template?._id}
      showNavigate={false}
      docQuery={{ space }}
      on:object={handleTemplateSelected}
    >
    </ObjectBox>
  </svelte:fragment>

  <svelte:fragment slot="pool">
    <slot name="pool" />
  </svelte:fragment>

  {#if selected === 'kpi'}
    <EditKpi {space} bind:canSave={canSaveKpi} bind:this={kpiForm} {issue} kpi={templateKpi} />
  {:else if selected === 'rating-scale'}
    <EditRatingScale
      {space}
      bind:canSave={canSaveRatingScale}
      bind:this={ratingScaleForm}
      {issue}
      ratingScale={templateRatingScale}
    />
  {/if}
</Card>
