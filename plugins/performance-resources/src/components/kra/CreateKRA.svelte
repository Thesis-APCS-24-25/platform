<script lang="ts">
  import core, { AttachedData, Ref, SortingOrder, Space, generateId } from '@hcengineering/core'
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import { TaskType, makeRank } from '@hcengineering/task'
  import {
    Button,
    createFocusManager,
    EditBox,
    FocusHandler,
    getColorNumberByText,
    getPlatformColor,
    getPlatformColorForText,
    Label,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import performance from '../../plugin'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { currentTeam } from '../../utils/team'
  import { ColorsPopup } from '@hcengineering/view-resources'

  $: team = $currentTeam
  export let space: Ref<ReviewSession> | undefined
  let reviewSession: Ref<ReviewSession> | undefined = space

  let title: string = ''
  let description: string = ''
  let color: number | undefined = undefined
  let colorSelected = false

  const dispatch = createEventDispatcher()
  const client = getClient()
  const manager = createFocusManager()
  const kraId = generateId<KRA>()

  export function canClose(): boolean {
    return title !== ''
  }

  const kind: Ref<TaskType> = performance.taskTypes.KRA

  $: colorString = colorSelected
    ? getPlatformColor(color ?? 0, $themeStore.dark)
    : getPlatformColorForText(title, $themeStore.dark)

  async function createKRA(): Promise<void> {
    if (reviewSession === undefined) {
      return
    }
    const sp = await client.findOne(performance.class.ReviewSession, { _id: reviewSession })
    if (sp === undefined) {
      throw new Error('Review Session not found')
    }
    const status = await client.findOne(core.class.Status, {}, { sort: { rank: SortingOrder.Ascending } })
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
      color: getColorNumberByText(colorString),
      description,
      dueDate: null
    }

    await client.addCollection(
      performance.class.KRA,
      reviewSession as Ref<Space>,
      reviewSession,
      performance.class.ReviewSession,
      'kras',
      value,
      kraId
    )
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
  width="small"
  canSave={title.trim().length > 0}
  on:close
  on:changeContent
>
  <svelte:fragment slot="header">
    <!-- <TeamAndReviewSessionSelector -->
    <!--   bind:team={team} -->
    <!--   bind:reviewSession={reviewSession} -->
    <!-- /> -->
    <SpaceSelector
      kind="regular"
      defaultIcon={performance.icon.ReviewSession}
      bind:space={reviewSession}
      label={performance.string.ReviewSession}
      _class={performance.class.ReviewSession}
      query={{ space: team }}
    />
  </svelte:fragment>
  {#if reviewSession !== undefined}
    <div class="flex-row-center clear-mins flex-gap-2 items-baseline">
      <Button
        icon={performance.icon.KRA}
        iconProps={{
          fill: colorString
        }}
        on:click={() => {
          showPopup(ColorsPopup, {}, 'center', (res) => {
            color = res
            colorSelected = true
          })
        }}
      />
      <div class="flex-col-left m-3 clear-mins flex-gap-4">
        <div class="mb-3">
          <EditBox
            bind:value={title}
            placeholder={performance.string.KRANamePlaceholder}
            autoFocus
            kind={'large-style'}
            focusIndex={1}
          />
        </div>
        <div>
          <EditBox
            bind:value={description}
            placeholder={performance.string.KRADescriptionPlaceholder}
            kind={'large-style'}
            focusIndex={2}
          />
        </div>
      </div>
    </div>
  {:else}
    <Label label={performance.string.NoReviewSessions} />
  {/if}
</Card>
