import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { Logger } from '@nestjs/common';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export default defineConfig({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  pool: { min: 2, max: 10 },
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  ensureDatabase: true,
  logger: Logger.log.bind(new Logger('MikroORM')),
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  extensions: [Migrator, EntityGenerator, EntityGenerator],
});
