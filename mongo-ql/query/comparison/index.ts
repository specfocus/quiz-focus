/** Comparison Expression Operators
 * 
 *  Comparison expressions return a boolean except for $cmp which returns a number.
 * 
 *  The comparison expressions take two argument expressions and compare both value and type, using the specified BSON comparison order for values of different types.
 */

import { BooleanLikeExpression } from '../../boolean';
import { DateLikeExpression } from '../../date';
import { NumberLikeExpression } from '../../number';
import { StringLikeExpression } from '../../string';

/** Matches values that are equal to a specified value. */
export const $eq = "$eq";

/** Matches values that are greater than a specified value. */
export const $gt = "$gt";

/** Matches values that are greater than or equal to a specified value. */
export const $gte = "$gte";

/** Matches any of the values specified in an array.. */
export const $in = "$in";

/** Matches values that are less than a specified value. */
export const $lt = "$lt ";

/** Matches values that are less than or equal to a specified value. */
export const $lte = "$lte";

/** Matches all values that are not equal to a specified value. */
export const $ne = "$ne";

/** Matches none of the values specified in an array. */
export const $nin = "$nin";

const COMPARISON_OPERATORS = [
  $eq,
  $gt,
  $gte,
  $lt,
  $in,
  $lte,
  $ne,
  $nin
] as const;

export type ComparisonQueryOperator = typeof COMPARISON_OPERATORS[number];

export const isComparisonQueryOperator = (
  val: any
): val is ComparisonQueryOperator => val in COMPARISON_OPERATORS;

type BinaryExpression<E, K, V> = { E: [K, V]; } | [E, K, V];
type BooleanLike = boolean | BooleanLikeExpression;
type DateLike = Date | DateLikeExpression;
type NumberLike = number | NumberLikeExpression;
type StringLike = number | StringLikeExpression;

type Query<E, T extends {}, K extends keyof T> =
  T[K] extends boolean ? BinaryExpression<E, K, BooleanLike> :
  T[K] extends Date ? BinaryExpression<E, K, DateLike> :
  T[K] extends number ? BinaryExpression<E, K, NumberLike> :
  T[K] extends string ? BinaryExpression<E, K, StringLike> : never;

/** Matches values that are equal to a specified value. */
export type $eqQuery<T extends {}, K extends keyof T> =
  T[K] extends boolean ? BinaryExpression<typeof $eq, K, BooleanLike> :
  T[K] extends Date ? BinaryExpression<typeof $eq, K, DateLike> :
  T[K] extends number ? BinaryExpression<typeof $eq, K, NumberLike> :
  T[K] extends string ? BinaryExpression<typeof $eq, K, StringLike> : never;

/** Returns true if the first value is greater than the second. */
export type $gtQuery<T extends {}, K extends keyof T> = Query<typeof $gt, T, K>;

/** Returns true if the first value is greater than or equal to the second. */
export type $gteQuery<T extends {}, K extends keyof T> = Query<typeof $gte, T, K>;;

/** Returns true if the first value is less than the second. */
export type $ltQuery<T extends {}, K extends keyof T> = Query<typeof $lt, T, K>;

/** Returns true if the first value is less than or equal to the second. */
export type $lteQuery<T extends {}, K extends keyof T> = Query<typeof $lte, T, K>;

/** Returns true if the values are not equivalent. */
export type $neQuery<T extends {}, K extends keyof T> = Query<typeof $ne, T, K>;

export type ComparisonQuery<T extends {}, K extends keyof T> =
  | $eqQuery<T, K>
  | $gtQuery<T, K>
  | $gteQuery<T,K>
  | $ltQuery<T, K>
  | $lteQuery<T, K>
  | $neQuery<T, K>;
