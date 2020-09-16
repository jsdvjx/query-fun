import * as ph from 'path';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { SqlType, Option } from './contract';
import { QueristType } from './Querist/IQuerist';
import { String2Fun } from './string2fun';
export class Sql2Option {
  static create = (
    content: string,
    group: string,
    name: string,
  ): Option<SqlType> => {
    const baseinfo = { group, name };
    const sqlAndTag = Sql2Option.getSqlAndTag(content);
    const sql = sqlAndTag.template.join('\n');
    const sql_type = Sql2Option.getSqlType(sql);
    const tmp = String2Fun.getItemOptions(sql, baseinfo.name + 'Parameter');
    const exp = (_exp: Record<string, any>) => {
      if (Object.keys(_exp).length === 1) {
        return Object.values(_exp).pop();
      }
      return _exp;
    };
    return {
      ...sqlAndTag,
      template: sqlAndTag.template.map((i) => i.replace(/{\[.+?\]}/g, '')),
      sql_type,
      ...tmp,
      ...baseinfo,
      example: exp(tmp.example),
      result: Sql2Option.getResult(sql_type),
    };
  };
  static load = (
    path: string,
    filter = '*',
  ): Record<string, Option<SqlType>[]> => {
    const f = (group: string, name: string) => {
      if (filter === '*') return true;
      const [g, n] = filter.split('.');
      if (g && g === group) {
        if (!n) {
          return true;
        } else if (
          n === '*' ||
          `${n}.mustache`.toLowerCase() === name.toLowerCase()
        ) {
          return true;
        }
      }
      return false;
    };
    return Object.fromEntries(
      readdirSync(path).map((group) => {
        const groupPath = ph.join(path, group);
        const reg = /\.mustache$/i;
        return [
          group,
          readdirSync(groupPath)
            .filter((i) => reg.test(i))
            .filter((i) => f(group, i))
            .map((file) => {
              const content = readFileSync(ph.join(groupPath, file)).toString();
              const name = file.replace(reg, '');
              return Sql2Option.create(content, group, name);
            }),
        ];
      }),
    );
  };
  private static getDist = (path: string, group: string) => {
    return ph.join(path, group, `${group}.Q.json`);
  };

  static update = (
    path: string,
    map: Record<string, Option<SqlType>[]>,
  ): void => {
    Object.entries(map).map(([group, list]) => {
      const dist = Sql2Option.getDist(path, group);
      if (existsSync(dist)) {
        const result = JSON.parse(readFileSync(dist).toString()) as {
          group: string;
          list: Option<SqlType>[];
        };
        const set = new Set(list);
        result.list.forEach((i, idx) => {
          for (const item of list) {
            if (i.name === item.name) {
              set.delete(item);
              Object.entries(i.result)
                .filter(([key]) => key.startsWith('__'))
                .forEach(([key, value]) => {
                  item.result[key] = value;
                });
              result.list[idx] = item;
              return;
            }
          }
        });
        if (set.size > 0) {
          result.list.push(...Array.from(set));
        }
        writeFileSync(dist, JSON.stringify(result, null, 2));
      } else {
        writeFileSync(dist, JSON.stringify({ group, list }, null, 2));
      }
    });
  };
  static loadAndSync = (path: string): void => {
    const map = Sql2Option.load(path);
    Object.entries(map).map(([group, list]) => {
      writeFileSync(
        ph.join(path, group, `${group}.Q.json`),
        JSON.stringify({ group, list }, null, 2),
      );
    });
  };

  private static getSqlType = (sql: string): SqlType => {
    const types: SqlType[] = ['INSERT', 'DELETE', 'SELECT', 'SELECT'];
    return (
      types
        .map((i) => ({ type: i, reg: new RegExp(`^${i}`, 'i') }))
        .filter((i) => i.reg.test(sql))
        .pop() || { type: 'SELECT' }
    ).type;
  };
  private static getResult = (sqlType: SqlType): Option['result'] => {
    return {
      name: 'Result',
      __array: sqlType === 'SELECT',
      __single: sqlType !== 'SELECT',
      __object: sqlType === 'SELECT',
      fields: [
        {
          key: 'row',
          type: 'number',
        },
      ],
    };
  };
  private static getSqlAndTag = (
    content: string,
  ): { tag: string; type: QueristType; template: string[] } => {
    const template = content.split('\n');
    let fstLine = template.shift().trim();
    if (!/^[a-zA-Z,]+$/.test(fstLine)) {
      console.error(`template error "${fstLine}" not match "type,tag" `);
      fstLine = 'mysql,default';
    }
    const typeAndTag = fstLine.split(',').map((i) => i.trim());
    return {
      tag: typeAndTag[1],
      type: typeAndTag[0] as QueristType,
      template,
    };
  };
}
