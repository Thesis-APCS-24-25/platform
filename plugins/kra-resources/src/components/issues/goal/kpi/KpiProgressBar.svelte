<script lang="ts">
  export let value: number
  export let additionalValue: number = 0
  export let min: number = 0 // Note: min isn't used in percentage calculation directly here, assuming value >= 0
  export let max: number = 100

  // Ensure max is valid and avoid division by zero. Use 1 if max <= 0.
  // Also, handle the case where max might be less than min, although usually max > min.
  const effectiveMax = Math.max(min, max) <= min ? 1 : Math.max(min, max) // Ensure max is greater than min, default to 1 if not
  const range = effectiveMax - min

  // Calculate the percentage for the main value, clamped between 0 and 100.
  // This determines the width of the top layer (.progress-bar).
  $: progress = Math.max(
    0,
    Math.min(range <= 0 ? 0 : ((value - min) / range) * 100, 100)
  )

  // Calculate the *total* progress percentage including the additional value, clamped between 0 and 100.
  // This determines the width of the *background* layer (.additional-progress).
  // Because .progress-bar (z-index: 1) sits on top of .additional-progress (z-index: 0),
  // this setup visually shows the 'value' portion in the .progress-bar color
  // and the 'additionalValue' portion in the .additional-progress color.
  $: additionalProgress = Math.max(
    0,
    Math.min(range <= 0 ? 0 : ((value + additionalValue - min) / range) * 100, 100)
  )

  // --- Alternative Interpretation ---
  // If you wanted additionalProgress to represent *only* the width of the additional segment,
  // you would calculate it differently and need to adjust the HTML/CSS significantly
  // (e.g., positioning the additional segment *after* the main segment).
  // $: additionalSegmentWidth = Math.max(0, Math.min(range <= 0 ? 0 : (additionalValue / range) * 100, 100));
</script>

<div class="progress-bar-container">
  <div
    class="additional-progress"
    style="width: {additionalProgress}%"
    aria-hidden="true"
  ></div>

  <div
    class="progress-bar"
    style="width: {progress}%"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-label="Progress"
  ></div>

  </div>

<style>
  .progress-bar-container {
    width: 100%;
    /* Added fallback colors */
    background-color: var(--primary-button-disabled, #e9ecef);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    height: 12px;
  }

  .progress-bar,
  .additional-progress {
    height: 100%;
    position: absolute; /* Both need to be absolute for z-index stacking */
    top: 0;
    left: 0;
    transition: width 0.3s ease-in-out;
  }

  .progress-bar {
    /* Added fallback color */
    background-color: var(--primary-button-default, #007bff);
    /* Sits on top */
    z-index: 1;
  }

  .additional-progress {
    /* Added fallback color */
    background-color: var(--primary-button-pressed, #6c757d); /* Changed color slightly for better default contrast */
    /* Sits behind */
    z-index: 0;
  }
</style>
