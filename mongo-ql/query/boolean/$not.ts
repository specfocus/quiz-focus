import { createQueryOperation, NamedBaseOperation, Options, Query, QueryOperation } from '../core';
import { Key } from "../utils";

export class $Not extends NamedBaseOperation<Query<any>> {
  private _queryOperation!: QueryOperation<any>;
  init() {
    this._queryOperation = createQueryOperation(
      this.params,
      this.owneryQuery,
      this.options
    );
  }
  reset() {
    this._queryOperation.reset();
  }
  next(item: any, key: Key, owner: any) {
    this._queryOperation.next(item, key, owner);
    this.done = this._queryOperation.done;
    this.keep = !this._queryOperation.keep;
  }
}

export const $not = (
  params: any,
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Not(params, owneryQuery, options, name);