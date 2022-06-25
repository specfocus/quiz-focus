import {
  createQueryOperation, NamedGroupOperation, Options, Query
} from "../core";
import { Key } from "../utils";

export class $And extends NamedGroupOperation {
  constructor(
    params: Query<any>[],
    owneryQuery: Query<any>,
    options: Options,
    name: string
  ) {
    super(
      params,
      owneryQuery,
      options,
      params.map(query => createQueryOperation(query, owneryQuery, options)),
      name
    );
  }
  next(item: any, key: Key, owner: any) {
    this.childrenNext(item, key, owner);
  }
}

export const $and = (
  params: Query<any>[],
  ownerQuery: Query<any>,
  options: Options,
  name: string
) => new $And(params, ownerQuery, options, name);