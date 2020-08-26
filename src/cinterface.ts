import Mustache = require('mustache');
import { readFileSync } from 'fs';
import { ItemOption } from './reverse';
import * as ph from 'path';

export class CInterface {
  static staticType = ['string', 'number', 'date', 'boolean', 'object'];
  private static fstUpperCase = (str: string) => {
    return `${str[0].toUpperCase()}${str.substr(1)}`;
  };
  static export = (groups: string[], path: string): string => {
    return Mustache.render(
      readFileSync(
        ph.resolve(__filename, '../../template/export.mustache'),
      ).toString(),
      {
        groups: groups.map((i) => `\`${i}\``).join(','),
        path: `${path.replace(/\\/g,`\\\\`)}`,
      },
    );
  };
  static render = (opt: ItemOption): string => {
    return Mustache.render(
      readFileSync(
        ph.resolve(__filename, '../../template/object.mustache'),
      ).toString(),
      {
        ...opt,
        fields: opt.fields.map((i) => ({
          ...i,
          type:
            i.type === 'object'
              ? CInterface.fstUpperCase(i.ref)
              : i.type === 'date'
              ? 'Dayjs'
              : i.type,
        })),
        name: CInterface.fstUpperCase(opt.name),
        ...(opt.fields.length === 0
          ? {
              __array: false,
              __single: true,
              __object: false,
              fields: [{ key: 'result', type: 'void' }],
            }
          : {}),
      },
    );
  };
  static interface = (group: string, list: string[]): string => {
    const template = readFileSync(
      ph.resolve(__filename, '../../template/interface.mustache'),
    ).toString();
    return Mustache.render(template, {
      name: CInterface.fstUpperCase(group),
      list: list.map((i) => ({ name: i, type: CInterface.fstUpperCase(i) })),
    });
  };
}
