import { IQuerist } from './IQuerist';

import SlsClient, { LogConfig } from 'sls-client';
import dayjs = require('dayjs');
export default class sls extends IQuerist<LogConfig> {
  type = 'SLS';
  close: () => void = () => {
    console.log('has not implement');
  };
  query: <R = any>(sql: string) => Promise<R[]> = (sql) => {
    const params = this.getQueryOption(sql);
    return this.client.getLogs(params).toPromise() as any;
  };
  private client: SlsClient;
  init: () => Promise<boolean> = () => {
    if (this.client) return Promise.resolve(true);
    this.client = new SlsClient(this.config.option);
    return Promise.resolve(true);
  };
  private getQueryOption = (sql: string) => {
    const [from, to, filter, _sql] = sql.split('|');
    const f = 'YYYY-MM-DD HH:mm:ss';
    return {
      from: dayjs(from, f).unix(),
      to: (to === 'now' ? dayjs() : dayjs(to, f)).unix(),
      query: `${filter}|${_sql}`,
    };
  };
}
