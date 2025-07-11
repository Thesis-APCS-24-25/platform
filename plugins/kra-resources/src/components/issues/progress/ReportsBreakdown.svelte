<script lang="ts">
  import { PersonRefPresenter } from '@hcengineering/contact-resources'
  import performance, { Progress, ProgressReport } from '@hcengineering/performance'
  import { DatePresenter, Label, Scroller, showPopup, tooltip } from '@hcengineering/ui'
  import ReportNotePopup from './ReportNotePopup.svelte'
  import { ProgressReportEditPopup } from '@hcengineering/performance-resources'
  import { Class, Ref } from '@hcengineering/core'

  export let _class: Ref<Class<Progress>> = performance.class.Progress
  export let reports: ProgressReport[] = []
  export let target: number = 100
  $: reports = reports.sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

  $: accumulatedProgress = reports.reduce((acc, report) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0
    acc.push(lastValue + report.value)
    return acc
  }, new Array<number>())

  const elems: HTMLElement[] = new Array(reports.length)
  let valueInsideBars = new Array<boolean>(reports.length).fill(false)

  const valueInsideBar = (elem: HTMLElement | null): boolean => {
    if (elem == null) return false
    const width = elem.offsetWidth
    const textWidth = elem.firstChild != null
      ? (elem.firstChild as HTMLElement).offsetWidth
      : 0
    return width > textWidth + 20 // 10px padding
  }

  $: valueInsideBars = elems.map((elem) => valueInsideBar(elem))
</script>

<div>
  <div class="grid-container">
    <div class="grid-item">
      <Label label={performance.string.Reports} />
    </div>
    <div class="grid-item">
      <div class="grid-item bar-container total">
        <div class="bar" style:width="{((accumulatedProgress.at(-1) ?? 0) / target) * 100}%" />
      </div>
    </div>
  </div>
  <Scroller maxHeight={20}>
    <div class="grid-container">
      {#each reports as report, i}
        {@const percent = (report.value / target) * 100}
        <div class="grid-item">
          <div class="flex-row-center">
            <PersonRefPresenter value={report.reportBy} shouldShowName={false} />
            <DatePresenter value={report.date} />
          </div>
        </div>
        <div class="grid-item bar-container">
          <button
            bind:this={elems[i]}
            class="bar flex-row-center justify-center"
            style:width="{percent}%"
            style:left="{((accumulatedProgress[i] - report.value) / target) * 100}%"
            use:tooltip={{
              component: ReportNotePopup,
              props: {
                value: report
              }
            }}
            on:click|stopPropagation={() => {
              showPopup(ProgressReportEditPopup, {
                attachedToClass: _class,
                value: report
              })
            }}
          >
            {#if valueInsideBars[i]}
              <span class="font-regular-11" style="color: white">{report.value}</span>
            {/if}
          </button>
          {#if !valueInsideBars[i]}
            <span class="font-regular-11 bar-label" style:left="{((accumulatedProgress[i] - report.value) / target) * 100}%">
              {report.value}
            </span>
          {/if}
        </div>
      {/each}
    </div>
  </Scroller>
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

  .bar-label {
    padding: 0 0.25rem;
    position: relative;
  }
</style>
