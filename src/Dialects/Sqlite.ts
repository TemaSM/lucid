/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { DialectContract, QueryClientContract } from '@ioc:Adonis/Lucid/Database'

export class SqliteDialect implements DialectContract {
  public readonly name = 'sqlite3'
  public readonly supportsAdvisoryLocks = false

  /**
   * Reference to the database version. Knex.js fetches the version after
   * the first database query, so it will be set to undefined initially
   */
  public readonly version = this.client.getReadClient()['context']['client'].version

  /**
   * The default format for datetime column. The date formats is
   * valid for luxon date parsing library
   */
  public readonly dateTimeFormat = 'yyyy-MM-dd HH:mm:ss'

  constructor(private client: QueryClientContract) {}

  /**
   * Returns an array of table names
   */
  public async getAllTables() {
    const tables = await this.client
      .query()
      .from('sqlite_master')
      .select('name as table_name')
      .where('type', 'table')
      .whereNot('name', 'like', 'sqlite_%')
      .orderBy('name', 'asc')

    return tables.map(({ table_name }) => table_name)
  }

  /**
   * Truncate SQLITE tables
   */
  public async truncate(table: string, _: boolean) {
    return this.client.knexQuery().table(table).truncate()
  }

  /**
   * Drop all tables inside the database
   */
  public async dropAllTables() {
    await this.client.rawQuery('PRAGMA writable_schema = 1;')
    await this.client.rawQuery(
      `delete from sqlite_master where type in ('table', 'index', 'trigger');`
    )
    await this.client.rawQuery('PRAGMA writable_schema = 0;')
    await this.client.rawQuery('VACUUM;')
  }

  /**
   * Attempts to add advisory lock to the database and
   * returns it's status.
   */
  public getAdvisoryLock(): Promise<boolean> {
    throw new Error("Sqlite doesn't support advisory locks")
  }

  /**
   * Releases the advisory lock
   */
  public releaseAdvisoryLock(): Promise<boolean> {
    throw new Error("Sqlite doesn't support advisory locks")
  }
}
