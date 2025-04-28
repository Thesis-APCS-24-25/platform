<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher, onDestroy } from 'svelte'
  import { Chart, registerables } from 'chart.js'
  import { EmployeeKRA, ReviewSession, WithKRA, type KRA } from '@hcengineering/performance'
  import contact, { Person, PersonAccount } from '@hcengineering/contact'
  import { getClient } from '@hcengineering/presentation'
  import performance from '@hcengineering/performance'
  import { Ref } from '@hcengineering/core'
  import { calculateCompletionLevel } from '../../utils/KraUtils'

  // Register all Chart.js components
  Chart.register(...registerables)

  export let space: Ref<ReviewSession>

  type KRAsByEmployee = Record<Ref<PersonAccount>, Array<KRA & { weight: number, completionLevel: number }>>

  let reviewSession: ReviewSession
  let employees: PersonAccount[] = []
  let employeeIds: Ref<Person>[] | undefined = undefined
  let employeeDetails: Record<Ref<Person>, Person> | undefined = undefined
  let tasks: Array<WithKRA>
  const taskCompletion: Record<Ref<WithKRA>, number> = {}
  const kras: KRA[] = []
  let kraRefs: Ref<KRA>[]
  let employeeKras: EmployeeKRA[] = []
  let chartCanvas: HTMLCanvasElement
  let chart: Chart
  let krasByEmployee: KRAsByEmployee
  const colors: string[] = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8B44AC', '#00ACC1', '#FF7043']

  const client = getClient()
  const dispatch = createEventDispatcher()

  $: void client
    .findOne(performance.class.ReviewSession, {
      _id: space
    })
    .then((result) => {
      if (result !== undefined) {
        reviewSession = result
      }
    })

  $: void client
    .findAll(
      performance.class.EmployeeKRA,
      {
        '$lookup.kra.space': space
      },
      {
        lookup: {
          kra: performance.class.KRA
        }
      }
    )
    .then((result) => {
      if (result !== undefined) {
        employeeKras = result
        result.forEach((entry) => {
          if (entry.$lookup?.kra !== undefined && !kras.includes(entry.$lookup.kra)) {
            kras.push(entry.$lookup.kra)
          }
        })
        kraRefs = kras.map((kra) => kra._id)
      }
    })

  $: if (employeeIds === undefined && reviewSession !== undefined) {
    void client
      .findAll(contact.class.PersonAccount, {
        _id: {
          $in: reviewSession.members as Ref<PersonAccount>[]
        }
      })
      .then((result) => {
        if (result !== undefined) {
          employees = result
          employeeIds = employees.map((emp) => emp.person)
        }
      })
  }

  $: if (employeeIds !== undefined && employeeDetails === undefined) {
    void client
      .findAll(contact.class.Person, {
        _id: {
          $in: employeeIds
        }
      })
      .then((result) => {
        if (result !== undefined) {
          employeeDetails = {}
          result.forEach((res) => {
            ;(employeeDetails as Record<Ref<Person>, Person>)[res._id as Ref<Person>] = res
          })
        }
      })
  }

  $: if (kraRefs !== undefined) {
    void client
      .findAll(performance.mixin.WithKRA, {
        kra: { $in: kraRefs }
      })
      .then((result) => {
        if (result !== undefined) {
          tasks = result
        }
      })
  }

  $: {
    if (tasks !== undefined) {
      const updateCompletionLevels = async (): Promise<void> => {
        for (const task of tasks) {
          taskCompletion[task._id] = (await calculateCompletionLevel(task._id)) ?? 0
        }
      }
      void updateCompletionLevels()
    }
  }

  $: console.log('Tasks', taskCompletion)

  $: {
    // Group KRAs by employee using the relationships table
    krasByEmployee = employees.reduce<KRAsByEmployee>((acc, employee) => {
      // Get all EmployeeKRA entries for this employee
      const employeeKraEntries = employeeKras.filter((entry) => entry.employee === employee._id)
      // For each entry, fetch the corresponding KRA details
      const employeeKraDetails = employeeKraEntries
        .map((entry) => {
          const kra = kras.find((k) => k._id === entry.kra)
          if (kra == null || tasks === undefined) return null
          const filteredTasks = tasks.filter((task) => {
            const asMixin = client.getHierarchy().as(task, performance.mixin.WithKRA)
            return asMixin.kra === kra._id
          })
          let completionLevel = filteredTasks.reduce<number>((acc, task) => {
            return acc + (taskCompletion[task._id] ?? 0)
          }, 0)
          completionLevel = filteredTasks.length !== 0 ? completionLevel / filteredTasks.length : 0

          // Return the KRA with employee-specific weight and completion level
          return {
            ...kra,
            weight: entry.weight,
            completionLevel
          }
        })
        .filter((x) => x != null)

      acc[employee._id] = employeeKraDetails as Array<KRA & { weight: number, completionLevel: number }>
      return acc
    }, {})

    // If data changes and chart exists, update it
    if (chart !== undefined) {
      updateChart()
    }
  }

  // Create datasets for Chart.js
  function createChartData (): any {
    if (employeeDetails === undefined) {
      return null
    }
    const employeeNames = employees.map((e) => (employeeDetails as Record<Ref<Person>, Person>)[e.person].name ?? '')

    // Create a dataset for each KRA
    const datasets = kras.map((kra, index) => {
      const data = employees.map((employee) => {
        const employeeKraDetails = krasByEmployee[employee._id]
        const matchingKra = employeeKraDetails.find((k) => k._id === kra._id)
        console.log('detail', matchingKra)

        // Calculate contribution to performance score
        const d =
          matchingKra?.completionLevel != null && matchingKra.weight != null
            ? matchingKra.completionLevel * matchingKra.weight
            : 0
        console.log(`${matchingKra?.title} ${matchingKra?.weight} ${matchingKra?.completionLevel} ${d}`)
        return d * 100
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
                if (employee == null) return ''

                // Show KRA breakdown
                const employeeKras = krasByEmployee[employee._id]
                if (employeeKras.length === 0) return ''

                let footerText = '\nKRA Breakdown:'
                employeeKras.forEach((kra) => {
                  footerText += `\n${kra.title} (${kra.weight * 100}%): ${
                    kra.completionLevel != null ? kra.completionLevel.toFixed(1) : 0
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
    })

    // Add this to make segments clickable with cursor pointer
    chartCanvas.style.cursor = 'pointer'
  }

  function updateChart (): void {
    if (chart != null) {
      chart.data = createChartData()
      chart.update()
    }
  }

  onMount(() => {
    // When component is first mounted, create chart if data is available
    if (chartCanvas != null && employees.length > 0 && kras.length > 0) {
      createChart()
    }
  })

  afterUpdate(() => {
    // Check if we need to create or update the chart
    if (chartCanvas != null && employees.length > 0 && kras.length > 0) {
      if (chart == null) {
        createChart()
      } else {
        updateChart()
      }
    }
  })

  onDestroy(() => {
    if (chart != null) {
      chart.destroy()
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
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); */
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .chart {
    width: 100%;
    height: auto;
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
</style>
