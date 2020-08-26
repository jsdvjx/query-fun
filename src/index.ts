import { IQuerist, IQueristOpt, QueristType } from './Querist/IQuerist';
import { Option, DynamicInterface, SqlType } from './contract';
import { String2Fun } from './string2fun';
import * as ph from 'path';
import { readFileSync } from 'fs';
export type IWrap<
  T extends Record<string, Record<string, { RESULT: any; PARAMETER: any }>>
> = {
  [K in keyof T]: DynamicInterface<T[K]>;
};
export default class QueryFun {
  static register = IQuerist.create;
  private static create = (opt: Option) => {
    return async (...params: any[]) => {
      return IQuerist.get(opt.tag, opt.type)
        .query(
          QueryFun.getSqlHandler(opt)(
            params.length === 1 ? params.pop() : params,
          ),
        )
        .then((i) => {
          return opt.result.__single ? i.pop() : i;
        });
    };
  };
  static build = <
    T extends Record<string, Record<string, { RESULT: any; PARAMETER: any }>>
  >(
    list: string[],
    path?: string,
  ): ((
    ...args: {
      opt: IQueristOpt<any, QueristType>;
      cls?: any;
    }[]
  ) => Promise<(fresh?: boolean) => IWrap<T>>) => {
    return async (...args) => {
      for (const item of args) {
        await QueryFun.register(item.opt, item.cls).init();
      }
      return () => {
        if (Object.values(QueryFun.repo).length > 0) {
          return QueryFun.repo as any;
        }
        return list.reduce((result, name) => {
          result[name as keyof T] = QueryFun.get(name, path);
          return result;
        }, {} as IWrap<T>);
      };
    };
  };
  private static repo: Record<string, Record<string, any>> = {};
  private static get = (name: string, path?: string): any => {
    if (!path) {
      path = './';
    }
    path = ph.resolve(path, name as string, `${name}.Q.json`);
    if (!QueryFun.repo[path]) {
      const { list } = JSON.parse(readFileSync(path).toString()) as {
        group: string;
        list: Option[];
      };
      QueryFun.repo[path] = list.reduce((result, acc) => {
        result[acc.name] = QueryFun.create(acc);
        return result;
      }, {} as Record<string, any>);
    }
    return QueryFun.repo[path] as any;
  };
  static getDemo = (opt: Option): Promise<any> => {
    return QueryFun.create({ ...opt, template: [...opt.template, 'limit 10'] })(
      opt.example,
    );
  };
  private static getSqlHandler = (opt: Option) => {
    const sql =
      typeof opt.template === 'string' ? opt.template : opt.template.join('\n');
    return String2Fun.create(sql);
  };
}
