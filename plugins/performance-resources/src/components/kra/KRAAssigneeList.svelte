<script lang="ts">
  import { ListView } from '@hcengineering/ui'

  export let items: any[] = []
</script>

<ListView count={items.length} {items} />
