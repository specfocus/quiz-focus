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

import { ComparisonQuery } from './comparison';

/** The $and operator performs a logical AND operation on an array of one or more expressions (e.g. <expression1>, <expression2>, etc.) and selects the documents that satisfy all the expressions in the array. The $and operator uses short-circuit evaluation. If the first expression (e.g. <expression1>) evaluates to false, MongoDB will not evaluate the remaining expressions.
 * Syntax: { $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and */
export const $and = "$and";

/** The $nor operator performs a logical NOR operation on an array of one or more query expression and selects the documents that fail all the query expressions in the array. The $nor has the following syntax:
 * { $nor: [ { <expression1> }, { <expression2> }, ...  { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/nor/#op._S_nor */
export const $nor = "$nor";

/** The $not operator performs a logical NOT operation on the specified <operator-expression> and selects the documents that do not match the <operator-expression>. This includes documents that do not contain the field.
 * Syntax: { field: { $not: { <operator-expression> } } }
 * @see https://docs.mongodb.com/manual/reference/operator/query/not/#op._S_not */
export const $not = "$not";

/** The $or operator performs a logical OR operation on an array of two or more <expressions> and selects the documents that satisfy at least one of the <expressions>. The $or has the following syntax:
 * { $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/or/#op._S_or */
export const $or = "$or";

const LOGICAL_OPERATORS = [
  $and,
  $not,
  $or,
] as const;

export type LogicalQueryOperator = typeof LOGICAL_OPERATORS[number];

export const isBooleanExpressionOperator = (
  val: any
): val is LogicalQueryOperator => val in LOGICAL_OPERATORS;

type BooleanLike<T extends {}, K extends keyof T> = ComparisonQuery<T, K>;

/** The $and operator performs a logical AND operation on an array of one or more expressions (e.g. <expression1>, <expression2>, etc.) and selects the documents that satisfy all the expressions in the array. The $and operator uses short-circuit evaluation. If the first expression (e.g. <expression1>) evaluates to false, MongoDB will not evaluate the remaining expressions.
 * Syntax: { $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and */
export type $andQuery<T extends {}, K extends keyof T> =
  | { [$and]: [BooleanLike<T,K>, ...BooleanLike<T,K>[]]; }
  | [typeof $and, BooleanLike<T,K>, ...BooleanLike<T,K>[]];

/** The $nor operator performs a logical NOR operation on an array of one or more query expression and selects the documents that fail all the query expressions in the array. The $nor has the following syntax:
 * { $nor: [ { <expression1> }, { <expression2> }, ...  { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/nor/#op._S_nor */
export type $norQuery<T extends {}, K extends keyof T> = { [$nor]:
  | [BooleanLike<T,K>, ...BooleanLike<T,K>[]]; }
  | [typeof $nor, BooleanLike<T,K>, ...BooleanLike<T,K>[]];

/** The $not operator performs a logical NOT operation on the specified <operator-expression> and selects the documents that do not match the <operator-expression>. This includes documents that do not contain the field.
 * Syntax: { field: { $not: { <operator-expression> } } }
 * @see https://docs.mongodb.com/manual/reference/operator/query/not/#op._S_not */
export type $notQuery<T extends {}, K extends keyof T> =
  | { [$not]: BooleanLike<T,K>; }
  | [typeof $not, BooleanLike<T,K>];

/** The $or operator performs a logical OR operation on an array of two or more <expressions> and selects the documents that satisfy at least one of the <expressions>. The $or has the following syntax:
 * { $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }
 * @see https://docs.mongodb.com/manual/reference/operator/query/or/#op._S_or */
export type $orQuery<T extends {}, K extends keyof T> =
  | { [$or]: Record<K, T[K]> }
  | { [$or]: [BooleanLike<T,K>, ...BooleanLike<T,K>[]]; }
  | [typeof $or, BooleanLike<T,K>, ...BooleanLike<T,K>[]];

export type LogicalQuery<T extends {}, K extends keyof T> =
  | $andQuery<T, K>
  | $norQuery<T, K>
  | $notQuery<T, K>
  | $orQuery<T, K>
