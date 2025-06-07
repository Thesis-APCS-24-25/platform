<script lang="ts">
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { personAccountByIdStore, personByIdStore, UserInfo } from '@hcengineering/contact-resources'
  import { Ref, WithLookup } from '@hcengineering/core'
  import { PerformanceReview } from '@hcengineering/performance'
  import { MarkupPresenter } from '@hcengineering/view-resources'

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

    <div class="review-box flex-col items-stretch">
      <div class="value">
        <span class="value-value">{value.score}</span>
        <span class="value-target">/100</span>
      </div>
      <!-- <KpiProgressBar value={sum ?? 0} max={review.target} /> -->
    </div>
  </div>
{/if}

<style>
  .value {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .right-divider {
    margin-right: 1rem;
  }

  .content {
    flex-grow: 3;
  }

  .value-value {
    color: var(--theme-primary-color, #4c6ef5);
  }

  .review-box {
    flex-grow: 1;
    border: 1px solid transparent;
    padding: 0.25rem;
    border-radius: 0.25rem;
    gap: 0.5rem;
    min-width: 10rem;
    color: var(--theme-content-color, #333);
  }
</style>
