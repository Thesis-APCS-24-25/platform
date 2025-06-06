<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Asset, getEmbeddedLabel } from '@hcengineering/platform'
  import type { KRA } from '@hcengineering/performance'
  import { AnySvelteComponent, getPlatformColorDef, Icon, themeStore, tooltip } from '@hcengineering/ui'

  import { DocNavLink, ObjectMention } from '@hcengineering/view-resources'
  import { ObjectPresenterType } from '@hcengineering/view'
  import performance from '../../plugin'

  export let value: WithLookup<KRA> | undefined
  export let disabled = false
  export let onClick: (() => void) | undefined = undefined
  export let shouldShowAvatar = false
  export let noUnderline = disabled
  export let colorInherit = false
  export let noSelect = false
  export let inline = false
  export let kind: 'list-header' | 'list' = 'list' // Default value added
  export let type: ObjectPresenterType = 'link' // Default value added
  export let icon: Asset | AnySvelteComponent | undefined = undefined

  // Reactive variables
  const colorDef = value?.color ? getPlatformColorDef(value.color, $themeStore.dark) : undefined
  $: bgColor = colorDef?.background || 'transparent' // Fallback added
  $: color = colorDef?.color || 'inherit' // Fallback added
</script>

{#if value}
  {#if inline}
    <ObjectMention object={value} {disabled} {noUnderline} {onClick} component={performance.component.EditKRA} />
  {:else if type === 'link'}
    <div class="flex-row-center">
      <DocNavLink
        object={value}
        {onClick}
        {disabled}
        {noUnderline}
        {colorInherit}
        component={performance.component.EditKRA}
        shrink={0}
      >
        <div class="kraPresenterRoot" class:list={kind === 'list'} class:cursor-pointer={!disabled}>
          {#if shouldShowAvatar}
            <div class="icon" use:tooltip={{ label: performance.string.KRA }} aria-label="KRA Icon">
              <Icon icon={icon ?? performance.icon.KRA} size="medium" fill={color} />
            </div>
          {/if}
          <div
            class="kra-name"
            class:header={!noSelect && kind === 'list-header'}
            class:select-text={!noSelect}
            class:uppercase={kind === 'list-header'}
            class:font-medium-12={kind === 'list-header'}
            title={value?.title}
          >
            {#if kind === 'list-header'}
              [{value.identifier}]
            {/if}
            {value.title}
            <slot name="details" />
          </div>
        </div>
      </DocNavLink>
    </div>
  {:else if type === 'text'}
    <div class="kraPresenterRoot">
      {#if shouldShowAvatar}
        <div
          class="icon"
          class:header-icon={!noSelect && kind === 'list-header'}
          use:tooltip={{ label: performance.string.KRA }}
          aria-label="KRA Icon"
        >
          <Icon icon={icon ?? performance.icon.KRA} size="medium" />
        </div>
      {/if}
      <span
        class:header={!noSelect && kind === 'list-header'}
        class:uppercase={kind === 'list-header'}
        class:font-medium-12={kind === 'list-header'}
        class:select-text={!noSelect}
        use:tooltip={{ label: getEmbeddedLabel(value.title) }}
        aria-label={value.title}
      >
        <span class="font-bold-12">
          {value.identifier}
        </span>
        {value.title}
      </span>
    </div>
  {/if}
{/if}

<style lang="scss">
  $theme-content-color: var(--theme-content-color);
  $theme-halfcontent-color: var(--theme-halfcontent-color);

  .kraPresenterRoot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    text-wrap: nowrap;
    text-overflow: ellipsis;

    &:not(.list) {
      color: $theme-content-color;
    }

    &.list {
      color: $theme-halfcontent-color;
    }
  }

  .kra-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:not(.header) {
      max-width: 15rem;
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
