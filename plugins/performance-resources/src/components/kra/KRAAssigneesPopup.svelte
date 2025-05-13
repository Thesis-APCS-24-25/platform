<script lang="ts">
  import { ObjectPopup } from '@hcengineering/presentation'
  import contact, { Person } from '@hcengineering/contact'
  import performance from '../../plugin'
  import { DocData, Ref } from '@hcengineering/core'
  import { UserInfo, personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'
  import { createEventDispatcher } from 'svelte'
  import KraWeightEditor from './KRAWeightEditorWithPopup.svelte'
  import { EmployeeKRA, KRA } from '@hcengineering/performance'

  export let items: Array<DocData<EmployeeKRA> | EmployeeKRA> = []
  export let kra: Ref<KRA>

  const mapItem = (
    items: Array<DocData<EmployeeKRA> | EmployeeKRA>
  ): Map<Ref<Person>, DocData<EmployeeKRA> | EmployeeKRA> => {
    return items.reduce<Map<Ref<Person>, DocData<EmployeeKRA> | EmployeeKRA>>((acc, item) => {
      const personId = $personIdByAccountId.get(item.employee)
      if (personId !== undefined) acc.set(personId, item)
      return acc
    }, new Map<Ref<Person>, DocData<EmployeeKRA> | EmployeeKRA>())
  }

  $: mappedItems = mapItem(items)

  const dispatch = createEventDispatcher()

  function handleObjectPopupUpdate (e: CustomEvent<Ref<Person>[]>): void {
    const newSelected = e.detail
      .filter((item) => item !== undefined)

    items = newSelected.map((person) => {
      const personAccounts = $personAccountByPersonId.get(person) ?? []
      return {
        ...(mappedItems.get(person) ?? {
          employee: personAccounts[0]._id,
          weight: 0,
          kra
        })
      }
    })
    dispatch('update', items)
  }

  function getId (personId: Ref<Person>): Ref<EmployeeKRA> | undefined {
    const item = mappedItems.get(personId)
    if (item !== undefined && '_id' in item) {
      return item._id
    }
    return undefined
  }
</script>

<ObjectPopup
  _class={contact.class.Person}
  multiSelect
  shadows={false}
  allowDeselect
  selectedObjects={items.map((s) => $personIdByAccountId.get(s.employee)).filter((s) => s !== undefined)}
  width="full"
  type={'object'}
  on:update={handleObjectPopupUpdate}
  on:close
>
  <div class="items-center flex-between flex-grow flex-gap-2" slot="item" let:item={person}>
    <UserInfo value={person} size={'smaller'} />
    {#if mappedItems.has(person._id)}
      <KraWeightEditor
        _id={getId(person._id)}
        employee={mappedItems.get(person._id)?.employee}
        kind="link"
        size="x-small"
        placeholder={performance.string.Weight}
        value={mappedItems.get(person._id)?.weight}
        onChange={(e) => {
          const weight = e
          if (weight === undefined) {
            return
          }
          items = items.map((s) => {
            const p = $personIdByAccountId.get(s.employee)
            if (p === person._id) {
              return { ...s, weight }
            }
            return s
          })
          dispatch('update', items)
        }}
      />
    {/if}
  </div>
</ObjectPopup>
