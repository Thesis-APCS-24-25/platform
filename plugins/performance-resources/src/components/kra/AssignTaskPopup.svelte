<script lang="ts">
  import performance from '../../plugin'
  import { Ref } from '@hcengineering/core'
  import { KRA, ReviewSession } from '@hcengineering/performance'
  import { createQuery, getClient, ObjectCreate } from '@hcengineering/presentation'
  import task from '@hcengineering/task'
  import { Component, Label } from '@hcengineering/ui'

  export let kra: Ref<KRA> | undefined = undefined
  export let space: Ref<ReviewSession> | undefined = undefined

  const client = getClient()
  const hierarchy = client.getHierarchy()
  const factories = hierarchy
    .getDescendants(task.class.Task)
    .filter((c) => !hierarchy.isMixin(c))
    .map((subclass) => {
      const factory = hierarchy.classHierarchyMixin(subclass, performance.mixin.ActionItemFactory)
      if (factory === undefined) return undefined
      const label = hierarchy.getClass(subclass)?.label
      if (label === undefined) return undefined
      return {
        component: factory.component,
        label
      } satisfies ObjectCreate
    })
    .filter((s) => s !== undefined)

  const kraQ = createQuery()
  let kraValue: KRA | undefined = undefined
  $: kraQ.query(
    performance.class.KRA,
    {
      _id: kra
    },
    (res) => {
      if (res.length > 0) {
        kraValue = res[0]
      } else {
        kraValue = undefined
      }
    },
    {
      limit: 1
    }
  )

  let selectedFactory: ObjectCreate | undefined = factories[0]
  $: showSelector = factories.length > 1
</script>

<div class="container">
  <div class="header" class:hidden={!showSelector}>
    {#each factories as factory}
      {@const selected = selectedFactory?.label === factory.label}
      <button
        class="header-item"
        class:selected
        on:click={() => {
          selectedFactory = factory
        }}
      >
        <Label label={factory.label} />
      </button>
    {/each}
  </div>

  <div class="content">
    {#if selectedFactory?.component !== undefined}
      {#key selectedFactory}
        <Component
          is={selectedFactory.component}
          props={{
            kra: kraValue
          }}
          on:close
        />
      {/key}
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    background-color: var(--theme-bg-color);
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 1rem;
    background-color: var(--hc-color-background-secondary);
    border-bottom: 1px solid var(--hc-color-border);
  }

  .header-item {
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;

    &.selected {
      background-color: var(--theme-button-pressed);
      border-bottom: 2px solid grey;
    }

    &:hover &:not(.selected) {
      background-color: var(--theme-button-hover);
    }
  }

  .content {
    flex-grow: 1;
  }

  .hidden {
    display: none;
  }
</style>
