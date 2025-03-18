<script lang="ts">
  import { Ref, WithLookup } from '@hcengineering/core'
  import { ProjectType, TaskType } from '@hcengineering/task'
  import { StatePresenter } from '@hcengineering/task-resources'
  import { WeeTaskStatus, Project } from '@hcengineering/kra'
  import { IconSize } from '@hcengineering/ui'

  export let value: WithLookup<WeeTaskStatus> | undefined
  export let size: IconSize
  export let space: Ref<Project> | undefined = undefined
  export let taskType: Ref<TaskType> | undefined = undefined
</script>

<StatePresenter {taskType} {value} {size} shouldShowName={false} on:accent-color />
