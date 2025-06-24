<script lang="ts">
  import { PersonRefPresenter } from '@hcengineering/contact-resources'
  import performance, { ProgressReport } from '@hcengineering/performance'
  import { DatePresenter, Label, showPopup, tooltip } from '@hcengineering/ui'
  import ReportNotePopup from './ReportNotePopup.svelte'
  import { ProgressReportEditPopup, KpiReportEditPopup } from '@hcengineering/performance-resources'

  export let reports: ProgressReport[] = []
  $: reports = reports.sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

  $: accumulatedProgress = reports.reduce((acc, report) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0
    acc.push(lastValue + report.value)
    return acc
  }, new Array<number>())
</script>

<div class="grid-container">
  <div class="grid-item">
    <Label label={performance.string.Reports} />
  </div>
  <div class="grid-item">
    <div class="grid-item bar-container total">
      <div class="bar" style:width="{accumulatedProgress.at(-1)}%" />
    </div>
  </div>
  {#each reports as report, i}
    <div class="grid-item">
      <div class="flex-row-center">
        <PersonRefPresenter value={report.reportBy} shouldShowName={false} />
        <DatePresenter value={report.date} />
      </div>
    </div>
    <div class="grid-item bar-container">
      <button
        class="bar flex-row-center justify-center"
        style:width="{report.value}%"
        style:left="{accumulatedProgress[i] - report.value}%"
        use:tooltip={{
          component: ReportNotePopup,
          props: { value: report }
        }}
        on:click|stopPropagation={() => {
          showPopup(ProgressReportEditPopup, {
            value: report
          })
        }}
      >
        <span class="font-regular-11">{report.value}</span>
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .grid-container {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) 5fr;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  .grid-item {
    display: flex;
    align-items: center;
  }

  .bar-container {
    width: 100%;
    height: 1rem;
    background-color: transparent;
    border-radius: 0.25rem;

    &.total {
      background-color: var(--primary-button-disabled);
    }
  }

  .bar {
    height: 100%;
    background-color: var(--primary-button-default);
    border-radius: 0.25rem;
    position: relative;
  }
</style>
