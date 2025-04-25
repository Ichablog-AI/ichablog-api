import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import type { AppEntity } from '@be/database/AppEntity';
import { BlogDomainEntity } from '@be/entities/BlogDomainEntity';
import { CategoryEntity } from '@be/entities/CategoryEntity';
import { UserEntity } from '@be/entities/UserEntity';
import { EntityGenerator } from '@be/test-helpers/EntityGenerator';
import type { DeepPartial, ObjectType } from 'typeorm';
import { closeTestDB, setupTestDB, testDataSource } from '../../helpers/db-helper';

const ENTITIES: ObjectType<AppEntity>[] = [UserEntity, CategoryEntity, BlogDomainEntity];

describe('DbConnection & EntityGenerator smoke tests', () => {
    let gen: EntityGenerator<AppEntity>;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    for (const EntityClass of ENTITIES) {
        describe(EntityClass.name, () => {
            beforeEach(() => {
                gen = new EntityGenerator(testDataSource, EntityClass);
            });

            it('generates a valid sample object', async () => {
                let overrides = {};
                if (EntityClass === UserEntity) {
                    overrides = { email: () => 'unique@example.test' };
                }
                const sample = await gen.generate(overrides);
                expect(sample).toBeDefined();
            });

            it('saves and retrieves the object', async () => {
                const sample = await gen.generate();
                const instance = testDataSource.getRepository(EntityClass).create(sample);
                await instance.save();
                expect(instance.id).toBeDefined();
                const found = testDataSource.getRepository(EntityClass).findOneBy({
                    id: instance.id,
                });
                expect(await found).toBeInstanceOf(EntityClass);
            });
        });
    }
});
