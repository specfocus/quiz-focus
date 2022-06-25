/** Set Expression Operators
 * 
 * Set expressions performs set operation on arrays, treating arrays as sets. Set expressions ignores the duplicate entries in each input array and the order of the elements.
 * 
 * If the set operation returns a set, the operation filters out duplicates in the result to output an array that contains only unique entries. The order of the elements in the output array is unspecified.
 * 
 * If a set contains a nested array element, the set expression does not descend into the nested array but evaluates the array at top-level.
 */

import { ReturnArrayExpression } from '../array';

/** Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression. */
export const $allElementsTrue = "$allElementsTrue";

/** Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression. */
export const $anyElementTrue = "$anyElementTrue";

/** Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions. */
export const $setDifference = "$setDifference";

/** Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions. */
export const $setEquals = "$setEquals";

/** Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions. */
export const $setIntersection = "$setIntersection";

/** Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset. Accepts exactly two argument expressions. */
export const $setIsSubset = "$setIsSubset";

/** Returns a set with elements that appear in any of the input sets. */
export const $setUnion = "$setUnion";

const SET_OPERATORS = [
  $allElementsTrue,
  $anyElementTrue,
  $setDifference,
  $setEquals,
  $setIntersection,
  $setIsSubset,
  $setUnion
] as const;

export type SetExpressionOperator = typeof SET_OPERATORS[number];

export const isSetExpressionOperator = (
  val: any
): val is SetExpressionOperator => val in SET_OPERATORS;

type ArrayLike<A> = A[] | ReturnArrayExpression<A>
type SetExpressionArgument = any;
type UnarySet<A = SetExpressionArgument> = ArrayLike<A>;
type BinarySet<A = SetExpressionArgument> = [ArrayLike<A>, ArrayLike<A>];
type RangeSet<A = SetExpressionArgument> = Array<ArrayLike<A>>;

/** Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression. */
export type $allElementsTrueExpression<A> = { [$allElementsTrue]: UnarySet<A>; };

/** Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression. */
export type $anyElementTrueExpression<A> = { [$anyElementTrue]: UnarySet<A>; };

/** Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions. */
export type $setDifferenceExpression<A> = { [$setDifference]: BinarySet<A>; };

/** Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions. */
export type $setEqualsExpression<A> = { [$setEquals]: RangeSet<A>; };

/** Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions. */
export type $setIntersectionExpression<A> = { [$setIntersection]: RangeSet<A>; };

/** Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset. Accepts exactly two argument expressions. */
export type $setIsSubsetExpression<A> = { [$setIsSubset]: BinarySet<A>; };

/** Returns a set with elements that appear in any of the input sets. */
export type $setUnionExpression<A> = { [$setUnion]: RangeSet<A>; };

export type SetExpression<A = SetExpressionArgument> =
  | $allElementsTrueExpression<A>
  | $anyElementTrueExpression<A>
  | $setDifferenceExpression<A>
  | $setEqualsExpression<A>
  | $setIntersectionExpression<A>
  | $setIsSubsetExpression<A>
  | $setUnionExpression<A>;
