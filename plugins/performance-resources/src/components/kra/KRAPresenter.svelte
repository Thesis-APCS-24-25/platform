<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Asset, getEmbeddedLabel } from '@hcengineering/platform'
  import type { KRA } from '@hcengineering/performance'
  import { AnySvelteComponent, ColorDefinition, getPlatformColor, getPlatformColorDef, Icon, themeStore, tooltip } from '@hcengineering/ui'
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
  export let kind: 'list-header' | 'list'
  export let type: ObjectPresenterType = 'link'
  export let icon: Asset | AnySvelteComponent | undefined = undefined

  $: color = getPlatformColorDef(value?.color ?? 13, $themeStore.dark).background
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
              <Icon icon={icon ?? performance.icon.KRA} size={'medium'} fill={color} />
            </div>
          {/if}
          <div
            class="overflow-label"
            class:header={!noSelect && kind === 'list-header'}
            class:select-text={!noSelect}
            class:uppercase={kind === 'list-header'}
            class:font-bold-12={kind === 'list-header'}
            title={value?.title}
          >
            {value.title}
            <slot name="details" />
          </div>
        </span>
      </DocNavLink>
    </div>
  {:else if type === 'text'}
    {#if shouldShowAvatar}
      <div
        class="icon"
        class:header-icon={!noSelect && kind === 'list-header'}
        style:background-color={color}
        use:tooltip={{ label: performance.string.KRA }}
      >
        <Icon icon={icon ?? performance.icon.KRA} size={'medium'} />
      </div>
    {/if}
    <span
      class:header={!noSelect && kind === 'list-header'}
      class:uppercase={kind === 'list-header'}
      class:font-medium-12={kind === 'list-header'}
      class="overflow-label"
      class:select-text={!noSelect}
      use:tooltip={{ label: getEmbeddedLabel(value.title) }}
    >
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
    }
  }

  .header {
    // border: 1px solid transparent;
    // border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    // background-color: var(--secondary-button-default);
  }

  .header-icon {
    padding: 0.25rem;
    border-radius: 0.25rem;
    background-color: var(--secondary-button-default);
  }
</style>
