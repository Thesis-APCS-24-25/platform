<script lang="ts">
  import kra from '../../../plugin'
  import { Card } from '@hcengineering/presentation'
  import { ObjectBox } from '@hcengineering/view-resources'
  import { Issue } from '@hcengineering/kra'
  import { DropdownIntlItem, DropdownLabelsIntl } from '@hcengineering/ui'
  import AddKpi from './AddKpi.svelte'

  export let issue: Issue | undefined = undefined

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

  let selected: DropdownIntlItem['id'] = 'none'

  $: issueId = issue?._id

  let canSaveKpi = false
  $: canSave = selected !== 'none' && canSaveKpi
</script>

<Card label={kra.string.AddGoal} okAction={() => {}} {canSave} width="medium">
  <svelte:fragment slot="header">
    <ObjectBox
      size="small"
      kind="regular"
      showNavigate={false}
      icon={kra.icon.Issue}
      value={issueId}
      on:click={() => {}}
      _class={kra.class.Issue}
      label={kra.string.Issue}
    />
    <DropdownLabelsIntl {items} label={kra.string.ChooseGoal} bind:selected />
  </svelte:fragment>

  {#if selected === 'kpi'}
    <AddKpi bind:canSave={canSaveKpi} />
  {:else if selected === 'rating-scale'}
    <p>{kra.string.RatingScale}</p>
  {/if}
</Card>
