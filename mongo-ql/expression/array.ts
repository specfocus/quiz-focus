/**
 * Array Expression Operators
 */

import { ReturnArrayExpression } from '../array';
import { NumberLikeExpression } from '../number';

/** Returns the element at the specified array index. */
export const $arrayElemAt = "$arrayElemAt";

/** Converts an array of key value pairs to a document. */
export const $arrayToObject = "$arrayToObject";

/** Concatenates arrays to return the concatenated array. */
export const $concatArrays = "$concatArrays";

/** Selects a subset of the array to return an array with only the elements that match the filter condition. */
export const $filter = "$filter";

/** Returns the first array element. Distinct from $first accumulator. */
export const $first = "$first";

/** Returns a boolean indicating whether a specified value is in an array. */
export const $in = "$in";

/** Searches an array for an occurrence of a specified value and returns the array index of the first occurrence. If the substring is not found, returns -1. */
export const $indexOfArray = "$indexOfArray";

/** Determines if the operand is an array. Returns a boolean. */
export const $isArray = "$isArray";

/** Returns the last array element. Distinct from $last accumulator. */
export const $last = "$last";

/** Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters. */
export const $map = "$map";

/** Converts a document to an array of documents representing key-value pairs. */
export const $objectToArray = "$objectToArray";

/** Outputs an array containing a sequence of integers according to user-defined inputs. */
export const $range = "$range";

/** Applies an expression to each element in an array and combines them into a single value. */
export const $reduce = "$reduce";

/** Returns an array with the elements in reverse order. */
export const $reverseArray = "$reverseArray";

/** Returns the number of elements in the array. Accepts a single expression as argument. */
export const $size = "$size";

/** Returns a subset of an array. */
export const $slice = "$slice";

/** Merge two arrays together. */
export const $zip = "$zip";

const ARRAY_OPERATORS = [
  $arrayElemAt,
  $arrayToObject,
  $concatArrays,
  $filter,
  $first,
  $in,
  $indexOfArray,
  $isArray,
  $last,
  $map,
  $objectToArray,
  $range,
  $reduce,
  $reverseArray,
  $size,
  $slice,
  $zip,
] as const;

export type ArrayExpressionOperator = typeof ARRAY_OPERATORS[number];

export const isArrayExpressionOperator = (
  val: any
): val is ArrayExpressionOperator => val in ARRAY_OPERATORS;

type ArrayLike<A> = A[] | ReturnArrayExpression<A>
type NumberLike = number | NumberLikeExpression;
type ArrayExpressionArgument = any;
type UnaryArray<A = ArrayExpressionArgument> = ArrayLike<A>;
type BinaryArray<A = ArrayExpressionArgument> = [ArrayLike<A>, ArrayLike<A>];
type RangeArray<A = ArrayExpressionArgument> = [ArrayLike<A>, ...ArrayLike<A>[]];

/** Returns the element at the specified array index. */
export type $arrayElemAtExpression<A> = { [$arrayElemAt]: RangeArray<A>; };

/** Converts an array of key value pairs to a document. */
export type $arrayToObjectExpression = { [$arrayToObject]: ArrayLike<any>; };

/** Concatenates arrays to return the concatenated array. */
export type $concatArraysExpression<A> = { [$concatArrays]: RangeArray<A>; };

/** Selects a subset of the array to return an array with only the elements that match the filter condition. */
export type $filterExpression<A> = { [$filter]: RangeArray<A>; };

/** Returns the first array element. Distinct from $first accumulator. */
export type $firstExpression<A> = { [$first]: RangeArray<A>; };

/** Returns a boolean indicating whether a specified value is in an array. */
export type $inExpression<A> = { [$in]: BinaryArray<A>; };

/** Searches an array for an occurrence of a specified value and returns the array index of the first occurrence. If the substring is not found, returns -1. */
export type $indexOfArrayExpression<A> = { [$indexOfArray]: RangeArray<A>; };

/** Determines if the operand is an array. Returns a boolean. */
export type $isArrayExpression<A> = { [$isArray]: RangeArray<A>; };

/** Returns the last array element. Distinct from $last accumulator. */
export type $lastExpression<A> = { [$last]: RangeArray<A>; };

/** Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters. */
export type $mapExpression<A> = { [$map]: RangeArray<A>; };

/** Converts a document to an array of documents representing key-value pairs. */
export type $objectToArrayExpression<A extends {} = {}> = { [$objectToArray]: A; };

/** Outputs an array containing a sequence of integers according to user-defined inputs. */
export type $rangeExpression<A> = {
  [$range]: [
    NumberLike,
    NumberLike,
    NumberLike
  ] | [
    NumberLike,
    NumberLike
  ];
};

/** Applies an expression to each element in an array and combines them into a single value. */
export type $reduceExpression<A> = {
  [$reduce]: {
    input: number[] | $rangeExpression<A>;
    initialValue: A;
    in: A;
  };
};

/** Returns an array with the elements in reverse order. */
export type $reverseArrayExpression<A> = { [$reverseArray]: RangeArray<A>; };

/** Returns the number of elements in the array. Accepts a single expression as argument. */
export type $sizeExpression<A> = { [$size]: RangeArray<A>; };

/** Returns a subset of an array. */
export type $sliceExpression<A> = { [$slice]: RangeArray<A>; };

/** Merge two arrays together. */
export type $zipExpression<A> = { [$zip]: RangeArray<A>; };

export type ArrayExpression<A> =
  | $arrayElemAtExpression<A>
  | $arrayToObjectExpression
  | $concatArraysExpression<A>
  | $filterExpression<A>
  | $firstExpression<A>
  | $inExpression<A>
  | $indexOfArrayExpression<A>
  | $isArrayExpression<A>
  | $lastExpression<A>
  | $mapExpression<A>
  | $objectToArrayExpression<A>
  | $rangeExpression<A>
  | $reduceExpression<A>
  | $reverseArrayExpression<A>
  | $sizeExpression<A>
  | $sliceExpression<A>
  | $zipExpression<A>;