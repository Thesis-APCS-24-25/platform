<script lang="ts">
  import { Card, ObjectPopup } from '@hcengineering/presentation'
  import contact, { Person } from '@hcengineering/contact'
  import performance from '../../plugin'
  import { Ref } from '@hcengineering/core'
  import { UserInfo } from '@hcengineering/contact-resources'
  import { createEventDispatcher } from 'svelte'
  import KraWeightEditor from './KRAWeightEditorWithPopup.svelte'
  import { PopupOptions } from '@hcengineering/ui'
  import { ObjectSearchBox } from '@hcengineering/view-resources'

  export let selected: {
    employee: Ref<Person>
    weight: number
  }[] = []

  $: mappedWeights = (selected ?? []).reduce((acc, { employee, weight }) => {
    acc.set(employee, weight)
    return acc
  }, new Map<Ref<Person>, number>())

  const dispatch = createEventDispatcher()

  function handleObjectPopupUpdate (e: CustomEvent<Ref<Person>[]>): void {
    const newSelected = e.detail
    selected = newSelected.map((person) => {
      return {
        employee: person,
        weight: mappedWeights.get(person) ?? 0
      }
    })
    dispatch('update', selected)
  }
</script>

<ObjectPopup
  _class={contact.class.Person}
  multiSelect
  allowDeselect
  selectedObjects={selected.map((s) => s.employee)}
  width="full"
  type={'object'}
  on:update={handleObjectPopupUpdate}
  on:close
>
  <div class="items-center flex-between flex-grow flex-gap-2" slot="item" let:item={person}>
    <UserInfo value={person} size={'smaller'} />
    {#if mappedWeights.has(person._id)}
      <KraWeightEditor
        kind="link"
        size="x-small"
        placeholder={performance.string.Weight}
        value={mappedWeights.get(person._id)}
        onChange={(e) => {
          const weight = e
          if (weight === undefined) {
            return
          }
          const n = selected.map((s) => {
            if (s.employee === person._id) {
              return { ...s, weight }
            }
            return s
          })
          selected = n
          dispatch('update', selected)
        }}
      />
    {/if}
  </div>
  >
</ObjectPopup>
