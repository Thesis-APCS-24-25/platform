<script lang="ts">
  export let value: number | undefined = undefined
  export let readonly = false

  let _score = value
</script>

<div class="score">
  <div class="flex-row-center flex-gap-1">
    <input datatype="number" class="score-input" bind:value={_score} disabled={!editting} />
    <span class="score-postfix">/100</span>
  </div>
</div>
