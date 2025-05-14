<script lang="ts">
  import performance, { PerformanceReport, ReviewSession } from '@hcengineering/performance'
  import { ViewletContentView, ViewletSettingButton } from '@hcengineering/view-resources'
  // import { DatePresenter, ListView } from '@hcengineering/ui'
  import { personAccountByIdStore, personAccountPersonByIdStore } from '@hcengineering/contact-resources'
  import { Class, Ref, WithLookup } from '@hcengineering/core'
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { getClient } from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'
  import { Panel } from '@hcengineering/ui'
  import { Viewlet, ViewOptions } from '@hcengineering/view'
  import ViewletSelector from '@hcengineering/view-resources/src/components/ViewletSelector.svelte'

  const client = getClient()
  const dispatch = createEventDispatcher()

  export let _id: Ref<PerformanceReport>
  export let _class: Ref<Class<PerformanceReport>>

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

  $: if (value !== undefined) {
    reviewee = $personAccountByIdStore.get(value.reviewee)
    person = reviewee !== undefined ? $personAccountPersonByIdStore.get(reviewee?.person) : undefined
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if value !== undefined}
  <Panel
    allowClose={false}
    selectedAside={false}
    on:close={() => { dispatch('close') }}
  >
    <svelte:fragment slot="beforeTitle">
      <ViewletSelector
        bind:viewlet
        viewletQuery={{ attachTo: performance.mixin.WithKRA }}
      />
      <ViewletSettingButton bind:viewOptions bind:viewlet />
    </svelte:fragment>
    <svelte:fragment slot="title">
      <div class="title not-active">{person?.name}'s {reviewSession?.name} Report</div>
    </svelte:fragment>
    <!-- <ListView count={tasks.length} addClass={'step-tb-2-accent'}>
      <svelte:fragment slot="item" let:item>
        {@const task = tasks[item]}
        <div
          class="{'flex-between'} p-text-2 clear-mins"
          on:contextmenu={(ev) => {
            showMenu(ev, { object: task })
          }}
          on:mouseenter={() => {
            listProvider.updateFocus(task)
          }}
          on:focus={() => {
            listProvider.updateFocus(task)
          }}
        >
          <div class="flex-row-center clear-mins gap-2 flex-grow mr-4">
            <FixedColumn key={'report_issue'} justify={'left'} addClass={'fs-bold'}>
              {#if task.identifier}
                {task.identifier}
              {/if}
            </FixedColumn>
          </div>
          <div class="flex-row-center clear-mins gap-2 self-end flex-no-shrink">
            <FixedColumn key={'report_assignee'} justify={'left'}>
              <UserBox
                width={'100%'}
                kind={'ghost'}
                label={performance.string.Assignee}
                _class={contact.mixin.Employee}
                value={task.assignee}
                readonly
                showNavigate={false}
              />
            </FixedColumn>
            <FixedColumn key={'report_date'} justify={'left'}>
              <DatePresenter value={task.dueDate} kind={'ghost'} size={'small'} />
            </FixedColumn>
          </div>
        </div>
      </svelte:fragment>
    </ListView> -->
    {#if viewlet !== undefined && viewOptions}
      <ViewletContentView
        _class={performance.mixin.WithKRA}
        space={undefined}
        {viewlet}
        {viewOptions}
        query={{
          assignee: person?._id
        }}
      />
    {/if}
  </Panel>
{/if}
