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
import { type Status, type Resources } from '@hcengineering/platform'
import NewReviewSessionHeader from './components/NewReviewSessionHeader.svelte'
import CreateReviewSession from './components/review-session/CreateReviewSession.svelte'
import ReviewSessionSpacePresenter from './components/navigator/ReviewSessionSpacePresenter.svelte'
import CreateKRA from './components/kra/CreateKRA.svelte'
import EditKRA from './components/kra/EditKRA.svelte'
import KRAPresenter from './components/kra/KRAPresenter.svelte'
import TeamSpacePresenter from './components/navigator/TeamSpacePresenter.svelte'
import KRARefPresenter from './components/kra/KRARefPresenter.svelte'
import KRAEditor from './components/kra/KRAEditor.svelte'
import { kraStatusSort } from './utils/kra'
import { type Attribute, type Doc, type DocumentQuery, type Ref, type Space } from '@hcengineering/core'
import { getAllStates } from '@hcengineering/task-resources'
import PerformanceDashboard from './components/dashboard/Dashboard.svelte'
import KRAAssigneesEditor from './components/kra/KRAAssigneesEditor.svelte'
import MyKRAs from './components/kra/MyKRAs.svelte'
// import ReviewSessionStatusPresenter from './components/review-session/ReviewSessionStatusPresenter.svelte'
// import ReviewSessionStatusRefPresenter from './components/review-session/ReviewSessionStatusRefPresenter.svelte'
// import ReviewSessionStateEditor from './components/review-session/ReviewSessionStateEditor.svelte'

export default async (): Promise<Resources> => ({
  component: {
    MyKRAs,
    KRAAssigneesEditor,
    NewReviewSessionHeader,
    CreateReviewSession,
    ReviewSessionSpacePresenter,
    CreateKRA,
    EditKRA,
    KRAPresenter,
    TeamSpacePresenter,
    KRARefPresenter,
    KRAEditor,
    PerformanceDashboard
    // ReviewSessionStatusPresenter,
    // ReviewSessionStatusRefPresenter,
    // ReviewSessionStateEditor
  },
  function: {
    KRAStatusSort: kraStatusSort,
    GetAllKRAStates: async (
      query: DocumentQuery<Doc<Space>> | undefined,
      onUpdate: () => void,
      queryId: Ref<Doc<Space>>,
      attr: Attribute<Status>
    ) => await getAllStates(query, onUpdate, queryId, attr, false)
  }
})
