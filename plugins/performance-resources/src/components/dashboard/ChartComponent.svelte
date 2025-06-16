<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher, onDestroy } from 'svelte'
  import { Chart, ChartOptions, registerables } from 'chart.js'
  import { type KRA } from '@hcengineering/performance'
  import { getName } from '@hcengineering/contact'
  import { getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { themeStore } from '@hcengineering/ui'
  import { Member } from '@hcengineering/kra-team'
  // Register all Chart.js components
  Chart.register(...registerables)

  type KRAsByEmployee = Record<Ref<Member>, Array<KRA & { weight: number, completionLevel: number }>>

  export let kras: KRA[]
  export let employees: Member[]
  export let krasByEmployee: KRAsByEmployee

  let chartCanvas: HTMLCanvasElement
  let chart: Chart
  const colors: string[] = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8B44AC', '#00ACC1', '#FF7043']

  themeStore.subscribe(() => {
    updateChart()
  })

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const dispatch = createEventDispatcher()

  // Create datasets for Chart.js
  function createChartData (): any {
    const employeeNames = employees.map((e) => getName(hierarchy, e))

    // Create a dataset for each KRA
    const datasets = kras.map((kra, index) => {
      const data = employees.map((employee) => {
        const employeeKraDetails = krasByEmployee[employee._id]
        if (employeeKraDetails == null) {
          return 0
        }
        const matchingKra = employeeKraDetails.find((k) => k._id === kra._id)

        // Calculate contribution to performance score
        const d =
          matchingKra?.completionLevel != null && matchingKra.weight != null
            ? matchingKra.completionLevel * matchingKra.weight
            : 0
        return d
      })

      return {
        label: kra.title,
        data,
        backgroundColor: colors[index % colors.length],
        borderColor: $themeStore.dark ? '#3c3f44' : '#dfe1e4',
        borderWidth: 1,
        barPercentage: 0.8
      }
    })

    // // Create dataset for remaining percentage to reach 100%
    // const remainingData = employees.map(employee => {
    //   return Math.max(0, 100 - employee.performanceScore)
    // })

    // datasets.push({
    //   label: 'Remaining',
    //   data: remainingData,
    //   backgroundColor: '#E0E0E0', // Light gray for remaining portion
    //   borderColor: 'white',
    //   borderWidth: 1,
    //   barPercentage: 0.8
    // })

    return {
      labels: employeeNames,
      datasets
    }
  }

  function createChart (): void {
    if (chartCanvas == null) return

    // Destroy existing chart if it exists
    if (chart != null) {
      chart.destroy()
    }

    const ctx = chartCanvas.getContext('2d')
    if (ctx == null) return

    chart = new Chart(ctx, {
      type: 'bar',
      data: createChartData(),
      options: getChartOptions()
    })

    // Add this to make segments clickable with cursor pointer
    chartCanvas.style.cursor = 'pointer'
  }

  function getChartOptions (): ChartOptions {
    return {
      indexAxis: 'y', // Horizontal bar chart
      responsive: true,
      maintainAspectRatio: false,
      color: $themeStore.dark ? 'rgba(255, 255, 255, .8)' : '#rgba(0, 0, 0, .8)',
      scales: {
        x: {
          stacked: true,
          min: 0,
          max: 100,
          title: {
            color: $themeStore.dark ? 'rgba(255, 255, 255, .8)' : '#rgba(0, 0, 0, .8)',
            display: true,
            text: 'Performance Score (%)'
          },
          grid: {
            display: true,
            color: $themeStore.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          stacked: true,
          title: {
            color: $themeStore.dark ? 'rgba(255, 255, 255, .8)' : '#rgba(0, 0, 0, .8)',
            display: true,
            text: 'Employees'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label // Employee name
            },
            footer: (tooltipItems) => {
              const employeeIndex = tooltipItems[0].dataIndex
              const employee = employees[employeeIndex]
              if (employee == null) return ''

              // Show KRA breakdown
              const employeeKras = krasByEmployee[employee._id]
              if (employeeKras.length === 0) return ''

              let footerText = '\nKRA Breakdown:'
              employeeKras.forEach((kra) => {
                footerText += `\n${kra.title} (${kra.weight}%): ${kra.completionLevel ?? 0}`
              })

              return footerText
            }
          }
        }
      },
      onClick: (_, elements, chart) => {
        if (elements === undefined || elements.length === 0) return

        const element = elements[0]
        const index = element.index
        const datasetIndex = element.datasetIndex
        const employee = employees[index]

        // Get the clicked KRA data
        const datasets = chart.data.datasets
        const dataset = datasets[datasetIndex]

        const kraName = dataset.label
        const employeeKras = krasByEmployee[employee._id]
        const kra = employeeKras.find((k) => k.title === kraName)

        if (kra != null) {
          dispatch('segmentClick', {
            employee,
            kra: kra as KRA
          })
        }
      }
    }
  }

  function updateChart (): void {
    if (chart != null) {
      chart.data = createChartData()
      chart.options = getChartOptions()
      chart.update()
    }
  }

  onMount(() => {
    // When component is first mounted, create chart if data is available
    if (chartCanvas != null) {
      createChart()
    }
  })

  onDestroy(() => {
    if (chart != null) {
      chart.destroy()
    }
  })

  afterUpdate(() => {
    if (chart != null && chartCanvas != null) {
      updateChart()
    } else if (chartCanvas != null) {
      createChart()
    }
  })
</script>

<canvas id="chart" bind:this={chartCanvas}></canvas>
