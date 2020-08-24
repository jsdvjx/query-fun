import Mustache = require('mustache');
import { readFileSync } from 'fs';
import { ItemOption } from './reverse';

export class CInterface {
  static staticType = ['string', 'number', 'date', 'boolean'];
  private static fstUpperCase = (str: string) => {
    return `${str[0].toUpperCase()}${str.substr(1)}`;
  };
  static render = (opt: ItemOption): string => {
    return Mustache.render(
      readFileSync('./template/object.mustache').toString(),
      {
        ...opt,
        fields: opt.fields.map((i) => ({
          ...i,
          type: CInterface.staticType.includes(i.type)
            ? i.type
            : CInterface.fstUpperCase(i.type),
        })),
        name: CInterface.fstUpperCase(opt.name),
      },
    );
  };
}
