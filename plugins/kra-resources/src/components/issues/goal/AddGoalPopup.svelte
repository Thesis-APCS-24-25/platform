<script lang="ts">
  import kra from '../../../plugin'
  import { Card } from '@hcengineering/presentation'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { Issue } from '@hcengineering/kra'
  import { DropdownIntlItem, DropdownLabelsIntl } from '@hcengineering/ui'
  import AddKpi from './kpi/AddKpi.svelte'
  import AddRatingScale from './ratingscale/AddRatingScale.svelte'
  import { Ref } from '@hcengineering/core'
  import { createEventDispatcher } from 'svelte'

  export let issue: Issue | undefined = undefined

  let form: any

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

  let issueId = issue?._id

  let canSaveKpi = false
  let canSaveRatingScale = false
  $: canSave = selected !== 'none' && issueId !== undefined && (canSaveKpi || canSaveRatingScale)

  function handleIssueChange(evt: CustomEvent<Ref<Issue>>): void {
    issueId = evt.detail
  }

  async function save(): Promise<void> {
    await form.save()

    dispatch('close')
  }
</script>

<Card label={kra.string.AddGoal} okAction={save} {canSave} width="medium">
  <svelte:fragment slot="header">
    <ObjectBox
      size="small"
      kind="regular"
      showNavigate={false}
      icon={kra.icon.Issue}
      value={issueId}
      on:change={handleIssueChange}
      _class={kra.class.Issue}
      label={kra.string.Issue}
    />
    <DropdownLabelsIntl {items} label={kra.string.ChooseGoal} bind:selected />
  </svelte:fragment>

  <svelte:fragment slot="pool">
    <slot name="pool" />
  </svelte:fragment>

  {#if selected === 'kpi'}
    <AddKpi bind:canSave={canSaveKpi} bind:this={form} bind:issueId />
  {:else if selected === 'rating-scale'}
    <AddRatingScale bind:canSave={canSaveRatingScale} bind:this={form} bind:issueId />
  {/if}
</Card>
