import * as ph from 'path';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
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
    console.log(JSON.stringify(tmp));
    return {
      ...sqlAndTag,
      template: sqlAndTag.template.map((i) => i.replace(/{\[.+?\]}/g, '')),
      sql_type,
      ...tmp,
      ...baseinfo,
      example: {},
      result: Sql2Option.getResult(sql_type),
    };
  };
  static load = (path: string): Record<string, Option<SqlType>[]> => {
    return Object.fromEntries(
      readdirSync(path).map((group) => {
        const groupPath = ph.join(path, group);
        const reg = /\.mustache$/i;
        return [
          group,
          readdirSync(groupPath)
            .filter((i) => reg.test(i))
            .map((file) => {
              const content = readFileSync(ph.join(groupPath, file)).toString();
              const name = file.replace(reg, '');
              return Sql2Option.create(content, group, name);
            }),
        ];
      }),
    );
  };
  static loadAndSync = (path: string): void => {
    const map = Sql2Option.load(path);
    Object.entries(map).map(([group, list]) => {
      writeFileSync(
        ph.join(path, group, `${group}.qn.json`),
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
      type: sqlType !== 'SELECT' ? 'number' : 'object',
      single: sqlType === 'SELECT',
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
// console.log(
//   JSON.stringify(
//     Sql2Option.create('./query/member/insertMember.mustache'),
//     null,
//     2,
//   ),
// );
console.log(Sql2Option.loadAndSync('./query'));
