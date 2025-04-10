import { DOMAIN_MODEL_TX, DOMAIN_STATUS, generateId, TxCreateDoc } from "@hcengineering/core"
import { MigrateOperation, MigrationClient, MigrationUpgradeClient, ModelLogger, tryMigrate } from "@hcengineering/model"
import core from "@hcengineering/model-core"
import performance, { KRAStatus, performanceId, ReviewSessionStatus } from "@hcengineering/performance"
import task from "@hcengineering/task"

async function migrateReviewSessionStatuses (client: MigrationClient): Promise<void> {
  await client.update(
    DOMAIN_MODEL_TX,
    {
      objectClass: task.class.TaskType,
      'attributes.ofClass': performance.class.ReviewSession,
      'attributes.statusClass': core.class.Status
    },
    {
      $set: {
        'attributes.statusClass': performance.class.ReviewSessionStatus
      }
    }
  )
  await client.update(
    DOMAIN_MODEL_TX,
    {
      objectClass: core.class.Status,
      'attributes.ofAttribute': performance.attribute.ReviewSessionAttribute
    },
    {
      $set: {
        objectClass: performance.class.ReviewSessionStatus
      }
    }
  )

  await client.update(
    DOMAIN_STATUS,
    {
      _class: core.class.Status,
      ofAttribute: performance.attribute.ReviewSessionAttribute
    },
    {
      $set: {
        _class: performance.class.ReviewSessionStatus
      }
    }
  )
}

async function migrateReviewSessionStatusesToModel (client: MigrationClient): Promise<void> {
  // Move statuses to model:
  // Migrate the default ones with well-known ids as system's model
  // And the rest as user's model
  // Skip __superseded statuses
  const allStatuses = await client.find<ReviewSessionStatus>(DOMAIN_STATUS, {
    _class: performance.class.ReviewSessionStatus,
    __superseded: { $exists: false }
  })

  for (const status of allStatuses) {
    const isSystem = (status as any).__migratedFrom !== undefined
    const modifiedBy =
      status.modifiedBy === core.account.System
        ? isSystem
          ? core.account.System
          : core.account.ConfigUser
        : status.modifiedBy

    const tx: TxCreateDoc<ReviewSessionStatus> = {
      _id: generateId(),
      _class: core.class.TxCreateDoc,
      space: core.space.Tx,
      objectId: status._id,
      objectClass: status._class,
      objectSpace: core.space.Model,
      attributes: {
        ofAttribute: status.ofAttribute,
        category: status.category,
        name: status.name,
        color: status.color,
        description: status.description
      },
      modifiedOn: status.modifiedOn,
      createdBy: status.createdBy,
      createdOn: status.createdOn,
      modifiedBy
    }

    await client.create(DOMAIN_MODEL_TX, tx)
  }
}

async function migrateKRAStatuses (client: MigrationClient): Promise<void> {
  await client.update(
    DOMAIN_MODEL_TX,
    {
      objectClass: task.class.TaskType,
      'attributes.ofClass': performance.class.KRA,
      'attributes.statusClass': core.class.Status
    },
    {
      $set: {
        'attributes.statusClass': performance.class.KRAStatus
      }
    }
  )
  await client.update(
    DOMAIN_MODEL_TX,
    {
      objectClass: core.class.Status,
      'attributes.ofAttribute': performance.attribute.KRAStatusAttribute
    },
    {
      $set: {
        objectClass: performance.class.KRAStatus
      }
    }
  )

  await client.update(
    DOMAIN_STATUS,
    {
      _class: core.class.Status,
      ofAttribute: performance.attribute.KRAStatusAttribute
    },
    {
      $set: {
        _class: performance.class.KRAStatus
      }
    }
  )
}


async function migrateKRAStatusesToModel (client: MigrationClient): Promise<void> {
  // Move statuses to model:
  // Migrate the default ones with well-known ids as system's model
  // And the rest as user's model
  // Skip __superseded statuses
  const allStatuses = await client.find<KRAStatus>(DOMAIN_STATUS, {
    _class: performance.class.KRAStatus,
    __superseded: { $exists: false }
  })

  for (const status of allStatuses) {
    const isSystem = (status as any).__migratedFrom !== undefined
    const modifiedBy =
      status.modifiedBy === core.account.System
        ? isSystem
          ? core.account.System
          : core.account.ConfigUser
        : status.modifiedBy

    const tx: TxCreateDoc<KRAStatus> = {
      _id: generateId(),
      _class: core.class.TxCreateDoc,
      space: core.space.Tx,
      objectId: status._id,
      objectClass: status._class,
      objectSpace: core.space.Model,
      attributes: {
        ofAttribute: status.ofAttribute,
        category: status.category,
        name: status.name,
        color: status.color,
        description: status.description
      },
      modifiedOn: status.modifiedOn,
      createdBy: status.createdBy,
      createdOn: status.createdOn,
      modifiedBy
    }

    await client.create(DOMAIN_MODEL_TX, tx)
  }
}

export const performanceOperation: MigrateOperation = {
  async preMigrate (client: MigrationClient, logger: ModelLogger): Promise<void> {
    await tryMigrate(client, performanceId, [
      {
        state: 'migrateKRAStatuses',
        func: migrateKRAStatuses
      },
      {
        state: 'migrateReviewSessionStatuses',
        func: migrateReviewSessionStatuses
      }
      // {
      //   state: 'migrate-default-statuses',
      //   func: (client) => migrateDefaultStatuses(client, logger)
      // }
    ])
  },
  async migrate (client: MigrationClient): Promise<void> {
    await tryMigrate(client, performanceId, [
      // {
      //   state: 'identifier',
      //   func: migrateIdentifiers
      // },
      // {
      //   state: 'passIdentifierToParentInfo',
      //   func: passIdentifierToParentInfo
      // },
      {
        state: 'kraStatusesToModel',
        func: migrateKRAStatusesToModel
      },
      {
        state: 'reviewSessionStatusesToModel',
        func: migrateReviewSessionStatusesToModel
      },
      // {
      //   state: 'migrateDefaultTypeMixins',
      //   func: migrateDefaultTypeMixins
      // },
      // {
      //   state: 'migrateDefaultProjectOwners',
      //   func: migrateDefaultProjectOwners
      // }
    ])
  },
  async upgrade (state: Map<string, Set<string>>, client: () => Promise<MigrationUpgradeClient>): Promise<void> {
    // await tryUpgrade(state, client, trackerId, [
    //   {
    //     state: 'create-defaults',
    //     func: async (client) => {
    //       const tx = new TxOperations(client, core.account.System)
    //       await createDefaults(tx)
    //     }
    //   }
    // ])
  }
}