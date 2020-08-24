import { IQuerist } from './IQuerist';

import * as _mysql from 'mysql2';
export class mysql extends IQuerist<_mysql.ConnectionOptions> {
  type = 'MYSQL';
  close: () => void = () => {
    this.client.destroy();
  };
  query: <R = any>(sql: string) => Promise<R[]> = (sql) => {
    const result = [];
    return new Promise((resolve, reject) => {
      this.client
        .query(sql)
        .on('result', (row) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          if (row.constructor.name !== 'TextRow') {
            result.push(row.affectedRows || 0);
          } else {
            result.push(row);
          }
        })
        .on('error', (e) => (console.error(sql, 'MYSQL_ERROR'), reject(e)))
        .on('end', () => resolve(result as any));
    });
  };
  private client: _mysql.Connection;
  init: () => Promise<boolean> = () => {
    if (this.client) return Promise.resolve(true);
    this.client = _mysql.createConnection(this.config.option);
    return new Promise((resolve, reject) => {
      this.client.connect((e) => {
        if (e) {
          reject(e);
        } else resolve(true);
      });
    });
  };
}
