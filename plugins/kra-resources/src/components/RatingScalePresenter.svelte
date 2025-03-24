<script lang="ts">
  import { ButtonSize, IconColStar } from '@hcengineering/ui'

  export let maxValue: number = 5
  export let value: number = 0
  export let shouldRender: boolean = true
  export let size: ButtonSize = 'medium'
  export let width: string | undefined = 'auto'
</script>

{#if shouldRender}
  <div class="clear-mins" style:width>
    <div class="antiButton {size} sh-no-shape bs-solid">
      {#each Array(maxValue) as _, index}
        <div class="flex items-center justify-center" style:width>
          <IconColStar size={'small'} fill={index < (value ?? 0) ? 'currentColor' : 'none'} />
        </div>
      {/each}
    </div>
  </div>
{/if}
