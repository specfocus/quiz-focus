/** 
 * Arithmetic Expression Operators
 * 
 * Arithmetic expressions perform mathematic operations on numbers. 
 * Some arithmetic expressions can also support date arithmetic.
 */

import { NumberLikeExpression } from '../number';

/** Returns the absolute value of a number. */
export const $abs = "$abs";

/** Adds numbers to return the sum, or adds numbers and a date to return a new date.
 * If adding numbers and a date, treats the numbers as milliseconds. 
 * Accepts any number of argument expressions, but at most, one expression can resolve to a date.
 */
export const $add = "$add";

/** Returns the smallest integer greater than or equal to the specified number. */
export const $ceil = "$ceil";

/** Returns the result of dividing the first number by the second. Accepts two argument expressions. */
export const $divide = "$divide";

/** Raises e to the specified exponent. */
export const $exp = "$exp";

/** Returns the largest integer less than or equal to the specified number. */
export const $floor = "$floor";

/** Calculates the natural log of a number. */
export const $ln = "$ln";

/** Calculates the log of a number in the specified base. */
export const $log = "$log";

/** Calculates the log base 10 of a number. */
export const $log10 = "$log10";

/** Returns the remainder of the first number divided by the second. Accepts two argument expressions. */
export const $mod = "$mod";

/** Multiplies numbers to return the product. 
 * Accepts any number of argument expressions.
 */
export const $multiply = "$multiply";

/** Raises a number to the specified exponent. */
export const $pow = "$pow";

/** Rounds a number to to a whole integer or to a specified decimal place. */
export const $round = "$round";

/** Calculates the square root. */
export const $sqrt = "$sqrt";

/** Returns the result of subtracting the second value from the first. 
 * If the two values are numbers, return the difference. If the two values are dates, 
 * return the difference in milliseconds. If the two values are a date and a number 
 * in milliseconds, return the resulting date. Accepts two argument expressions. 
 * If the two values are a date and a number, specify the date argument first as it 
 * is not meaningful to subtract a date from a number.
 */
export const $subtract = "$subtract";

/** Truncates a number to a whole integer or to a specified decimal place. */
export const $trunc = "$trunc";

const ARITHMETIC_OPERATORS = [
  $abs,
  $add,
  $ceil,
  $divide,
  $exp,
  $floor,
  $ln,
  $log,
  $log10,
  $mod,
  $multiply,
  $pow,
  $round,
  $sqrt,
  $subtract,
  $trunc,
] as const;

export type ArithmeticExpressionOperator = typeof ARITHMETIC_OPERATORS[number];

export const isArithmeticExpressionOperator = (
  val: any
): val is ArithmeticExpressionOperator => val in ARITHMETIC_OPERATORS;

type NumberLike = number | NumberLikeExpression;
type UnaryArithmetic = NumberLike;
type BinaryArithmetic = [NumberLike, NumberLike];
type RangeArithmetic = [NumberLike, ...NumberLike[]];

export type $absExpression = { [$abs]: UnaryArithmetic | null };
export type $addExpression = { [$add]: RangeArithmetic };
export type $ceilExpression = { [$ceil]: UnaryArithmetic };
export type $divideExpression = { [$divide]: BinaryArithmetic };
export type $expExpression = { [$exp]: UnaryArithmetic };
export type $floorExpression = { [$floor]: UnaryArithmetic };
export type $lnExpression = { [$ln]: UnaryArithmetic };
export type $logExpression = { [$ln]: BinaryArithmetic };
export type $log10Expression = { [$ln]: UnaryArithmetic };
export type $modExpression = { [$ln]: BinaryArithmetic };
export type $multiplyExpression = { [$ln]: RangeArithmetic };
export type $powExpression = { [$pow]: BinaryArithmetic };
export type $roundExpression = { [$round]: UnaryArithmetic };
export type $sqrtExpression = { [$sqrt]: UnaryArithmetic };
export type $subtractExpression = { [$subtract]: BinaryArithmetic };
export type $truncExpression = { [$trunc]: UnaryArithmetic };

export type ArithmeticExpression = 
  | $absExpression
  | $addExpression
  | $ceilExpression
  | $divideExpression
  | $expExpression
  | $floorExpression
  | $lnExpression
  | $logExpression
  | $log10Expression
  | $modExpression
  | $multiplyExpression
  | $powExpression
  | $roundExpression
  | $sqrtExpression
  | $subtractExpression
  | $truncExpression;
