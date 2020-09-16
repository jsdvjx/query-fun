#!/usr/bin/env node
import { program } from 'commander';
import * as ph from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { IQueristOpt } from '../Querist/IQuerist';
import QueryFun from '../';
import { Sql2Option } from '../sql2option';
import { Reverse } from '../reverse';
import { SqlType, Option } from '../contract';
import { CInterface } from '../cinterface';
const path = process.cwd();
const imports = [
  `import { Dayjs } from 'dayjs';`,
  `import QueryFun,{IWrap} from '@jsdvjx/query-fun'`,
  '',
];
const getConfig = (path: string) => {
  try {
    return JSON.parse(readFileSync(path).toString()) as {
      path: string;
      config: IQueristOpt<any, any>[];
      output: string;
    };
  } catch (e) {
    return null;
  }
};
program
  .version('0.1.0')
  .option('-c, --config <string>', 'config path', ph.join(path, '.query.json'))
  .description('build template')
  .action(async (cmd, [, target]) => {
    const config = getConfig(cmd.config);
    if (config) {
      for (const conf of config.config) {
        await QueryFun.register(conf).init();
      }
      const opts = Sql2Option.load(config.path, target || '*');
      const buildJson = (options: Record<string, Option<SqlType>[]>) => (
        Sql2Option.update(config.path, options), options
      );
      const buildInterface = (options: Record<string, Option<SqlType>[]>) => {
        const p = Object.entries(options).map(([group, list]) => {
          return [group, list.map((i) => i.name)] as [string, string[]];
        });
        return Object.values(options)
          .map((i) =>
            i.reduce(
              (result, acc) => [...result, ...acc.parameter, acc.result],
              [] as Option['result'][],
            ),
          )
          .flat()
          .map(CInterface.render)
          .concat(
            ...p.map(([group, list]) => CInterface.interface(group, list)),
          )
          .concat(
            CInterface.export(
              p.map(([group]) => group),
              config.path,
            ),
          )
          .join('\n');
      };

      Promise.all(
        Object.entries(opts).map(([group, list]) => {
          return Promise.all(
            list.map((i) =>
              i.sql_type === 'SELECT'
                ? QueryFun.getDemo(i as any).then(
                    (r) => (
                      (i.result = Reverse.objToItem(
                        r[0] || {},
                        `${i.name}Result`,
                      )),
                      i
                    ),
                  )
                : Promise.resolve({
                    ...i,
                    result: { ...i.result, name: `${i.name}Result` },
                  }),
            ),
          ).then((i) => [group, i] as [string, Option<SqlType>[]]);
        }),
      )
        .then(Object.fromEntries)
        .then(buildJson)
        .then(buildInterface)
        .then((result) => {
          writeFileSync(
            ph.resolve(config.output, 'Querist.ts'),
            imports.join('\n\n') + result,
          );
          process.exit(0);
        });
    } else {
      console.error(`can't find  config from [${cmd.config}]`);
      return;
    }
  })
  .parse(process.argv);
