/** Custom Aggregation Expression Operators */

/** Defines a custom accumulator function. */
export const $accumulator = "$accumulator";

/** Defines a custom function. */
export const $function = "$function";

const CUSTOM_AGGREGATION_OPERATORS = [
  $accumulator,
  $function
] as const;

export type CustomAggregationExpressionOperator = typeof CUSTOM_AGGREGATION_OPERATORS[number];

export const isCustomAggregationExpressionOperator = (
  val: any
): val is CustomAggregationExpressionOperator => val in CUSTOM_AGGREGATION_OPERATORS;
