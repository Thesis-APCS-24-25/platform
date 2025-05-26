<script lang="ts">
  import performance, { PerformanceReport, ReviewSession } from '@hcengineering/performance'
  import { ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  // import { DatePresenter, ListView } from '@hcengineering/ui'
  import { personAccountByIdStore, personAccountPersonByIdStore } from '@hcengineering/contact-resources'
  import { Class, Ref, WithLookup } from '@hcengineering/core'
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { getClient } from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'
  import { Panel } from '@hcengineering/panel'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import ViewletSelector from '@hcengineering/view-resources/src/components/ViewletSelector.svelte'

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

  $: if (_id !== undefined && _class !== undefined) {
    void client.findOne(
      _class,
      { _id },
      {
        lookup: {
          reviewSession: performance.class.ReviewSession
        }
      }
    ).then((result) => {
      if (result !== undefined) {
        value = result
        reviewSession = result.$lookup?.reviewSession
      }
    })
  }

  let content: HTMLElement

  $: if (value !== undefined) {
    reviewee = $personAccountByIdStore.get(value.reviewee)
    person = reviewee !== undefined ? $personAccountPersonByIdStore.get(reviewee?.person) : undefined
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
    isHeader={false}
    useMaxWidth={true}
    {withoutInput}
    bind:content
    on:close={() => { dispatch('close') }}
  >
    <svelte:fragment slot="title">
      <ViewletSelector
        bind:viewlet
        viewletQuery={{ attachTo: performance.mixin.WithKRA }}
      />
      <ViewletSettingButton bind:viewOptions bind:viewlet />
      <div class="title not-active">{person?.name}'s {reviewSession?.name} Report</div>
    </svelte:fragment>
    {#if viewlet !== undefined && viewOptions}
      <ViewletContentView
        _class={performance.mixin.WithKRA}
        space={undefined}
        {viewlet}
        {viewOptions}
        query={{
          _id: {
            $in: value.tasks
          }
        }}
      />
    {/if}
  </Panel>
{/if}
