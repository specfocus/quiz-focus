/** Text Expression Operator */

/** Access available per-document metadata related to the aggregation operation. */
export const $meta = "$meta";

export const TEXT_OPERATORS = [
  $meta
] as const;

export type TextExpressionOperator = typeof TEXT_OPERATORS[number];

export const isTextExpressionOperator = (
  val: any
): val is TextExpressionOperator => val in TEXT_OPERATORS;
