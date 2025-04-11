<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, RatingScale, Report } from '@hcengineering/kra'
  import { EditBox, } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import TitlePresenter from '../TitlePresenter.svelte'
  import { createEventDispatcher } from 'svelte'
  import { AttachedData } from '@hcengineering/core'
  import ReportsPopup from './ReportsPopup.svelte'

  export let issue: Issue
  export let ratingScale: RatingScale | undefined = undefined
  export let value: number | undefined = undefined

  const client = getClient()
  const dispatch = createEventDispatcher()
  const space = issue.space

  let comment = ''

  $: canSave = value !== undefined

  async function save (): Promise<void> {
    if (!canSave) {
      return
    }

    if (ratingScale === undefined || value === undefined) {
      throw new Error('Create RatingScale not implemented')
    } else {
      const report: AttachedData<Report> = {
        note: comment,
        value: value,
        date: null,
        employee: null
      }
    }
    dispatch('close')
  }
</script>

<ReportsPopup>
  <svelte:fragment slot="header">
    {#if issue}
      <TitlePresenter value={issue} showParent={false} />
    {/if}
  </svelte:fragment>

  <div class="m-3 clear-mins">
    <EditBox kind="large-style" disabled={true} value={ratingScale.name} />
  </div>

  <div class="m-3">
    <EditBox kind="small-style" disabled={true} value={ratingScale.description} />
  </div>

  <div class="boxes">
    <RatingScaleBoxes
      size="large"
      {value}
      onBoxClick={(v) => {
        value = v
      }}
    />
  </div>

  <div class="m-3 clear-mins">
    <EditBox bind:value={comment} label={kra.string.Comment} kind="editbox" />
  </div>
</ReportsPopup>

<style>
  .boxes {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
</style>
