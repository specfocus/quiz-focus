import {
  EqualsOperation,
  Options, Query
} from "../core";

export const $eq = (params: any, owneryQuery: Query<any>, options: Options) =>
  new EqualsOperation(params, owneryQuery, options);
