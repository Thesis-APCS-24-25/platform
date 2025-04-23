<script lang="ts">
  import contact, { Person } from '@hcengineering/contact'
  import type { Class, Doc, DocumentQuery, Ref } from '@hcengineering/core'
  import { type IntlString } from '@hcengineering/platform'
  import { ObjectCreate, getClient } from '@hcengineering/presentation'
  import type { ButtonKind, ButtonSize, TooltipAlignment } from '@hcengineering/ui'
  import { Button, Label, showPopup, IconScale } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import { UserInfo, CombineAvatars, personByIdStore } from '@hcengineering/contact-resources'
  import KraAssigneesPopup from './KRAAssigneesPopup.svelte'
  import { KRAAssigneeItem } from '../../types'

  export let items: KRAAssigneeItem[] = []
  export let _class: Ref<Class<Person>> = contact.mixin.Employee
  export let docQuery: DocumentQuery<Person> | undefined = {}

  export let label: IntlString | undefined = undefined
  export let kind: ButtonKind = 'no-border'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = undefined
  export let labelDirection: TooltipAlignment | undefined = undefined
  export let emptyLabel: IntlString = contact.string.Members
  export let readonly: boolean = false
  export let create: ObjectCreate | undefined = undefined

  export let sort: ((a: Person, b: Person) => number) | undefined = undefined

  let beforeUpdateItems: KRAAssigneeItem[] = items

  function filter (items: KRAAssigneeItem[] | undefined): KRAAssigneeItem[] {
    return (items ?? []).filter((it, idx, arr) => arr.indexOf(it) === idx)
  }

  let persons: Person[] = filter(items)
    .map((p) => $personByIdStore.get(p.assignTo))
    .filter((p) => p !== undefined) as Person[]
  $: persons = filter(items)
    .map((p) => $personByIdStore.get(p.assignTo))
    .filter((p) => p !== undefined) as Person[]

  const dispatch = createEventDispatcher()

  async function addPerson (evt: Event): Promise<void> {
    const accounts = new Set(
      getClient()
        .getModel()
        .findAllSync(contact.class.PersonAccount, {})
        .map((p) => p.person)
    )
    const popupProps: any = {
      selected: filter(items),
      filter: (it: Doc) => {
        const h = getClient().getHierarchy()
        if (h.hasMixin(it, contact.mixin.Employee)) {
          const isActive = h.as(it, contact.mixin.Employee).active
          const isSelected = items.some((selectedItem) => selectedItem.assignTo === it._id)
          return isActive || isSelected
        }
        return accounts.has(it._id as Ref<Person>)
      },
      readonly,
      create
    }
    if (sort !== undefined) {
      popupProps.sort = sort
    }
    showPopup(KraAssigneesPopup, popupProps, evt.target as HTMLElement, () => {
      // diffing with the old value
      const mapped = items.reduce((acc, { assignTo, weight }) => {
        acc.set(assignTo, weight)
        return acc
      }, new Map<Ref<Person>, number>())
      const mappedBefore = beforeUpdateItems.reduce((acc, { assignTo, weight }) => {
        acc.set(assignTo, weight)
        return acc
      }, new Map<Ref<Person>, number>())
      const added = items.filter(({ assignTo }) => !mappedBefore.has(assignTo))
      const removed = beforeUpdateItems.filter(({ assignTo }) => !mapped.has(assignTo))
      const changed = items.filter(({ assignTo, weight }) => {
        const beforeWeight = mappedBefore.get(assignTo)
        return beforeWeight !== undefined && beforeWeight !== weight
      })
      beforeUpdateItems = items
      // TODO: Actually save the changes
      alert('Implement me')
    }, (result) => {
      if (result != null) {
        items = filter(result)
        console.log('items', result)
      }
    })
  }
</script>

<!-- TODO: Add proper icon -->
<Button
  icon={persons.length === 0 ? IconScale : undefined}
  label={persons.length === 0 ? emptyLabel : undefined}
  notSelected={persons.length === 0}
  width={width ?? 'min-content'}
  {kind}
  {size}
  {justify}
  disabled={readonly}
  showTooltip={label !== undefined ? { label, direction: labelDirection } : undefined}
  on:click={addPerson}
>
  <svelte:fragment slot="content">
    {#if persons.length > 0}
      <div class="flex-row-center flex-nowrap pointer-events-none">
        {#if persons.length === 1}
          <UserInfo value={persons[0]} size={'card'} />
        {:else}
          <CombineAvatars {_class} items={items.map((person) => person.employee)} size={'card'} hideLimit />
          <span class="overflow-label ml-1-5">
            <Label label={contact.string.NumberMembers} params={{ count: persons.length }} />
          </span>
        {/if}
      </div>
    {/if}
  </svelte:fragment>
</Button>
