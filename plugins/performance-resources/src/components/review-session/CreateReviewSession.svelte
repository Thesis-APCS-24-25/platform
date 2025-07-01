<script lang="ts">
  import { getCurrentAccount, Ref, Space, Timestamp } from '@hcengineering/core'
  import { Card, getClient, SpaceSelector } from '@hcengineering/presentation'
  import {
    createFocusManager,
    DatePresenter,
    EditBox,
    FocusHandler,
  } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'

  import performance from '../../plugin'
  import { createReviewSession } from '../../utils/review-session'
  import kraTeam, { Team } from '@hcengineering/kra-team'
  import TeamPresenter from '../team/TeamPresenter.svelte'
  import { currentTeam as currentTeamStore } from '../../utils/team'
  import ToggleButton from '../ui/ToggleButton.svelte'

  // export function canClose (): boolean {
  //   return object.title === ''
  // }
  const me = getCurrentAccount()

  export let team: Team | undefined

  const dispatch = createEventDispatcher()
  const client = getClient()
  let name: string = ''
  const description: string = ''
  let startDate: Timestamp
  let endDate: Timestamp
  let identifier: string = ''
  let currentTeam: Ref<Space> | undefined = $currentTeamStore

  let allowMembersToCommentOnReport: boolean = true

  $: if (team !== undefined) {
    currentTeam = team._id as Ref<Space>
  }

  $: canSave = name !== '' && startDate !== undefined && endDate !== undefined && currentTeam !== undefined

  async function create(): Promise<void> {
    if (currentTeam !== undefined) {
      await createReviewSession(
        client,
        name,
        description,
        startDate,
        endDate,
        currentTeam,
        performance.ids.ClassingProjectType,
        identifier !== '' ? identifier : 'KRA',
        allowMembersToCommentOnReport
      )
    }
    dispatch('close', name)
  }

  const manager = createFocusManager()

  $: identifier = identifier.toLocaleUpperCase().replaceAll('-', '_').replaceAll(' ', '_').substring(0, 7)
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
      readonly
      kind={'regular'}
      size={'small'}
      component={TeamPresenter}
      query={{
        members: me._id
      }}
      defaultIcon={kraTeam.icon.Teams}
    />
  </svelte:fragment>

  <div class="flex-row-center m-3 clear-mins items-end">
    <EditBox
      label={performance.string.ReviewSessionName}
      placeholder={performance.string.ReviewSessionNamePlaceholder}
      bind:value={name}
      kind={'large-style'}
      autoFocus
      focusIndex={1}
      on:input={() => {
        identifier = name.toLocaleUpperCase().replaceAll('-', '_').replaceAll(' ', '_').substring(0, 8)
      }}
    />
    <div class="max-w-40">
      <EditBox
        placeholder={performance.string.Identifier}
        bind:value={identifier}
        kind="underline"
        focusIndex={2}
        uppercase
      />
    </div>
  </div>
  <svelte:fragment slot="pool">
    <div class="flex-row-center clear-mins">
      <DatePresenter
        kind={'regular'}
        size={'large'}
        bind:value={startDate}
        editable
        labelNull={performance.string.ReviewSessionStart}
        label={performance.string.ReviewSessionStart}
        focusIndex={3}
        detail={performance.string.ReviewSessionStartDetail}
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
        focusIndex={4}
        detail={performance.string.ReviewSessionEndDetail}
      />
    </div>
    <!-- <div class="flex-row-center clear-mins">
      <ToggleButton
        kind="regular"
        size="large"
        bind:value={allowMembersToCommentOnReport}
        label={performance.string.AllowMembersToCommentOnReport}
      />
    </div> -->
  </svelte:fragment>
</Card>

<style lang="scss">
  .antiButton {
    border-radius: 0.375rem;
  }
</style>
