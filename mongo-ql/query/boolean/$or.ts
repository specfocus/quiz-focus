

import {
  createQueryOperation, NamedBaseOperation, Operation, Options, Query
} from "../core";
import { Key } from "../utils";

export class $Or extends NamedBaseOperation<any> {
  private _ops!: Operation<any>[];
  init() {
    this._ops = this.params.map((op: any) =>
      createQueryOperation(op, null, this.options)
    );
  }
  reset() {
    this.done = false;
    this.keep = false;
    for (let i = 0, { length } = this._ops; i < length; i++) {
      this._ops[i].reset();
    }
  }
  next(item: any, key: Key, owner: any) {
    let done = false;
    let success = false;
    for (let i = 0, { length } = this._ops; i < length; i++) {
      const op = this._ops[i];
      op.next(item, key, owner);
      if (op.keep) {
        done = true;
        success = op.keep;
        break;
      }
    }

    this.keep = success;
    this.done = done;
  }
}

export const $or = (
  params: Query<any>[],
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Or(params, owneryQuery, options, name);