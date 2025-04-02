<script lang="ts">
  import { Card, getClient } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, RatingScale } from '@hcengineering/kra'
  import { EditBox, Label } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import TitlePresenter from '../TitlePresenter.svelte'
  import { createEventDispatcher } from 'svelte'

  export let issue: Issue
  export let ratingScale: RatingScale | undefined = undefined
  export let value: number | undefined = undefined

  const client = getClient()
  const dispatch = createEventDispatcher()
  const space = issue.space

  let comment = ''

  $: canSave = value !== undefined

  async function save(): Promise<void> {
    if (!canSave) {
      return
    }

    if (ratingScale === undefined) {
      throw new Error('Create RatingScale not implemented')
    } else {
      await client.updateDoc(kra.class.RatingScale, space, ratingScale._id, {
        value,
        comment
      })
    }
    dispatch('close')
  }
</script>

<Card label={kra.string.RatingScale} okAction={save} {canSave} okLabel={kra.string.Save}>
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
</Card>

<style>
  .boxes {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
</style>
