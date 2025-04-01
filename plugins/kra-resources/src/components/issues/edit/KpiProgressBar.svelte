<script lang="ts">
  export let value: number
  export let target: number
  export let additionalValue: number = 0

  // Calculate progress percentages
  $: progress = Math.min((value / target) * 100, 100)
  $: additionalProgress = Math.min(((value + additionalValue) / target) * 100, 100)
</script>

<style>
  .progress-bar-container {
    width: 100%;
    background-color: var(--primary-button-disabled);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    height: 12px;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--primary-button-default);
    position: absolute;
    top: 0;
    left: 0;
    transition: width 0.3s ease-in-out;
    z-index: 1;
  }

  .additional-progress {
    z-index: 0;
    height: 100%;
    background-color: var(--primary-button-pressed);
    transition: width 0.3s ease-in-out;
  }
</style>

<div class="progress-bar-container">
  <div class="progress-bar" style="width: {progress}%"></div>
  <div class="additional-progress" style="width: {additionalProgress}%"></div>
</div>
