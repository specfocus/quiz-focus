/** Literal Expression Operator */

/** Return a value without parsing.
 * Use for values that the aggregation pipeline may interpret as
 * an expression.
 * For example, use a $literal expression to a string that starts
 * with a $ to avoid parsing as a field path.
 */
export const $literal = "$literal";

const LITERAL_OPERATORS = [
  $literal
] as const;

export type LiteralExpressionOperator = typeof LITERAL_OPERATORS[number];

export const isLiteralExpressionOperator = (
  val: any
): val is LiteralExpressionOperator => val in LITERAL_OPERATORS;