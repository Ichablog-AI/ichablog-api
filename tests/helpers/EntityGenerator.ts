import { faker } from '@faker-js/faker';
import type { DataSource, EntityMetadata, EntityTarget } from 'typeorm';

import { CategoryEntity } from '@be/entities/CategoryEntity';
import { TagEntity } from '@be/entities/TagEntity';
import { UserEntity } from '@be/entities/UserEntity';

export type GeneratorOverrideFn<T, K extends keyof T> =
    | (() => T[K]) // no‑arg: produce a value
    | ((entity: Partial<T>) => T[K]); // one‑arg: read other props

export type GeneratorOverrides<T> = Partial<{
    [K in keyof T]: GeneratorOverrideFn<T, K>;
}>;

export class EntityGenerator<T> {
    private metadata!: EntityMetadata;
    private static globalDefaults = new Map<EntityTarget<unknown>, GeneratorOverrides<unknown>>();

    /** Register your per‑entity defaults once at test‑bootstrap time */
    static registerDefaults<E>(entity: EntityTarget<E>, defaults: GeneratorOverrides<E>): void {
        EntityGenerator.globalDefaults.set(entity, defaults as GeneratorOverrides<unknown>);
    }

    constructor(
        private dataSource: DataSource,
        private entity: EntityTarget<T>
    ) {}

    /** Build one POJO with overrides → defaults → faker, skipping relations & deletes */
    async generate(overrides: GeneratorOverrides<T> = {}): Promise<T> {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.metadata = this.dataSource.getMetadata(this.entity);

        const defaults = (EntityGenerator.globalDefaults.get(this.entity) as GeneratorOverrides<T>) || {};

        const obj = {} as T;
        for (const column of this.metadata.columns) {
            const key = column.propertyName as keyof T;

            // --- SKIP ALL RELATIONS & SOFT‑DELETE DATES ---
            if (column.relationMetadata || column.isDeleteDate) {
                obj[key] = null as unknown as T[typeof key];
                continue;
            }

            // 1) per‑call override?
            const runFn = overrides[key];
            if (typeof runFn === 'function') {
                obj[key] =
                    runFn.length > 0
                        ? (runFn as (ctx: Partial<T>) => T[typeof key])(obj)
                        : (runFn as () => T[typeof key])();
                continue;
            }

            // 2) global default?
            const defFn = defaults[key];
            if (typeof defFn === 'function') {
                obj[key] =
                    defFn.length > 0
                        ? (defFn as (ctx: Partial<T>) => T[typeof key])(obj)
                        : (defFn as () => T[typeof key])();
                continue;
            }

            // 3) faker fallback
            obj[key] = this.fakerByColumn(column) as T[typeof key];
        }

        return obj;
    }

    /** Bulk‑generate N POJOs */
    async generateMany(count: number, overrides: GeneratorOverrides<T> = {}): Promise<T[]> {
        const out: T[] = [];
        for (let i = 0; i < count; i++) {
            out.push(await this.generate(overrides));
        }
        return out;
    }

    /** Map a column’s type → faker */
    private fakerByColumn(column: EntityMetadata['columns'][number]): unknown {
        const typeName =
            typeof column.type === 'string' ? column.type : (column.type as { name: string }).name.toLowerCase();

        switch (typeName) {
            case 'varchar':
            case 'string':
            case 'text':
                return faker.lorem.words();
            case 'int':
            case 'integer':
            case 'float':
            case 'double':
            case 'number':
                return faker.number.int();
            case 'uuid':
                return faker.string.uuid();
            case 'date':
            case 'datetime':
            case 'timestamp':
                return faker.date.recent();
            case 'boolean':
                return faker.datatype.boolean();
            default:
                return null;
        }
    }
}

// Register global defaults for each entity
EntityGenerator.registerDefaults(UserEntity, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email().toLowerCase(),
    passwordHash: () => faker.internet.password(),
    url: () => faker.internet.url(),
    role: () => 'test-user',
    bio: () => faker.lorem.words({ min: 5, max: 10 }),
});

EntityGenerator.registerDefaults(CategoryEntity, {
    name: () => faker.commerce.department(),
    slug: (e) => (e.name ?? faker.commerce.department()).toLowerCase().replace(/\s+/g, '-'),
    description: () => faker.lorem.words({ min: 5, max: 10 }),
});

EntityGenerator.registerDefaults(TagEntity, {
    name: () => faker.commerce.department(),
    slug: (e) => (e.name ?? faker.commerce.department()).toLowerCase().replace(/\s+/g, '-'),
    description: () => faker.lorem.words({ min: 5, max: 10 }),
});
