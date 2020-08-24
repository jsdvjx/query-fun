import { IQuerist } from './IQuerist';

import * as pg from 'pg';
export class Postgressql extends IQuerist<pg.ClientConfig> {
  type = 'POSTGRESQL';
  private client: pg.Client;
  close: () => void = () => {
    this.client.end();
  };
  query: <R = any>(sql: string) => Promise<R[]> = async <R = any>(
    sql: string,
  ): Promise<R[]> => {
    return this.client.query(sql).then((result) => {
      switch (result.command) {
        case 'SELECT':
          return result.rows as any;
        case 'DO':
          return null;
        case 'UPDATE':
        case 'INSERT':
          return [result.rowCount];
      }
    });
  };
  init: () => Promise<boolean> = async () => {
    if (this.client) return Promise.resolve(true);
    this.client = new pg.Client(this.config.option);
    return this.client
      .connect()
      .then(() => true)
      .catch(() => false);
  };
}
