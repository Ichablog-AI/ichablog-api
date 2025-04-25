import appConfig from '@be/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    synchronize: false,
    logging: false,
    entities: [`${import.meta.dir}/../entities/*.ts`],
    migrations: [`${import.meta.dir}/migrations/**/*.ts`],
    ...appConfig.database.db,
});
