<script lang="ts">
  import core, { AttachedData, Ref, SortingOrder, Space, generateId } from '@hcengineering/core'
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import { TaskType, makeRank } from '@hcengineering/task'
  import { createFocusManager, EditBox, FocusHandler, Label } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import performance from '../../plugin'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { currentTeam } from '../../utils/team'

  $: team = $currentTeam
  export let space: Ref<ReviewSession> | undefined
  let reviewSession: Ref<ReviewSession> | undefined = space

  let title: string = ''
  let description: string = ''

  const dispatch = createEventDispatcher()
  const client = getClient()
  const manager = createFocusManager()
  const kraId = generateId<KRA>()

  export function canClose (): boolean {
    return title !== ''
  }

  const kind: Ref<TaskType> = performance.taskTypes.KRA

  async function createKRA (): Promise<void> {
    if (reviewSession === undefined) {
      return
    }
    const sp = await client.findOne(performance.class.ReviewSession, { _id: reviewSession })
    if (sp === undefined) {
      throw new Error('Review Session not found')
    }
    const status = await client.findOne(
      core.class.Status,
      { },
      { sort: { rank: SortingOrder.Ascending } }
    )
    if (status === undefined) {
      throw new Error('Status not found')
    }
    // if (kind === undefined) {
    //   throw new Error('kind is not specified')
    // }

    const lastOne = await client.findOne(
      performance.class.KRA,
      { space: reviewSession },
      { sort: { rank: SortingOrder.Descending } }
    )
    const incResult = await client.updateDoc(
      performance.class.ReviewSession,
      core.space.Space,
      reviewSession,
      {
        $inc: { sequence: 1 }
      },
      true
    )

    const number = (incResult as any).object.sequence

    const value: AttachedData<KRA> = {
      status: status._id,
      number,
      title,
      kind,
      identifier: `KRA-${number}`,
      rank: makeRank(lastOne?.rank, undefined),
      kraStatus: performance.kraStatus.Drafting,
      assignee: null,
      description,
      dueDate: null
    }

    await client.addCollection(performance.class.KRA, reviewSession as Ref<Space>, reviewSession, performance.class.ReviewSession, 'kras', value, kraId)
    dispatch('close')
  }

  // let boards: ReviewSession[] = []
  // const boardQuery = createQuery()
  // boardQuery.query(performance.class.ReviewSession, {}, (res) => {
  //   boards = res
  // })
</script>

<FocusHandler {manager} />

<Card
  label={performance.string.CreateKRA}
  okAction={createKRA}
  canSave={title.trim().length > 0}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <svelte:fragment slot="header">
    <!-- <TeamAndReviewSessionSelector -->
    <!--   bind:team={team} -->
    <!--   bind:reviewSession={reviewSession} -->
    <!-- /> -->
    <SpaceSelector
      kind='regular'
      defaultIcon={performance.icon.ReviewSession}
      bind:space={reviewSession}
      label={performance.string.ReviewSession}
      _class={performance.class.ReviewSession}
      query={{ space: team }}
    />
  </svelte:fragment>
  {#if reviewSession !== undefined}
    <div class="flex-row-center m-3 clear-mins">
      <EditBox
        label={performance.string.KRAName}
        bind:value={title}
        placeholder={performance.string.KRANamePlaceholder}
        autoFocus
        kind={'large-style'}
        focusIndex={1}
      />
    </div>
    <div class="flex-row-center m-3 clear-mins">
      <EditBox
        label={performance.string.KRADescription}
        bind:value={description}
        placeholder={performance.string.KRADescriptionPlaceholder}
        kind={'large-style'}
        focusIndex={2}
      />
    </div>
  {:else}
    <Label
      label={performance.string.NoReviewSessions}
    />
  {/if}
</Card>
