<script lang="ts">
  import { DocumentQuery, Ref } from '@hcengineering/core'
  import { KRA } from '@hcengineering/performance'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { FixedColumn, ObjectBox } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import { PersonAccount } from '@hcengineering/contact'
  import { personAccountByPersonId } from '@hcengineering/contact-resources'
  import { getClient } from '@hcengineering/presentation'
  import { Task } from '@hcengineering/task'

  const client = getClient()

  export let value: Ref<KRA>
  export let onChange: ((ref: Ref<KRA>) => void | Promise<void>) | undefined
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let width: string | undefined = undefined
  export let object: Task

  async function handleChange (ev: CustomEvent<Ref<KRA>>): Promise<void> {
    if (onChange !== undefined) {
      await onChange(ev.detail)
    }
  }

  let kraDocQuery: DocumentQuery<KRA> = { _id: { $in: [performance.ids.NoKRARef] } }

  $: personAccount = object.assignee != null
    ? ($personAccountByPersonId.get(object.assignee) ?? [{ _id: '' as Ref<PersonAccount> }])[0]._id
    : '' as Ref<PersonAccount>

  $: void client.findAll(
    performance.class.EmployeeKRA,
    {
      employee: personAccount
    }
  ).then((result) => {
    console.log(result)
    if (result !== undefined && result.length > 0) {
      const krasOfAssignee: Ref<KRA>[] | undefined = result.map(it => it.kra)
      if (!krasOfAssignee.includes(value)) {
        if (onChange !== undefined) {
          void onChange('' as Ref<KRA>)
        }
      }
      kraDocQuery = {
        _id: { $in: krasOfAssignee }
      }
    } else {
      if (onChange !== undefined) {
        void onChange('' as Ref<KRA>)
      }
      kraDocQuery = { _id: { $in: [performance.ids.NoKRARef] } }
    }
  })
</script>

{#if kind === 'list'}
  <FixedColumn key="kra-editor" addClass="m-2">
    <ObjectBox
      _class={performance.class.KRA}
      searchField={'title'}
      label={performance.string.NoKRA}
      {value}
      {readonly}
      {kind}
      {size}
      {width}
      allowDeselect
      docQuery={kraDocQuery}
      showNavigate={false}
      on:change={handleChange}
      />
  </FixedColumn>
{:else}
  <ObjectBox
    _class={performance.class.KRA}
    searchField={'title'}
    label={performance.string.NoKRA}
    {value}
    {readonly}
    {kind}
    {size}
    {width}
    docQuery={kraDocQuery}
    allowDeselect
    on:change={handleChange}
  />
{/if}
