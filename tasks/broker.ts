import { MutationBroker } from '@specfocus/save-focus/tasks/broker';
import { AlertAction, PatchAction, QueryAction } from '../actions';

export interface StoreBroker extends MutationBroker {
  // https://medium.com/fasal-engineering/fetching-data-from-different-collections-via-mongodb-aggregation-operations-with-examples-a273f24bfff0
  query(what: QueryAction): AsyncIterable<AlertAction | PatchAction>;
}