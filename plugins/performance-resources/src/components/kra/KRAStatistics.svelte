<!--
// Copyright © 2022-2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { floorFractionDigits, tooltip } from '@hcengineering/ui'
  import { FixedColumn } from '@hcengineering/view-resources'
  import { calculateCompletionLevel } from '../../utils/kra'
  import { Task } from '@hcengineering/task'
  import performance from '@hcengineering/performance'

  export let docs: Task[] | undefined = undefined
  export let category: string | undefined = undefined

  let completionLevel: number | undefined

  $: count = docs?.length ?? 0
  $: void Promise.all((docs ?? [{} as unknown as Task])
    .map(async (it) => {
      return await calculateCompletionLevel(it._id) ?? 0
    }))
    .then(results => {
      completionLevel = floorFractionDigits(results.reduce((sum, val) => sum + val, 0) / count * 100, 1)
    })
</script>

{#if docs !== undefined && category === 'kra'}
  <!-- <FixedColumn key="kra-completion-total"> -->
  <div
    class="flex-row-center flex-no-shrink h-6"
    use:tooltip={{ label: performance.string.KRACompletionLevel }}
  >
    {completionLevel}%
  </div>
  <!-- </FixedColumn> -->
{/if}
