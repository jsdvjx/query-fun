import { CInterface } from './cinterface';

export interface Node {
  name: string;
  items?: Node[];
  type: 'object' | 'number' | 'string' | 'date' | 'boolean';
  example?: any;
}
export interface ItemOption {
  name: string;
  fields: { key: string; type: string; ref?: string }[];
  __object: boolean;
  __single: boolean;
  __array: boolean;
}
export class Reverse {
  private static setExample = (node: Node, value: any = null): Node => {
    if (node.type === 'object') {
      node.example = [
        node.items.reduce((result, acc) => {
          result[acc.name] = acc.example ? acc.example : null;
          return result;
        }, {} as any),
      ];
    } else {
      switch (node.type) {
        case 'boolean':
          node.example = value === 'true';
          return node;
        case 'number':
          if (/^\d+\.[\d]+$/.test(value)) {
            node.example = parseFloat(value);
          } else if (/^\d+$/.test(value)) {
            node.example = parseInt(value);
          } else {
            node.example = 1;
          }
          return node;
        case 'date':
        case 'string':
          node.example = value;
          return node;
      }
    }
    return node;
  };
  static get = (
    str: string,
    objName: string,
  ): { options: ItemOption[]; example: any } => {
    const reg = /{{#([a-zA-Z]{2,})}}[\w\W]+?{{\/\1}}/g;

    const getNodes = (sub: string) => {
      const items = (sub.match(/{{([a-zA-Z_]+?)}}/g) || []).map((i) => {
        const name = i.replace('{{', '').replace('}}', '');

        const value = (sub.match(
          new RegExp(`{{${name}}}{\\[(.+?)\\]}`, 'i'),
        ) || [, null])[1];
        const type = Reverse.guessType(value || 'string');
        const result = {
          name,
          type,
        } as Node;
        return Reverse.setExample(result, value);
      });
      const name = (sub.match(/{{#([a-zA-Z]+?)}}/) || [, objName])[1];
      const result = {
        name,
        items,
        type: items.length > 1 ? 'object' : 'string',
      } as Node;
      return Reverse.setExample(result);
    };
    const groupByName = (result: Record<string, Node>, acc: Node) => {
      if (acc.name !== objName) {
        result[acc.name] = result[acc.name] ? result[acc.name] : acc;
        if (result[acc.name] != acc) {
          const names = (result[acc.name].items || []).map((i) => i.name);
          result[acc.name].items = result[acc.name].items.concat(
            acc.items.filter((i) => !names.includes(i.name)),
          );
        }
      }
      return result;
    };
    const sub = Object.values(
      (str.match(reg) || []).map(getNodes).reduce(groupByName, {}),
    );
    const lastStr = sub.reduce((result, item) => {
      return result.replace(
        new RegExp(`{{#${item.name}}}[\\w\\W]+?{{/${item.name}}}`, 'g'),
        '',
      );
    }, str);
    const root = getNodes(lastStr);
    root.items = root.items.concat(sub);
    const options = Reverse.toItem(root);
    return {
      options,
      example: root.items.reduce((result, acc) => {
        result[acc.name] = acc.example;
        return result;
      }, {}),
    };
  };
  private static guessType = (str: string) => {
    if (/^\d+$/.test(str)) {
      return 'number';
    }
    if (
      /^[\d]{4}-[\d]{1,2}-[\d]{1,2}$/.test(str) ||
      /^[\d]{4}-[\d]{1,2}-[\d]{1,2} ([\d]{2})-([\d]{2})-([\d]{2})$/.test(str)
    ) {
      return 'date';
    }
    if (
      str.toLocaleLowerCase() === 'true' ||
      str.toLocaleLowerCase() === 'false'
    ) {
      return 'boolean';
    }
    return 'string';
  };
  private static toItem = (node: Node): ItemOption[] => {
    return [
      {
        __array: false,
        __object: true,
        __single: false,
        name: node.name,
        fields: (node.items || []).map((node) => {
          const type = CInterface.staticType.includes(node.type)
            ? node.type
            : `object`;
          return {
            key: node.name,
            type,
            ...(type === 'object' ? { ref: node.name + '[]' } : {}),
          };
        }),
      } as ItemOption,
    ]
      .concat(
        ...(node.items || [])
          .filter((i) => i.type === 'object')
          .map(Reverse.toItem),
      )
      .reverse();
  };
}
