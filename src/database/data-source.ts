import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'mariadb',
    driver: require('mysql2'),
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [`${import.meta.dir}/../entities/*.ts`],
    migrations: [`${import.meta.dir}/migrations/**/*.ts`],
});
