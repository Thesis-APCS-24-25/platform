<script lang="ts">
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { personAccountByIdStore, personByIdStore, UserInfo } from '@hcengineering/contact-resources'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { PerformanceReview } from '@hcengineering/performance'
  import { MarkupPresenter } from '@hcengineering/view-resources'
  import ScorePresenter from './ScorePresenter.svelte'

  export let value: WithLookup<PerformanceReview>

  const personRef: Ref<Person> | undefined = value.createdBy !== undefined
    ? $personAccountByIdStore.get(value.createdBy as Ref<PersonAccount>)?.person
    : undefined
  const person: Person | undefined = personRef !== undefined
    ? $personByIdStore.get(personRef)
    : undefined
</script>

{#if value}
  <div class="flex-row-center p-4 gap-4 justify-between">
    <div class="content flex-row-center items-center">
      <div class="fs-title right-divider">
        {#if person}
          <UserInfo
            value={person}
            size={'small'}
          />
        {/if}
      </div>
      <div class="review-box flex-col">
        <MarkupPresenter
          value={value.content}
        />
      </div>
    </div>

    <ScorePresenter value={value.score}/>
  </div>
{/if}

<style>
  .right-divider {
    margin-right: 1rem;
  }

  .content {
    flex-grow: 3;
  }
</style>
