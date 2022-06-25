import { Model } from '@specfocus/spec-focus/contracts/shape/model';
import { SimpleObject } from '@specfocus/spec-focus/contracts/object';
import { Constraint } from './constraint';

export interface ModelWithRules<T extends {} = SimpleObject> extends Model {
  rules: Constraint<T>;
}
