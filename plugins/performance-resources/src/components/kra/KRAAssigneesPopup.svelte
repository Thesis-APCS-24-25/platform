<script lang="ts">
  import { ObjectPopup } from '@hcengineering/presentation'
  import { Person } from '@hcengineering/contact'
  import { DocData } from '@hcengineering/core'
  import { UserInfo, personAccountByPersonId } from '@hcengineering/contact-resources'
  import { EmployeeKRA } from '@hcengineering/performance'
  import { createEventDispatcher } from 'svelte'
  import kraTeam from '@hcengineering/kra-team'

  export let items: Array<DocData<EmployeeKRA> | EmployeeKRA> = []
  const ignoreObjects = items.map((s) => s.assignee)
  const dispatch = createEventDispatcher()
  function close (event: CustomEvent<Person>): void {
    const items = [event.detail]
    const accounts = items
      .map((item) => $personAccountByPersonId.get(item._id))
      .map((ps) => ps?.[0]._id)
      .filter((s) => s !== undefined)
    dispatch('close', accounts)
  }
</script>

<ObjectPopup
  size="large"
  _class={kraTeam.mixin.Member}
  closeAfterSelect
  shadows={false}
  allowDeselect
  {ignoreObjects}
  width="full"
  type={'object'}
  on:close={close}
>
  <div class="items-center flex-between flex-grow flex-gap-2" slot="item" let:item={person}>
    <UserInfo value={person} size={'smaller'} />
  </div>
</ObjectPopup>
