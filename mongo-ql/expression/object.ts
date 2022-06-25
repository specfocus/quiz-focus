/** Object Expression Operators */

/** Combines multiple documents into a single document. */
export const $mergeObjects = "$mergeObjects";

/** Converts a document to an array of documents representing key-value pairs. */
export const $objectToArray = "$objectToArray";

const OBJECT_OPERATORS = [
  $mergeObjects,
  $objectToArray
] as const;

export type ObjectExpressionOperator = typeof OBJECT_OPERATORS[number];

export const isObjectExpressionOperator = (
  val: any
): val is ObjectExpressionOperator => val in OBJECT_OPERATORS;
