//
// Copyright © 2020 Anticrm Platform Contributors.
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

import performance, { performanceId, ReviewSession } from '@hcengineering/performance'
import { Mixin, SpaceType, SpaceTypeDescriptor, type Ref } from '@hcengineering/core'
import { Asset, type IntlString, mergeIds } from '@hcengineering/platform'
import { AnyComponent } from '@hcengineering/ui'

export default mergeIds(performanceId, performance, {
  string: {
    CreateReviewSession: '' as IntlString,
    ReviewSessionName: '' as IntlString,
    ReviewSession: '' as IntlString,
    ReviewSessionNamePlaceholder: '' as IntlString,
    ReviewSessionDescriptionPlaceholder: '' as IntlString,
    Untitled: '' as IntlString,
    CreateKRA: '' as IntlString,
    KRAName: '' as IntlString,
    KRADescription: '' as IntlString,
    KRANamePlaceholder: '' as IntlString,
    KRADescriptionPlaceholder: '' as IntlString,
    KRA: '' as IntlString,
  },
  category: {
    ReviewSessionType: '' as IntlString
  },
  component: {
    EditKRA: '' as AnyComponent,
  }
})
