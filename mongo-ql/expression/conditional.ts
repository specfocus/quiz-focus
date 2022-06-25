/** Conditional Expression Operators */

/** A ternary operator that evaluates one expression, and depending on the result, returns the value of one of the other two expressions. Accepts either three expressions in an ordered list or three named parameters. */
export const $cond = "$cond";

/** Returns either the non-null result of the first expression or the result of the second expression if the first expression results in a null result. Null result encompasses instances of undefined values or missing fields. Accepts two expressions as arguments. The result of the second expression can be null. */
export const $ifNull = "$ifNull";

/** Evaluates a series of case expressions. When it finds an expression which evaluates to true, $switch executes a specified expression and breaks out of the control flow. */
export const $switch = "$switch";

const CONDITIONAL_OPERATORS = [
  $cond,
  $ifNull,
  $switch
] as const;

export type ConditionalExpressionOperator = typeof CONDITIONAL_OPERATORS[number];

export const isConditionalExpressionOperator = (
  val: any
): val is ConditionalExpressionOperator => val in CONDITIONAL_OPERATORS;

export type ConditionalExpression = Record<ConditionalExpressionOperator, (number | string)[]>;
