import {
  createOperationTester,
  createQueryOperation,
  Options,
  Query,
} from "./core";
import * as defaultOperations from "./operations";

export const createDefaultQueryOperation = <
  TItem,
  TSchema extends TItem = TItem
>(
  query: Query<TSchema>,
  ownerQuery: any,
  { compare, operations }: Partial<Options> = {}
) => {
  return createQueryOperation(query, ownerQuery, {
    compare: compare!,
    operations: Object.assign({}, defaultOperations, operations || {}),
  });
};

const createDefaultQueryTester = <TItem, TSchema extends TItem = TItem>(
  query: Query<TSchema>,
  options: Partial<Options> = {}
) => {
  const op = createDefaultQueryOperation(query, null, options);
  return createOperationTester(op);
};

export default createDefaultQueryTester;
