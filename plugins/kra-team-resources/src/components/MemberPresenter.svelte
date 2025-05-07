<script lang="ts">
  import { Member } from '@hcengineering/kra-team'
  import { getClient } from '@hcengineering/presentation'
  import contact from '@hcengineering/contact'
  export let value: Member | undefined

  const client = getClient()
  const person = client.findOne(contact.class.Person, { _id: value?.person })
</script>

{#await person then p}
  {p?.name}
{/await}
