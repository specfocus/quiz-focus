/** Comparison Expression Operators
 * 
 *  Comparison expressions return a boolean except for $cmp which returns a number.
 * 
 *  The comparison expressions take two argument expressions and compare both value and type, using the specified BSON comparison order for values of different types.
 */

import { BooleanLikeExpression } from '../boolean';
import { DateLikeExpression } from '../date';
import { NumberLikeExpression } from '../number';
import { StringLikeExpression } from '../string';

/** Returns 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second. */
export const $cmp = "$cmp";

/** Returns true if the values are equivalent. */
export const $eq = "$eq";

/** Returns true if the first value is greater than the second. */
export const $gt = "$gt";

/** Returns true if the first value is greater than or equal to the second. */
export const $gte = "$gte";

/** Returns true if the first value is less than the second. */
export const $lt = "$lt ";

/** Returns true if the first value is less than or equal to the second. */
export const $lte = "$lte";

/** Returns true if the values are not equivalent. */
export const $ne = "$ne";

const COMPARISON_OPERATORS = [
  $cmp,
  $eq,
  $gt,
  $gte,
  $lt,
  $lte,
  $ne
] as const;

export type ComparisonExpressionOperator = typeof COMPARISON_OPERATORS[number];

export const isComparisonExpressionOperator = (
  val: any
): val is ComparisonExpressionOperator => val in COMPARISON_OPERATORS;

type BinaryExpression<E, K, V> = { E: [K, V]; };
type BooleanLike = boolean | BooleanLikeExpression;
type DateLike = Date | DateLikeExpression;
type NumberLike = number | NumberLikeExpression;
type StringLike = number | StringLikeExpression;

/** Returns 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second. */
export type $cmpExpression = { [$cmp]: [BooleanLike, BooleanLike]; };

/** Returns true if the values are equivalent. */
export type $eqExpression =
  | { [$eq]: [BooleanLike, BooleanLike]; }
  | { [$eq]: [DateLike, DateLike]; }
  | { [$eq]: [DateLike, NumberLike]; }
  | { [$eq]: [StringLike, StringLike]; };

/** Returns true if the first value is greater than the second. */
export type $gtExpression =
  | { [$gt]: [BooleanLike, BooleanLike]; }
  | { [$gt]: [DateLike, DateLike]; }
  | { [$gt]: [NumberLike, NumberLike]; }
  | { [$gt]: [StringLike, StringLike]; };

/** Returns true if the first value is greater than or equal to the second. */
export type $gteExpression =
  | { [$gte]: [BooleanLike, BooleanLike]; }
  | { [$gte]: [DateLike, DateLike]; }
  | { [$gte]: [NumberLike, NumberLike]; }
  | { [$gte]: [StringLike, StringLike]; };

/** Returns true if the first value is less than the second. */
export type $ltExpression =
  | { [$lt]: [BooleanLike, BooleanLike]; }
  | { [$lt]: [DateLike, DateLike]; }
  | { [$lt]: [NumberLike, NumberLike]; }
  | { [$lt]: [StringLike, StringLike]; };

/** Returns true if the first value is less than or equal to the second. */
export type $lteExpression =
  | { [$lte]: [BooleanLike, BooleanLike]; }
  | { [$lte]: [DateLike, DateLike]; }
  | { [$lte]: [NumberLike, NumberLike]; }
  | { [$lte]: [StringLike, StringLike]; };

/** Returns true if the values are not equivalent. */
export type $neExpression =
  | { [$ne]: [BooleanLike, BooleanLike]; }
  | { [$ne]: [DateLike, DateLike]; }
  | { [$ne]: [NumberLike, NumberLike]; }
  | { [$ne]: [StringLike, StringLike]; };

export type ComparisonExpression =
  | $cmpExpression
  | $eqExpression
  | $gtExpression
  | $gteExpression
  | $ltExpression
  | $lteExpression
  | $neExpression;
