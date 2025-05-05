<script lang="ts">
  import { getCurrentAccount, Ref, Space, Timestamp } from '@hcengineering/core'
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import {
    createFocusManager,
    DatePresenter,
    EditBox,
    FocusHandler
  } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'

  import performance from '../../plugin'
  import { createReviewSession } from '../../utils/review-session'
    import kraTeam, { Team } from '@hcengineering/kra-team'
  import TeamPresenter from '../team/TeamPresenter.svelte'

  // export function canClose (): boolean {
  //   return object.title === ''
  // }
  const me = getCurrentAccount()

  export let team: Team | undefined

  const dispatch = createEventDispatcher()
  const client = getClient()
  let name: string = ''
  let description: string = ''
  let startDate: Timestamp
  let endDate: Timestamp
  let currentTeam: Ref<Space> | undefined = undefined

  $: if (team !== undefined) {
    currentTeam = team._id as Ref<Space>
  }

  $: canSave = true

  async function create (): Promise<void> {
    if (currentTeam !== undefined) {
      await createReviewSession(
        client,
        name,
        description,
        startDate,
        endDate,
        currentTeam,
        performance.ids.ClassingProjectType
      )
    }
    dispatch('close', name)
  }

  const manager = createFocusManager()
</script>

  <FocusHandler {manager} />

  <Card
    label={performance.string.CreateReviewSession}
    okAction={create}
    {canSave}
    on:close={() => {
      dispatch('close')
    }}
    on:changeContent
  >
    <svelte:fragment slot="header">
      <SpaceSelector
        _class={kraTeam.class.Team}
        label={performance.string.SelectTeam}
        bind:space={currentTeam}
        kind={'regular'}
        size={'small'}
        component={TeamPresenter}
        query={
          {
            members: me._id
          }
        }
        defaultIcon={kraTeam.icon.Teams}
      />
    </svelte:fragment>

    <div class="flex-row-center m-3 clear-mins">
      <EditBox
        label={performance.string.ReviewSessionName}
        placeholder={performance.string.ReviewSessionNamePlaceholder}
        bind:value={name}
        kind={'large-style'}
        autoFocus
        focusIndex={1}
      />
    </div>
    <div class="flex-row-center m-3 clear-mins">
      <EditBox
        label={performance.string.ReviewSessionDescription}
        placeholder={performance.string.ReviewSessionDescriptionPlaceholder}
        bind:value={description}
        kind={'large-style'}
        autoFocus
        focusIndex={1}
      />
    </div>
    <svelte:fragment slot='pool'>
      <div class="flex-row-center clear-mins">
        <DatePresenter
          kind={'regular'}
          size={'large'}
          bind:value={startDate}
          editable
          labelNull={performance.string.ReviewSessionStart}
          label={performance.string.ReviewSessionStart}
        />
      </div>
      <div class="flex-row-center clear-mins">
        <DatePresenter
          kind={'regular'}
          size={'large'}
          bind:value={endDate}
          editable
          labelNull={performance.string.ReviewSessionEnd}
          label={performance.string.ReviewSessionEnd}
        />
      </div>
    </svelte:fragment>
  </Card>
