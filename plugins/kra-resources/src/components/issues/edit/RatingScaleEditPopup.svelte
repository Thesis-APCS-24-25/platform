<script lang="ts">
  import { Card } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Issue, RatingScale } from '@hcengineering/kra'
  import { EditBox, Label } from '@hcengineering/ui'
  import RatingScaleBoxes from './RatingScaleBoxes.svelte'
  import TitlePresenter from '../TitlePresenter.svelte'

  export let issue: Issue | undefined = undefined
  export let ratingScale: RatingScale
  export let value: number

  let comment = ''

</script>

<Card label={kra.string.RatingScale} okAction={() => {}}>
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
    <EditBox
      label={kra.string.Comment}
      kind="editbox" value={comment} />
  </div>
</Card>

<style>
  .boxes {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
</style>
