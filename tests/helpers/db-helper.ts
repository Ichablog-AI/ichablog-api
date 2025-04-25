import appConfig from '@be/config';
import type { BaseEntity, EntityTarget } from 'typeorm';
import { DataSource } from 'typeorm';

export const testDataSource = new DataSource({
    entities: appConfig.database.db.entities,
    type: 'sqlite',
    database: 'tests/testDb.sqlite',
    synchronize: true,
    logging: false,
});

/**
 * Initialize the test database connection.
 */
export async function setupTestDB(): Promise<void> {
    if (!testDataSource.isInitialized) {
        await testDataSource.initialize();
    }
}

/**
 * Wipe all data between tests.
 */
export async function resetDbTables(target: EntityTarget<BaseEntity> | EntityTarget<BaseEntity>[]): Promise<void> {
    const targets = Array.isArray(target) ? target : [target];
    for (const entity of targets) {
        const repo = testDataSource.getRepository(entity);
        await repo.clear();
    }
}

/**
 * Cleanly close the test database.
 */
export async function closeTestDB(): Promise<void> {
    if (testDataSource.isInitialized) {
        await testDataSource.destroy();
    }
}
