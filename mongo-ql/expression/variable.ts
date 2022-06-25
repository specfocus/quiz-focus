/** Variable Expression Operators */

/** Defines variables for use within the scope of a subexpression and 
 * returns the result of the subexpression. Accepts named parameters.
 * 
 * Accepts any number of argument expressions.
 */
const $let = "$let";

const VARIABLE_OPERATORS = [
  $let
] as const;

export type VariableExpressionOperator = typeof VARIABLE_OPERATORS[number];

export const isVariableExpressionOperator = (
  val: any
): val is VariableExpressionOperator => val in VARIABLE_OPERATORS;