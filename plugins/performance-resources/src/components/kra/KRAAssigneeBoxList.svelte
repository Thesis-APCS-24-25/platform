<script lang="ts">
  import contact, { Person } from '@hcengineering/contact'
  import type { Class, Doc, DocData, Ref, Space } from '@hcengineering/core'
  import { type IntlString } from '@hcengineering/platform'
  import { ObjectCreate, createQuery, getClient } from '@hcengineering/presentation'
  import type { ButtonKind, ButtonSize, TooltipAlignment } from '@hcengineering/ui'
  import { Button, Label, showPopup, IconScale, eventToHTMLElement } from '@hcengineering/ui'
  import { UserInfo, CombineAvatars, personByIdStore } from '@hcengineering/contact-resources'
  import KraAssigneesPopup from './KRAAssigneesPopup.svelte'
  import performance from '../../plugin'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import kraTeam, { Member } from '@hcengineering/kra-team'
  import { assignKRA, unassignKRA, updateWeight } from '../../utils/kra-assign'

  export let items: Array<EmployeeKRA | DocData<EmployeeKRA>> = []
  export let space: Ref<Space>
  export let kra: Ref<KRA>
  export let _class: Ref<Class<Person>> = kraTeam.mixin.Member

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

  let beforeUpdateItems: Array<EmployeeKRA | DocData<EmployeeKRA>> = []

  const itemQ = createQuery()
  itemQ.query(
    performance.class.EmployeeKRA,
    {
      kra
    },
    (res) => {
      if (res !== undefined) {
        items = res
        beforeUpdateItems = res
      }
    }
  )

  $: persons = items.map((item) => $personByIdStore.get(item.assignee)).filter((it) => it !== undefined) as Person[]

  async function saveKRAAssignment (
    add: DocData<EmployeeKRA>[],
    remove: EmployeeKRA[],
    update: EmployeeKRA[]
  ): Promise<void> {
    const client = getClient()
    const ops = client.apply()
    for (const item of add) {
      await assignKRA(ops, space as Ref<ReviewSession>, kra, item.weight, item.assignee)
    }
    for (const item of remove) {
      await unassignKRA(ops, space as Ref<ReviewSession>, item._id, kra)
    }

    for (const item of update) {
      await updateWeight(ops, item.space as Ref<ReviewSession>, item._id, item.kra, item.weight)
    }
    await ops.commit()
  }

  async function addPerson (evt: MouseEvent): Promise<void> {
    const accounts = new Set(
      getClient()
        .getModel()
        .findAllSync(contact.class.PersonAccount, {})
        .map((p) => p.person)
    )
    const popupProps: any = {
      items,
      filter: (it: Doc) => {
        const h = getClient().getHierarchy()
        if (h.hasMixin(it, contact.mixin.Employee)) {
          const isActive = h.as(it, contact.mixin.Employee).active
          const isSelected = items.some((selectedItem) => selectedItem.assignee === it._id)
          return isActive || isSelected
        }
        return accounts.has(it._id as Ref<Person>)
      },
      readonly,
      kra,
      create
    }
    if (sort !== undefined) {
      popupProps.sort = sort
    }
    showPopup(
      KraAssigneesPopup,
      popupProps,
      eventToHTMLElement(evt),
      async () => {
        // diffing with the old value
        const mapped = items.reduce((acc, { assignee, weight }) => {
          acc.set(assignee, weight)
          return acc
        }, new Map<Ref<Member>, number>())
        const mappedBefore = beforeUpdateItems.reduce((acc, { assignee, weight }) => {
          acc.set(assignee, weight)
          return acc
        }, new Map<Ref<Member>, number>())
        const added = items.filter(({ assignee }) => !mappedBefore.has(assignee))
        const removed = beforeUpdateItems.filter(({ assignee }) => !mapped.has(assignee)).map((s) => s as EmployeeKRA)
        const changed = items
          .filter(({ assignee, weight }) => {
            const beforeWeight = mappedBefore.get(assignee)
            return beforeWeight !== undefined && beforeWeight !== weight
          })
          .map((s) => s as EmployeeKRA)
        beforeUpdateItems = items

        await saveKRAAssignment(added, removed, changed)
      },
      (result) => {
        if (result != null) {
          items = result
        }
      }
    )
  }
</script>

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
          <CombineAvatars {_class} items={persons.map((p) => p._id)} size={'card'} hideLimit />
          <span class="overflow-label ml-1-5">
            <Label label={contact.string.NumberMembers} params={{ count: persons.length }} />
          </span>
        {/if}
      </div>
    {/if}
  </svelte:fragment>
</Button>
