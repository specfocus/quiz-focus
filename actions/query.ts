import type { AsyncAction } from '@specfocus/main-focus/actions/async';
import { DataSource } from '../resources/source';

export const QUERY = 'query';

export type QueryActionType = typeof QUERY;

export interface QueryAction extends Omit<AsyncAction, 'atom' | 'type' | 'what'> {
  type: QueryActionType;
  what: QueryWhat;
  where: QueryWhere;
}

// https://medium.com/fasal-engineering/fetching-data-from-different-collections-via-mongodb-aggregation-operations-with-examples-a273f24bfff0
export type QueryWhat<collection extends string = string> = {
  [name in collection]: any;
};

export interface QueryWhere extends DataSource {
}