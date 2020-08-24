export type QueristType = 'mysql' | 'postgresql' | 'sls' | 'other';
export type IQueristOpt<
  T extends Record<string, any> = Record<string, any>,
  Q extends QueristType = 'other'
> = {
  tag: string;
  type: QueristType;
  option: T;
  class_path: Q extends 'other' ? string : undefined;
};
export abstract class IQuerist<T extends Record<string, any>> {
  abstract type: string;
  constructor(protected config: IQueristOpt<T>) {}
  abstract close: () => void;
  abstract query: <R = any>(sql: string) => Promise<R[]>;
  abstract init: () => Promise<boolean>;
  static pool: Record<string, IQuerist<any>>;
  static create = <O extends IQueristOpt>(
    option: O,
    cls?: new (option: O) => IQuerist<O>,
  ): IQuerist<O> => {
    const key = `${option.type}_${option.tag}`;
    if (!cls) {
      const path = `./${option.type.toLocaleLowerCase()}`;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        cls = (require(option.class_path || path) as {
          default: new (option: O) => IQuerist<O>;
        }).default;
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    if (!IQuerist.pool[key]) {
      IQuerist.pool[key] = new cls(option);
    }
    return IQuerist.pool[key];
  };
  private static getKey = (tag: string, type: string) => {
    return `${type}_${tag}`;
  };
  static get = (tag: string, type?: string): IQuerist<any> => {
    if (!type) {
      return Object.entries(IQuerist.pool).some(([key]) =>
        key.startsWith(tag),
      )[1];
    }
    return IQuerist.pool[IQuerist.getKey(tag, type)];
  };
}
