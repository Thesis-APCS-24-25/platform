<script lang="ts">
  import performance from '../../plugin'
  import { getCurrentAccount, Ref } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession, TaskWithKRA, WithKRA } from '@hcengineering/performance'
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { createQuery, DocPopup, getClient, ObjectCreate, ObjectPopup } from '@hcengineering/presentation'
  import view, { ObjectFactory } from '@hcengineering/view'
  import task, { Task } from '@hcengineering/task'
  import { ClassPresenter } from '@hcengineering/view-resources'
  import ClassRefPresenter from '@hcengineering/view-resources/src/components/ClassRefPresenter.svelte'
  import { personAccountByPersonId, personIdByAccountId } from '@hcengineering/contact-resources'

  export let kra: Ref<KRA> | undefined = undefined
  export let space: Ref<ReviewSession> | undefined = undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const factories = hierarchy
    .getDescendants(task.class.Task)
    .filter((subclass) => {
      return hierarchy.classHierarchyMixin(subclass, performance.mixin.WithKRA) !== undefined
    })
    .map((subclass) => {
      return hierarchy.classHierarchyMixin(subclass, view.mixin.ObjectFactory)
    })
    .filter((s) => s !== undefined)

  const create =
    factories[0]?.component !== undefined
      ? {
          component: factories[0].component,
          label: performance.string.Active
        }
      : undefined

  async function handleClose (event: CustomEvent<WithKRA>): Promise<void> {
    const task = event.detail
    await client.updateMixin<Task, WithKRA>(task._id, task._class, task.space, performance.mixin.WithKRA, {
      kra
    })
  }
  const me = $personIdByAccountId.get(getCurrentAccount()._id as Ref<PersonAccount>) ?? null

  let tasks: TaskWithKRA[] = []
  $: assignedTasks = tasks.filter((task) => task.assignee === me)
  const taskQuery = createQuery()
  $: taskQuery.query(
    performance.mixin.WithKRA,
    {
      kra,
      assignee: $personIdByAccountId.get(getCurrentAccount()._id as Ref<PersonAccount>) ?? null
    },
    (result) => {
      if (result !== undefined) {
        tasks = result
      }
    },
    { sort: { createdAt: -1 }, limit: 100 }
  )
</script>

<DocPopup
  type="presenter"
  _class={performance.mixin.WithKRA}
  size={'large'}
  {create}
  selectedObjects={assignedTasks.map((t) => t._id)}
  objects={tasks}
  groupBy="_class"
  closeAfterSelect
  multiSelect
  on:close={handleClose}
  on:update
>
  <svelte:fragment slot="category" let:item>
    <ClassRefPresenter value={item._class} />
  </svelte:fragment>
</DocPopup>
