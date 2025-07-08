<script lang="ts">
  import { KRA, PerformanceReport, ReviewSession } from '@hcengineering/performance'
  import { ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  // import { DatePresenter, ListView } from '@hcengineering/ui'
  import { personAccountByIdStore, personAccountPersonByIdStore, UserInfo } from '@hcengineering/contact-resources'
  import { Class, Ref, WithLookup } from '@hcengineering/core'
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { getClient, MessageBox, createQuery } from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'
  import { Panel } from '@hcengineering/panel'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import ViewletSelector from '@hcengineering/view-resources/src/components/ViewletSelector.svelte'
  import ReviewEditor from './ReviewEditor.svelte'
  import { Button, closePanel, IconChevronRight, Label, showPopup } from '@hcengineering/ui'
  import performance from '../../plugin'

  const client = getClient()
  const dispatch = createEventDispatcher()

  export let _id: Ref<PerformanceReport>
  export let _class: Ref<Class<PerformanceReport>>
  export let withoutInput: boolean | undefined = false

  let value: WithLookup<PerformanceReport> | undefined
  let reviewee: PersonAccount | undefined
  let person: Person | undefined
  let reviewSession: ReviewSession | undefined

  let viewlet: WithLookup<Viewlet> | undefined = undefined
  let viewOptions: ViewOptions | undefined

  let kras: Ref<KRA>[] = []
  const reportQuery = createQuery()
  $: if (_id !== undefined && _class !== undefined) {
    reportQuery.query(
      _class,
      { _id },
      (result) => {
        if (result !== undefined) {
          value = result[0]
          reviewSession = result[0].$lookup?.reviewSession
        }
      },
      {
        lookup: {
          reviewSession: performance.class.ReviewSession
        }
      }
    )
  }

  let content: HTMLElement

  $: if (value !== undefined) {
    reviewee = $personAccountByIdStore.get(value.reviewee)
    person = reviewee !== undefined ? $personAccountPersonByIdStore.get(reviewee?.person) : undefined
    void client.findAll(
      performance.class.EmployeeKRA,
      {
        assignee: person?._id,
        space: value?.space
      }
    ).then((result) => {
      if (result !== undefined) {
        kras = result.map((v) => v.kra)
      }
    })
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if value !== undefined}
  <Panel
    object={value}
    allowClose={false}
    selectedAside={false}
    isAside={false}
    isPresence={false}
    isHeader={true}
    useMaxWidth={true}
    {withoutInput}
    bind:content
    on:close={() => {
      dispatch('close')
    }}
  >
    <svelte:fragment slot="title">
      <ViewletSelector bind:viewlet viewletQuery={{ attachTo: performance.class.PTask }} />
      <ViewletSettingButton bind:viewOptions bind:viewlet />
      {#if person !== undefined}
        <div class="title not-active report-title">
          <Label label={performance.string.PerformanceReport} />
          <IconChevronRight size={'small'} />
          <span>{reviewSession?.name}</span>
          <IconChevronRight size={'small'} />
          <UserInfo value={person} size={'small'} />
        </div>
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="header">
      <Button
        label={performance.string.UpdateReport}
        on:click={() => {
          if (value === undefined) return
          showPopup(MessageBox, {
            label: performance.string.UpdateReport,
            message: performance.string.UpdateReportConfirm,
            action: async () => {
              if (value?.reviewSession === undefined) return
              await client.createDoc(performance.class.PerformanceReport, value?.reviewSession, {
                reviewee: value?.reviewee,
                reviewSession: value?.reviewSession,
                content: null,
                reviewer: null,
                score: null
              })
              closePanel()
            }
          })
        }}
      />
    </svelte:fragment>
    {#if viewlet !== undefined && viewOptions}
      {#if value.scorePreview !== undefined}
        <span class="heading-ui-H2">
          <Label label={performance.string.EmployeeScore} />: {value.scorePreview}
        </span>
      {/if}
      <ViewletContentView
        _class={performance.class.PTask}
        space={undefined}
        {viewlet}
        {viewOptions}
        query={{
          _id: {
            $in: value.tasks
          },
          kra: {
            $in: [...kras, null]
          }
        }}
      />
      <ReviewEditor object={value} />
    {/if}
  </Panel>
{/if}

<style lang="scss">
  .report-title {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    span {
      align-content: center;
    }
  }
</style>
