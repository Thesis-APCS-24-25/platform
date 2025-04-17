<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
  import { Chart, registerables } from 'chart.js'
  import { EmployeeKRA, ReviewSession, WithKRA, type KRA } from '@hcengineering/performance'
  import contact, { Contact } from '@hcengineering/contact'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import performance from '@hcengineering/performance'
  import { Ref } from '@hcengineering/core'
  import { calculateCompletionLevel } from '../../utils/KraUtils'

  // Register all Chart.js components
  Chart.register(...registerables)

  export let reviewSession: ReviewSession

  type KRAsByEmployee = Record<Ref<Contact>, Array<KRA & { weight?: number, completionLevel?: number }>>

  let employees: Contact[] = []
  let tasks: Array<WithKRA & { completionLevel?: number }>
  const kras: KRA[] = []
  let kraRefs: Ref<KRA>[]
  let employeeKras: EmployeeKRA[] = []
  let chartCanvas: HTMLCanvasElement
  let chart: Chart
  let krasByEmployee: KRAsByEmployee
  const colors: string[] = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8B44AC', '#00ACC1', '#FF7043']

  const client = getClient()
  const query = createQuery()
  const dispatch = createEventDispatcher()

  $: void client.findAll(
    performance.class.EmployeeKRA,
    {
      '$lookup.kra.space': reviewSession._id
    },
    {
      lookup: {
        kra: performance.class.KRA
      }
    }
  ).then((result) => {
    if (result !== undefined) {
      employeeKras = result
      result.forEach((entry) => {
        if (entry.$lookup?.kra !== undefined && !kras.includes(entry.$lookup.kra)) {
          kras.push(entry.$lookup.kra)
        }
      })
      kraRefs = kras.map(kra => kra._id)
    }
  })

  $: void client.findAll(
    contact.class.Contact,
    {
      $in: reviewSession
    }
  ).then((result) => {
    if (result !== undefined) {
      employees = result
    }
  })

  $: void client.findAll(
    performance.mixin.WithKRA,
    {
      kra: {
        $in: kraRefs
      }
    }
  ).then((result) => {
    if (result !== undefined) {
      tasks = result.map((entry) => {
        const e = entry as WithKRA
        return {
          completionLevel: 0,
          ...e
        }
      })
    }
  })

  $: {
    if (tasks !== undefined) {
      const updateCompletionLevels = async (): Promise<void> => {
        for (const task of tasks) {
          task.completionLevel = await calculateCompletionLevel(task._id)
        }
      }
      void updateCompletionLevels()
    }
  }

  $: {
    // Group KRAs by employee using the relationships table
    krasByEmployee = employees.reduce<KRAsByEmployee>((acc, employee) => {
      // Get all EmployeeKRA entries for this employee
      const employeeKraEntries = employeeKras.filter(entry => entry.employee === employee._id)

      // For each entry, fetch the corresponding KRA details
      const employeeKraDetails = employeeKraEntries.map(entry => {
        const kra = kras.find(k => k._id === entry.kra)
        if (kra == null) return null
        const withKRA = tasks.filter((task) => task.kra === kra._id)
        let completionLevel = withKRA.reduce<number>(
          (acc, task) => acc + (task.completionLevel ?? 0),
          0
        )
        completionLevel = completionLevel / withKRA.length

        // Return the KRA with employee-specific weight and completion level
        return {
          ...kra,
          weight: entry.weight,
          completionLevel
        }
      }).filter(x => x !== null)

      acc[employee._id] = employeeKraDetails
      return acc
    }, {})

    // If data changes and chart exists, update it
    if (chart !== undefined) {
      updateChart()
    }
  }

  // Create datasets for Chart.js
  function createChartData (): any {
    const employeeNames = employees.map(e => e.name)

    // Create a dataset for each KRA
    const datasets = kras.map((kra, index) => {
      const data = employees.map(employee => {
        const employeeKraDetails = krasByEmployee[employee._id]
        const matchingKra = employeeKraDetails.find(k => k.title === kra.title)

        // Calculate contribution to performance score
        return (matchingKra?.completionLevel != null && matchingKra.weight != null)
          ? (matchingKra.completionLevel * matchingKra.weight / 100)
          : 0
      })

      return {
        label: kra.title,
        data,
        backgroundColor: colors[index % colors.length],
        borderColor: 'white',
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
    if (!chartCanvas) return

    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }

    const ctx = chartCanvas.getContext('2d')
    if (!ctx) return

    chart = new Chart(ctx, {
      type: 'bar',
      data: createChartData(),
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Performance Score (%)'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            stacked: true,
            title: {
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
                if (!employee) return ''

                // Show KRA breakdown
                const employeeKras = krasByEmployee[employee._id]
                if (employeeKras.length === 0) return ''

                let footerText = '\nKRA Breakdown:'
                employeeKras.forEach(kra => {
                  footerText += `\n${kra.title} (${kra.weight}%): ${
                    kra.completionLevel != null
                    ? kra.completionLevel.toFixed(1)
                    : 0
                  }%`
                })

                return footerText
              }
            }
          }
        },
        onClick: (event, elements, chart) => {
          if (elements === undefined || elements.length === 0) return

          const element = elements[0]
          const index = element.index
          const datasetIndex = element.datasetIndex
          const employee = employees[index]

          // Get the clicked KRA data
          const datasets = chart.data.datasets
          const dataset = datasets[datasetIndex]

          // If it's the "Remaining" dataset
          if (dataset.label === 'Remaining') {
            dispatch('segmentClick', {
              type: 'remaining',
              employee
            })
            return
          }

          // It's a KRA dataset
          const kraName = dataset.label
          const employeeKras = krasByEmployee[employee._id]
          const kra = employeeKras.find(k => k.title === kraName)

          if (kra != null) {
            dispatch('segmentClick', {
              type: 'kra',
              employee,
              kra
            })
          }
        }
      }
    })

    // Add this to make segments clickable with cursor pointer
    chartCanvas.style.cursor = 'pointer'
  }

  function updateChart (): void {
    if (chart) {
      chart.data = createChartData()
      chart.update()
    }
  }

  onMount(() => {
    if (chartCanvas && employees.length > 0) {
      createChart()
    }
  })

  afterUpdate(() => {
    if (chartCanvas && employees.length > 0 && !chart) {
      createChart()
    }
  })
</script>

<div class="chart-container">
  <h2>Employee Performance Progress</h2>

  {#if employees.length === 0}
    <div class="no-data">No data available.</div>
  {:else}
    <div class="chart">
      <canvas bind:this={chartCanvas}></canvas>
    </div>
  {/if}
</div>

<style>
  .chart-container {
    font-family: 'Inter', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .chart {
    height: 400px;
    margin-bottom: 20px;
    position: relative;
  }

  .no-data {
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666;
    font-style: italic;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .summary {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
</style>
