import { Options, Query } from "../core";
import { Key } from "../utils";
import { $Or } from './$or';

export class $Nor extends $Or {
  next(item: any, key: Key, owner: any) {
    super.next(item, key, owner);
    this.keep = !this.keep;
  }
}

export const $nor = (
  params: Query<any>[],
  owneryQuery: Query<any>,
  options: Options,
  name: string
) => new $Nor(params, owneryQuery, options, name);