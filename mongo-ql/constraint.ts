import { $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin } from './query/comparison';
import { $exists } from './query/element';
import { $and, $nor, $not, $or } from './query/logical';

type Logical<T extends {}> = {
  [$and]?: Array<Constraint<T>>;
  [$nor]?: Array<Constraint<T>>;
  [$not]?: Constraint<T> | Array<Constraint<T>>;
  [$or]?: Array<Constraint<T>>;
};

export type ComparisonObject<T = number | string> =
  | { [$eq]: T; }
  | { [$exists]: boolean; }
  | { [$gt]: T; }
  | { [$gt]: T;[$lt]: T; }
  | { [$gt]: T;[$lte]: T; }
  | { [$gte]: T; }
  | { [$gte]: T;[$lt]: T; }
  | { [$gte]: T;[$lte]: T; }
  | { [$in]: T[]; }
  | { [$lt]: T; }
  | { [$lte]: T; }
  | { [$ne]: T;[$exists]?: true; }
  | { [$nin]: T[];[$exists]?: true; };

export type ComparisonTuple<T> =
  | [typeof $exists, boolean]
  | [typeof $eq, T]
  | [typeof $gt, T]
  | [typeof $gte, T]
  | [typeof $in, ...T[]]
  | [typeof $lt, T]
  | [typeof $lte, T]
  | [typeof $ne, T]
  | [typeof $nin, ...T[]];

export type Comparison<T> = ComparisonTuple<T> | ComparisonObject<T>;

export type ConstraintTuple<T extends {}, P extends keyof T> =
  | [typeof $exists, P, boolean]
  | [typeof $eq, P, T[P]]
  | [typeof $gt, P, T[P]]
  | [typeof $gte, P, T[P]]
  | [typeof $in, P, T[P], ...T[P][]]
  | [typeof $lt, P, T[P]]
  | [typeof $lte, P, T[P]]
  | [typeof $ne, P, T[P]]
  | [typeof $nin, P, T[P], ...T[P][]];

export type Constraint<T extends {}> = {
  [P in keyof T]?: Comparison<T[P]> | typeof $exists | AltConstraint<T[P]>;
} | Logical<T> | ConstraintTuple<T, keyof T>;

export type AltConstraint<T> = AltLogical<T> | AltLogicalTuple<T> | ComparisonTuple<T> | AltConstraintTuple<T>;

export type AltConstraintTuple<T> =
  | [typeof $exists, T, boolean]
  | [typeof $eq, T]
  | [typeof $gt, T]
  | [typeof $gte, T]
  | [typeof $in, T, ...T[]]
  | [typeof $lt, T]
  | [typeof $lte, T]
  | [typeof $ne, T]
  | [typeof $nin, T, ...T[]];

export type AltLogical<T> = {
  [$and]?: Array<AltConstraint<T>>;
  [$nor]?: Array<AltConstraint<T>>;
  [$not]?: AltConstraint<T> | Array<AltConstraint<T>>;
  [$or]?: Array<AltConstraint<T>>;
};

export type AltLogicalTuple<T> =
  | [AltConstraint<T>, ...AltConstraint<T>[]] // same as $and
  | [typeof $and, AltConstraint<T>, ...AltConstraint<T>[]]
  | [typeof $nor, AltConstraint<T>, ...AltConstraint<T>[]]
  | [typeof $not, AltConstraint<T>, ...AltConstraint<T>[]]
  | [typeof $or, AltConstraint<T>, ...AltConstraint<T>[]];