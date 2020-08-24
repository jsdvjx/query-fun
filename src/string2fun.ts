import Mustache = require('mustache');
import { Reverse, ItemOption } from './reverse';
import { readFileSync } from 'fs';
import { CInterface } from './cinterface';

export class String2Fun {
  static create = <P>(str: string) => {
    return (params: P): string => {
      return Mustache.render(str, params);
    };
  };

  private static complie = (options: ItemOption[]) => {
    if (options.length === 1 && options[0].fields.length === 1) {
      const tmp = options[0];
      tmp.__object = false;
      tmp.__single = true;
      return [tmp];
    }
    if (
      options.length === 2 &&
      options[1].fields.length === 1 &&
      options[1].fields[0].type === options[0].name + '[]'
    ) {
      const [sub, root] = options;
      const tmp = {
        name: `${root.name}`,
        fields: sub.fields,
        __array: true,
        __object: true,
        __single: false,
      };
      return [tmp];
    }
    return options;
  };
  static getInterface = (str: string, name: string): string => {
    return String2Fun.getItemOptions(str, name)
      .parameter.map(CInterface.render)
      .join('\n');
  };
  static getItemOptions = (
    str: string,
    name: string,
  ): { parameter: ItemOption[]; example: any } => {
    const result = Reverse.get(str, name);
    return {
      parameter: String2Fun.complie(result.options),
      example: result.example,
    };
  };
}
