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
  import { floorFractionDigits, Icon, tooltip } from '@hcengineering/ui'
  import { calculateCompletionLevel } from '../../utils/kra'
  import { KRA, PTask } from '@hcengineering/performance'
  import { Ref } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import { personAccountByPersonId } from '@hcengineering/contact-resources'
  import { Person } from '@hcengineering/contact'
  import performance from '../../plugin'

  const client = getClient()

  export let value: Ref<KRA>
  export let docs: PTask[] | undefined = undefined
  export let category: string | undefined = undefined

  let completionLevel: number | undefined
  let weight: number | undefined

  $: if (docs !== undefined && docs.length > 0) {
    const account = $personAccountByPersonId.get(docs[0].assignee ?? '' as Ref<Person>)
    if (account !== undefined && account.length > 0) {
      void client.findOne(
        performance.class.EmployeeKRA,
        {
          kra: value,
          employee: account[0]._id
        }
      ).then((res) => {
        weight = res?.weight
      })
    }
  }
  $: count = docs?.length ?? 0
  $: void Promise.all((docs ?? [{} as unknown as PTask])
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
    {#if weight !== undefined}
      <Icon icon={performance.icon.Weight} size={'inline'}/>
      {weight}%
      x
    {/if}
    {completionLevel}%
  </div>
  <!-- </FixedColumn> -->
{/if}
