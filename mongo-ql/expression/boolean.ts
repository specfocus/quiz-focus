/**
 * Boolean Expression Operators
 * 
 * Boolean expressions evaluate their argument expressions as booleans 
 * and return a boolean as the result.
 *
 * In addition to the false boolean value, Boolean expression evaluates 
 * as false the following: null, 0, and undefined values. 
 * The Boolean expression evaluates all other values as true, including 
 * non-zero numeric values and arrays.
 */

import { BooleanLikeExpression } from '../boolean';

/** Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions. */
export const $and = "$and";

/** Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression. */
export const $not = "$not";

/** Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions. */
export const $or = "$or";

const BOOLEAN_OPERATORS = [
  $and,
  $not,
  $or,
] as const;

export type BooleanExpressionOperator = typeof BOOLEAN_OPERATORS[number];

export const isBooleanExpressionOperator = (
  val: any
): val is BooleanExpressionOperator => val in BOOLEAN_OPERATORS;

type BooleanLike = BooleanLikeExpression;

/** Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions. */
export type $andExpression = { [$and]: [BooleanLike, ...BooleanLike[]] };

/** Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression. */
export type $notExpression = { [$not]: BooleanLike };

/** Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions. */
export type $orExpression = { [$or]: [BooleanLike, ...BooleanLike[]] };

export type BooleanExpression =
  | $andExpression
  | $notExpression
  | $orExpression;
