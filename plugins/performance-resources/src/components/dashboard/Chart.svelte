<script lang="ts">
  import { EmployeeKRA, ReviewSession, PTask, type KRA } from '@hcengineering/performance'
  import contact, { PersonAccount } from '@hcengineering/contact'
  import { getClient, createQuery } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { Ref, Timestamp } from '@hcengineering/core'
  import { calculateCompletionLevel } from '../../utils/kra'
  import { Button, DatePresenter, Loading } from '@hcengineering/ui'
  import kraTeam, { Member } from '@hcengineering/kra-team'
  import { personByIdStore, personIdByAccountId } from '@hcengineering/contact-resources'
  import ChartComponent from './ChartComponent.svelte'

  export let space: Ref<ReviewSession>

  type KRAsByEmployee = Record<Ref<Member>, Array<KRA & { weight: number, completionLevel: number }>>

  let tasks: Array<PTask> | undefined = undefined
  let taskCompletion: Record<Ref<PTask>, number> | undefined = undefined
  let kras: KRA[] | undefined = undefined
  let kraRefs: Ref<KRA>[] | undefined = undefined
  let employeeKras: EmployeeKRA[] = []
  let employees: Member[] = []

  let startDate: Timestamp | undefined
  let endDate: Timestamp | undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const reviewSessionQ = createQuery()
  const employeeKraQ = createQuery()
  const taskQ = createQuery()

  $: reviewSessionQ.query(
    performance.class.ReviewSession,
    {
      _id: space
    },
    (res) => {
      if (res.length === 1) {
        employees = extractMember(res[0])
      }
    },
    {
      lookup: {
        members: contact.class.PersonAccount
      },
      limit: 1
    }
  )

  $: employeeKraQ.query(
    performance.class.EmployeeKRA,
    {
      '$lookup.kra.space': space
    },
    (res) => {
      if (res !== undefined && res.length > 0) {
        employeeKras = res
        const newKras: KRA[] = []
        res.forEach((entry) => {
          if (entry.$lookup?.kra !== undefined && !newKras.some((value) => value._id === entry.$lookup?.kra?._id)) {
            newKras.push(entry.$lookup.kra)
          }
        })
        kras = newKras
        kraRefs = kras.map((kra) => kra._id)
      }
    },
    {
      lookup: {
        kra: performance.class.KRA
      }
    }
  )

  $: if (kraRefs !== undefined) {
    taskQ.query(
      performance.class.PTask,
      {
        kra: { $in: kraRefs },
        createdOn: {
          $gte: startDate ?? Number.MIN_SAFE_INTEGER,
          $lte: endDate !== undefined ? endDate + 86400 : Number.MAX_SAFE_INTEGER
        }
      },
      (res) => {
        if (res !== undefined) {
          tasks = res
        }
      }
    )
  } else {
    taskQ.unsubscribe()
  }

  $: if (tasks !== undefined) {
    const updateCompletionLevels = async (): Promise<void> => {
      const completion: Record<Ref<PTask>, number> = {}
      for (const task of tasks ?? []) {
        completion[task._id] = (await calculateCompletionLevel(task._id)) ?? 0
      }
      taskCompletion = completion
    }
    void updateCompletionLevels()
  }

  function resetFilters (): void {
    startDate = undefined
    endDate = undefined
  }

  function extractMember (reviewSession: ReviewSession): Member[] {
    return reviewSession.members
      .map((mem) => $personIdByAccountId.get(mem as Ref<PersonAccount>))
      .map((m) => {
        if (m === undefined) return undefined
        const p = $personByIdStore.get(m)
        if (p !== undefined) {
          return hierarchy.as(p, kraTeam.mixin.Member)
        }
        return undefined
      })
      .filter((m) => m !== undefined) as Member[]
  }

  function summarizeKra (
    employees: Member[],
    kras: KRA[],
    kraAssigns: EmployeeKRA[],
    tasks: PTask[],
    taskCompletion: Record<Ref<PTask>, number>
  ): KRAsByEmployee {
    return employees.reduce<KRAsByEmployee>((acc, employee) => {
      // Get all EmployeeKRA entries for this employee
      const employeeKraEntries = kraAssigns.filter((entry) => entry.assignee === employee._id)
      // For each entry, fetch the corresponding KRA details
      const employeeKraDetails = employeeKraEntries
        .map((entry) => {
          const kra = kras.find((k) => k._id === entry.kra)
          if (kra == null) return null
          const filteredTasks = tasks.filter((task) => {
            return task.kra === kra._id && task.assignee === employee._id
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
  }
</script>

<div class="chart-container">
  <h2>Employee Performance Progress</h2>

  {#if employees.length === 0}
    <div class="no-data">No data available.</div>
  {:else}
    <div class="date-filter">
      <DatePresenter
        kind={'regular'}
        size={'large'}
        bind:value={startDate}
        editable
        label={performance.string.StartDateFilter}
        labelNull={performance.string.StartDateFilter}
        detail={performance.string.StartDateFilterDetail}
      />
      <DatePresenter
        kind={'regular'}
        size={'large'}
        bind:value={endDate}
        editable
        label={performance.string.EndDateFilter}
        labelNull={performance.string.EndDateFilter}
        detail={performance.string.EndDateFilterDetail}
      />
      <Button label={performance.string.ResetFilters} kind={'regular'} size={'large'} on:click={resetFilters} />
    </div>
    {#if kras !== undefined && employees !== undefined && employeeKras !== undefined && tasks !== undefined && taskCompletion !== undefined}
      {@const krasByEmployee = summarizeKra(employees, kras, employeeKras, tasks, taskCompletion)}
      <ChartComponent {employees} {krasByEmployee} {kras} on:segmentClick />
    {:else}
      <Loading />
    {/if}
  {/if}
</div>

<style>
  .chart-container {
    font-family: 'Inter', sans-serif;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--theme-panel-color);
    border-radius: 8px;
    /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); */
  }

  .date-filter {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: var(--theme-text-primary-color);
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
