import { IQuerist } from './Querist/IQuerist';
import { Option } from './contract';
import { String2Fun } from './string2fun';

export default class QueryFun {
  static register = IQuerist.create;
  private create = (opt: Option) => {
    return async (...params: any[]) => {
      return IQuerist.get(opt.tag, opt.type)
        .query(
          this.getSqlHandler(opt)(params.length === 1 ? params.pop() : params),
        )
        .then((i) => (opt.result.single ? i.pop() : i));
    };
  };
  private getSqlHandler = (opt: Option) => {
    const sql =
      typeof opt.template === 'string' ? opt.template : opt.template.join('\n');
    return String2Fun.create(sql);
  };
}
