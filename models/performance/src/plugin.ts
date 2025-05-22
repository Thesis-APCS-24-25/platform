//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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
//
import { performanceId } from '@hcengineering/performance'
import performance from '@hcengineering/performance-resources/src/plugin'
import type { Ref, StatusCategory } from '@hcengineering/core'
import { mergeIds } from '@hcengineering/platform'
import { type Application } from '@hcengineering/workbench'

export default mergeIds(performanceId, performance, {
  app: {
    Performance: '' as Ref<Application>
  },
  // reviewStatusCategory: {
  //   Drafting: '' as Ref<StatusCategory>,
  //   InProgress: '' as Ref<StatusCategory>,
  //   Concluded: '' as Ref<StatusCategory>
  // },
  kraStatusCategory: {
    Drafting: '' as Ref<StatusCategory>,
    NeedChanges: '' as Ref<StatusCategory>,
    Approved: '' as Ref<StatusCategory>,
    InProgress: '' as Ref<StatusCategory>,
    Archived: '' as Ref<StatusCategory>
  }
})
