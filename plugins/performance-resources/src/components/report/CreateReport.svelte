<script lang='ts'>
  import { Card, getClient } from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'
  import TeamAndReviewSessionSelector from '../TeamAndReviewSessionSelector.svelte'
  import { Data, Ref, Space } from '@hcengineering/core'
  import { Team } from '@hcengineering/kra-team'
  import { PerformanceReport, ReviewSession } from '@hcengineering/performance'
  import contact, { Person, PersonAccount } from '@hcengineering/contact'
  import { AssigneeBox } from '@hcengineering/contact-resources'
  import performance from '../../plugin'

  const dispatch = createEventDispatcher()
  const client = getClient()

  let team: Ref<Team> | undefined
  let reviewSession: Ref<ReviewSession> | undefined
  let selectedEmployee: Ref<Person> | undefined
  let selectedAccount: Ref<PersonAccount> | undefined

  let canSave: boolean
  $: canSave = selectedAccount !== undefined && reviewSession !== undefined

  $: void client.findOne(
    contact.class.PersonAccount,
    {
      person: selectedEmployee
    }
  ).then((res) => {
    if (res !== undefined) {
      selectedAccount = res._id
    }
  })

  async function createReport (): Promise<void> {
    if (!canSave) {
      return
    }
    const value: Data<PerformanceReport> = {
      reviewee: selectedAccount as Ref<PersonAccount>,
      reviewSession: reviewSession as Ref<ReviewSession>,
      reviewComments: []
    }
    await client.createDoc(performance.class.PerformanceReport, reviewSession as Ref<Space>, value)
    dispatch('close')
  }
</script>

<Card
  label={performance.string.CreateReport}
  okAction={createReport}
  {canSave}
  on:close={() => {
    dispatch('close')
  }}
>
  <svelte:fragment slot="header">
    <TeamAndReviewSessionSelector
      bind:team
      bind:reviewSession
    />
  </svelte:fragment>
  <AssigneeBox
    _class={contact.class.PersonAccount}
    label={performance.string.Assignee}
    bind:value={selectedEmployee}
  />
</Card>
