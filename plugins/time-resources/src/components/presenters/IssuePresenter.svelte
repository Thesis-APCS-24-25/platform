<script lang="ts">
  import { Issue } from '@hcengineering/kra'
  import { DocReferencePresenter } from '@hcengineering/view-resources'

  export let value: Issue
</script>

<DocReferencePresenter {value} on:click>
  <slot />
</DocReferencePresenter>
