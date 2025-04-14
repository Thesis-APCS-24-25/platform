<script lang="ts">
  import kra from '../../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { Goal, Issue } from '@hcengineering/kra'
  import { DropdownIntlItem, DropdownLabelsIntl } from '@hcengineering/ui'
  import AddKpi from './kpi/AddKpi.svelte'
  import AddRatingScale from './ratingscale/AddRatingScale.svelte'
  import { Ref } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'

  let kpiForm: AddKpi | undefined
  let ratingScaleForm: AddRatingScale | undefined

  export let issue: Ref<Issue> | undefined = undefined
  export let canEditIssue: boolean = true

  const items: DropdownIntlItem[] = [
    {
      id: 'none',
      label: kra.string.Unselected
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

  function handleIssueChange (evt: CustomEvent<Ref<Issue>>): void {
    issue = evt.detail
  }

  async function save (): Promise<void> {
    if (!canSave) {
      return
    }

    if (selected === 'kpi' && kpiForm !== undefined) {
      const id = await kpiForm.save()
      dispatch('close', id)
    } else if (selected === 'rating-scale' && ratingScaleForm !== undefined) {
      const id = await ratingScaleForm.save()

      dispatch('close', id)
    }
  }

  // async function firstIssueWithoutGoal (): Promise<Issue | undefined> {
  //   if (issue !== undefined) {
  //     const client = getClient()
  //     const found: Issue | undefined = await client.findOne(kra.class.Issue, {
  //       _id: issue
  //     })
  //     if (found !== undefined && found.goal === undefined) {
  //       return found
  //     }
  //   }
  //   return undefined
  // }
</script>

<Card label={kra.string.AddGoal} okAction={save} {canSave} width="medium">
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
    <AddKpi bind:canSave={canSaveKpi} bind:this={kpiForm} {issue} />
  {:else if selected === 'rating-scale'}
    <AddRatingScale bind:canSave={canSaveRatingScale} bind:this={ratingScaleForm} {issue} />
  {/if}
</Card>
