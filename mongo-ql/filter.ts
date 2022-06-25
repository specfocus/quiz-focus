import { Model } from '@specfocus/spec-focus/shapes/model';
import { SimpleObject } from '@specfocus/spec-focus/objects';
import { RECORD } from '@specfocus/spec-focus/shapes/record';
import { Constraint } from './constraint';

type Tuple<T extends {}, K extends keyof T> = [K, T[K]];

export interface Filter<T extends SimpleObject> {
  $eq: Tuple<T, keyof T>;
}

export const createFilterModel = <T extends {}, C extends Constraint<T>>(
  name: string,
  model: Model<T>,
  description: string
): Model<C> => {
  const fields: any = {
    $or: {
      type: ['Something', RECORD]
    }
  };

  return {
    area: model.area,
    name,
    hint: description,
    fields
  };
};
