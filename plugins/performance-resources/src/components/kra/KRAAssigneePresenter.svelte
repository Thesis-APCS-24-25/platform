<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { Employee } from '@hcengineering/contact'
  import { EmployeePresenter } from '@hcengineering/contact-resources'

  export let object:
  | {
    employee: Ref<Employee>
    weight: number
  }
  | undefined = undefined
  export let compact: boolean = false
</script>

<div class="inline-flex items-center clear-mins" class:w-full={!compact}>
  <EmployeePresenter value={object?.employee} />
  {#if object?.weight}
    <span class="weight">
      {object.weight}
    </span>
  {/if}
</div>
