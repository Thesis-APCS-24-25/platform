<script lang="ts">
  import contact, { Person } from '@hcengineering/contact'
  import type { Class, DocData, Ref, WithLookup } from '@hcengineering/core'
  import { type IntlString } from '@hcengineering/platform'
  import { createQuery } from '@hcengineering/presentation'
  import type { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { Label, tooltip } from '@hcengineering/ui'
  import { UserInfo, CombineAvatars, personByIdStore } from '@hcengineering/contact-resources'
  import performance from '../../plugin'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'
  import kraTeam from '@hcengineering/kra-team'

  export let value: WithLookup<KRA>
  export let _class: Ref<Class<Person>> = kraTeam.mixin.Member

  export let kind: ButtonKind = 'regular'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = undefined
  export let emptyLabel: IntlString = kraTeam.string.NoMembers

  let items: Array<EmployeeKRA | DocData<EmployeeKRA>> = []

  const itemQ = createQuery()
  itemQ.query(
    performance.class.EmployeeKRA,
    {
      kra: value._id
    },
    (res) => {
      if (res !== undefined) {
        items = res
      }
    }
  )

  function filter (items: (Ref<Person> | undefined)[] | undefined): Ref<Person>[] {
    return (items ?? []).filter((it, idx, arr) => it !== undefined && arr.indexOf(it) === idx) as Ref<Person>[]
  }

  $: persons = filter(items.map((i) => i.assignee))
    .map((p) => $personByIdStore.get(p))
    .filter((p) => p !== undefined)
    .map((p) => p as Person)
</script>

<div
  class="container {size} {kind} sh-round p-2"
  style="width: fit-content"
  class:justify
  class:width
  use:tooltip={{
    label: contact.string.Members
  }}
>
  {#if persons.length > 0}
    <div class="flex-row-center flex-nowrap pointer-events-none">
      {#if persons.length === 1}
        <UserInfo value={persons[0]} size={'card'} />
      {:else}
        <CombineAvatars {_class} items={persons.map((p) => p._id)} size={'card'} hideLimit />
        <span class="overflow-label ml-1-5">
          <Label label={contact.string.NumberMembers} params={{ count: persons.length }} />
        </span>
      {/if}
    </div>
  {:else}
    <span class="overflow-label ml-1-5">
      <Label label={emptyLabel} />
    </span>
  {/if}
</div>

<style lang="scss">
  .container {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    gap: var(--spacing-1);
    border: 1px solid var(--button-secondary-BorderColor);
    border-radius: var(--medium-BorderRadius);
    background-color: var(--button-secondary-BackgroundColor);
  }
</style>
