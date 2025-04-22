<script lang="ts">
  import core, { AttachedData, Ref, SortingOrder, Space, generateId } from '@hcengineering/core'
  import { OK, Status } from '@hcengineering/platform'
  import { Card, SpaceSelector, getClient } from '@hcengineering/presentation'
  import { TaskType, makeRank } from '@hcengineering/task'
  import { EditBox, Grid, Status as StatusControl } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import performance from '../../plugin'
  import { KRA, ReviewSession } from '@hcengineering/performance'

  export let space: Ref<Space>

  let _space = space
  const status: Status = OK

  let title: string = ''
  let description: string = ''

  const dispatch = createEventDispatcher()
  const client = getClient()
  const cardId = generateId<KRA>()

  export function canClose (): boolean {
    return title !== ''
  }

  const kind: Ref<TaskType> = performance.taskTypes.KRA

  async function createCard (): Promise<void> {
    const sp = await client.findOne(performance.class.ReviewSession, { _id: _space as Ref<ReviewSession> })
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
      { space: _space },
      { sort: { rank: SortingOrder.Descending } }
    )
    const incResult = await client.updateDoc(
      performance.class.ReviewSession,
      core.space.Space,
      _space,
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

    await client.addCollection(performance.class.KRA, _space, _space, performance.class.ReviewSession, 'kras', value, cardId)
    dispatch('close')
  }

  // let boards: ReviewSession[] = []
  // const boardQuery = createQuery()
  // boardQuery.query(performance.class.ReviewSession, {}, (res) => {
  //   boards = res
  // })
</script>

  <Card
    label={performance.string.CreateKRA}
    okAction={createCard}
    canSave={title.trim().length > 0}
    on:close={() => {
      dispatch('close')
    }}
    on:changeContent
  >
    <svelte:fragment slot="header">
      <SpaceSelector
        _class={performance.class.ReviewSession}
        label={performance.string.ReviewSessionName}
        bind:space={_space}
        kind={'regular'}
        size={'small'}
      />
    </svelte:fragment>
    <StatusControl slot="error" {status} />
    <Grid column={1} rowGap={1.5}>
      <EditBox
        label={performance.string.KRAName}
        bind:value={title}
        placeholder={performance.string.KRANamePlaceholder}
        autoFocus />
      <EditBox
        label={performance.string.KRADescription}
        bind:value={description}
        placeholder={performance.string.KRADescriptionPlaceholder}/>
    </Grid>
  </Card>
