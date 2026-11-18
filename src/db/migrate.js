const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const databasePool = require('./pool');

const MIGRATIONS_DIRECTORY = path.join(__dirname, 'migrations');
const MIGRATION_TABLE = 'public.schema_migrations';
const ADVISORY_LOCK_NAMESPACE = 'calma_workspace';
const ADVISORY_LOCK_NAME = 'database_migrations';

const CREATE_MIGRATION_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
    version TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

function parseMigrationFilename(filename) {
  const match = /^(\d+)_([a-z0-9][a-z0-9_-]*)\.sql$/i.exec(filename);

  if (!match) {
    return null;
  }

  return {
    filename,
    name: match[2],
    version: BigInt(match[1]).toString(),
    versionValue: BigInt(match[1]),
  };
}

async function loadMigrations(directory = MIGRATIONS_DIRECTORY) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const migrations = [];
  const versions = new Set();

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const migration = parseMigrationFilename(entry.name);

    if (!migration) {
      if (entry.name.endsWith('.sql')) {
        throw new Error(
          `Invalid migration filename "${entry.name}". Expected <version>_<name>.sql.`,
        );
      }

      continue;
    }

    if (versions.has(migration.version)) {
      throw new Error(`Duplicate migration version "${migration.version}".`);
    }

    versions.add(migration.version);

    const filePath = path.join(directory, entry.name);
    const sql = await fs.readFile(filePath, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    migrations.push({
      ...migration,
      checksum,
      sql,
    });
  }

  migrations.sort((left, right) => {
    if (left.versionValue < right.versionValue) {
      return -1;
    }

    if (left.versionValue > right.versionValue) {
      return 1;
    }

    return 0;
  });

  return migrations;
}

async function migrate({
  pool = databasePool,
  migrationsDirectory = MIGRATIONS_DIRECTORY,
} = {}) {
  const migrations = await loadMigrations(migrationsDirectory);
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query('BEGIN');
    transactionStarted = true;

    await client.query(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      [ADVISORY_LOCK_NAMESPACE, ADVISORY_LOCK_NAME],
    );

    await client.query(CREATE_MIGRATION_TABLE_SQL);

    const appliedResult = await client.query(
      `SELECT version, name, checksum
       FROM ${MIGRATION_TABLE}
       ORDER BY version
       FOR UPDATE`,
    );
    const appliedMigrations = new Map(
      appliedResult.rows.map((migration) => [migration.version, migration]),
    );
    const knownVersions = new Set(
      migrations.map((migration) => migration.version),
    );

    for (const existingMigration of appliedMigrations.values()) {
      if (!knownVersions.has(existingMigration.version)) {
        throw new Error(
          `Database migration "${existingMigration.version}" is not present locally.`,
        );
      }
    }

    const applied = [];

    for (const migration of migrations) {
      const existingMigration = appliedMigrations.get(migration.version);

      if (existingMigration) {
        if (
          existingMigration.name !== migration.filename ||
          existingMigration.checksum !== migration.checksum
        ) {
          throw new Error(
            `Applied migration "${migration.version}" does not match ${migration.filename}.`,
          );
        }

        continue;
      }

      await client.query(migration.sql);
      await client.query(
        `INSERT INTO ${MIGRATION_TABLE} (version, name, checksum)
         VALUES ($1, $2, $3)`,
        [migration.version, migration.filename, migration.checksum],
      );
      applied.push(migration.filename);
    }

    await client.query('COMMIT');
    transactionStarted = false;

    return applied;
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }

    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    const applied = await migrate();

    if (applied.length === 0) {
      console.log('Database is already up to date.');
    } else {
      console.log(`Applied migrations: ${applied.join(', ')}`);
    }
  } catch (error) {
    console.error('Database migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await databasePool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadMigrations,
  migrate,
  parseMigrationFilename,
};
