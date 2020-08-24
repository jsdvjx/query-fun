import { QueristType } from './Querist/IQuerist';
import { ItemOption } from './reverse';

export interface Query {
  <T, R = any>(param: T): Promise<R>;
}

export type SqlType = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
export interface Option<T extends SqlType = 'SELECT'> {
  tag: string;
  name: string;
  type: QueristType;
  group: string;
  sql_type: T;
  template: string[];
  parameter: ItemOption[];
  example: any;
  result: {
    single: T extends 'INSERT'
      ? true
      : T extends 'UPDATE'
      ? true
      : T extends 'DELETE'
      ? true
      : boolean;
    type: T extends 'INSERT'
      ? 'number'
      : T extends 'UPDATE'
      ? 'number'
      : T extends 'DELETE'
      ? 'number'
      : 'number' | 'string' | 'date' | 'boolean' | 'object';
    schema?: any;
  };
}
export type ArrayType<Type> = Type extends Array<infer X> ? X : never;
export interface CallerFunOverwrite<P extends any[], R> {
  (...params: P): Promise<R>;
  (params: P): Promise<R>;
}
export type CallerFun<P, R> = P extends any[]
  ? CallerFunOverwrite<P, R>
  : (param: P) => Promise<R>;
export declare type Caller<
  T extends { parameter: Record<string, any>; result: Record<string, any> }
> = {
  [P in keyof T['parameter']]: CallerFun<T['parameter'][P], T['result'][P]>;
};
