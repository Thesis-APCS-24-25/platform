<script lang="ts">
  import { PersonAccount } from '@hcengineering/contact'
  import { personAccountByPersonId } from '@hcengineering/contact-resources'
  import { DocumentQuery, Ref, WithLookup } from '@hcengineering/core'
  import { Issue } from '@hcengineering/kra'
  import performance, { KRA } from '@hcengineering/performance'
  import { getClient } from '@hcengineering/presentation'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { FixedColumn, ObjectBox } from '@hcengineering/view-resources'

  export let value: WithLookup<Issue>
  export let readonly = false
  export let kind: ButtonKind = 'link'
  export let size: ButtonSize = 'large'
  export let width: string | undefined = undefined

  const client = getClient()

  async function handleChange (ev: CustomEvent<Ref<KRA>>): Promise<void> {
    await client.update(value, { kra: ev.detail })
  }

  let kraDocQuery: DocumentQuery<KRA> = { _id: { $in: [performance.ids.NoKRARef] } }

  const personAccount = value.assignee != null
    ? ($personAccountByPersonId.get(value.assignee) ?? [{ _id: '' as Ref<PersonAccount> }])[0]._id
    : '' as Ref<PersonAccount>

  void client.findAll(
    performance.class.EmployeeKRA,
    {
      employee: personAccount
    }
  ).then((result) => {
    console.log(result)
    if (result !== undefined && result.length > 0) {
      const krasOfAssignee: Ref<KRA>[] | undefined = result.map(it => it.kra)
      kraDocQuery = {
        _id: { $in: krasOfAssignee }
      }
    } else {
      kraDocQuery = { _id: { $in: [performance.ids.NoKRARef] } }
    }
  })
</script>

{#if kind === 'list'}
  <FixedColumn key="kra-editor">
    <ObjectBox
      _class={performance.class.KRA}
      searchField={'title'}
      label={performance.string.NoKRA}
      value={value.kra}
      {readonly}
      {kind}
      {size}
      {width}
      allowDeselect
      showNavigate={false}
      docQuery={kraDocQuery}
      on:change={handleChange}
    />
  </FixedColumn>
{:else}
  <ObjectBox
    _class={performance.class.KRA}
    searchField={'title'}
    label={performance.string.NoKRA}
    value={value.kra}
    {readonly}
    {kind}
    {size}
    {width}
    allowDeselect
    docQuery={kraDocQuery}
    on:change={handleChange}
  />
{/if}
