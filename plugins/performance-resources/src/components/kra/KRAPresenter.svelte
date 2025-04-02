<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Asset, getEmbeddedLabel } from '@hcengineering/platform'
  import TaskTypeIcon from '@hcengineering/task-resources'
  import type { KRA } from '@hcengineering/performance'
  import { AnySvelteComponent, Icon, tooltip } from '@hcengineering/ui'
  import { DocNavLink, ObjectMention } from '@hcengineering/view-resources'
  import { ObjectPresenterType } from '@hcengineering/view'

  import performance from '../../plugin'

  export let value: WithLookup<KRA> | undefined
  export let disabled: boolean = false
  export let onClick: (() => void) | undefined = undefined
  export let shouldShowAvatar: boolean = false
  export let noUnderline: boolean = disabled
  export let colorInherit: boolean = false
  export let noSelect: boolean = false
  export let inline = false
  export let kind: 'list' | undefined = undefined
  export let type: ObjectPresenterType = 'link'
  export let icon: Asset | AnySvelteComponent | undefined = undefined

  let taskType = performance.taskTypes.KRA
</script>

{#if inline && value}
  <ObjectMention object={value} {disabled} {noUnderline} {onClick} component={performance.component.EditKRA} />
{:else if value}
  {#if type === 'link'}
    <div class="flex-row-center">
      <DocNavLink
        object={value}
        {onClick}
        {disabled}
        {noUnderline}
        {inline}
        {colorInherit}
        component={performance.component.EditKRA}
        shrink={0}
      >
        <span class="kraPresenterRoot" class:list={kind === 'list'} class:cursor-pointer={!disabled}>
          {#if shouldShowAvatar}
            <div class="icon" use:tooltip={{ label: performance.string.KRA }}>
              <Icon icon={icon ?? performance.icon.KRA} size={'small'} />
            </div>
          {/if}
          <span class="overflow-label" class:select-text={!noSelect} title={value?.title}>
            {value.title}
            <slot name="details" />
          </span>
        </span>
      </DocNavLink>
    </div>
  {:else if value && type === 'text'}
    <span class="overflow-label" class:select-text={!noSelect} use:tooltip={{ label: getEmbeddedLabel(value.title) }}>
      {value.title}
    </span>
  {/if}
{/if}

<style lang="scss">
  .kraPresenterRoot {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    &:not(.list) {
      color: var(--theme-content-color);
    }

    &.list {
      color: var(--theme-halfcontent-color);
    }

    .icon {
      margin-right: 0.5rem;
      color: var(--theme-dark-color);
    }
  }
</style>
