<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  export let style = ''
</script>

<div class="root flex background-button-bg-color border-radius-1" {style} style:background={'red'}>
  <div class="flex-center ml-2">
    <div class="flex-no-shrink"></div>
  </div>

  <div class="root flex flex-between items-center w-full p-2">
    <div class="content w-full">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .root {
    overflow: hidden;
  }

  .content {
    overflow: hidden;
  }
</style>
