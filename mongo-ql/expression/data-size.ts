/** Data Size Expression Operators
 * 
 * The following operators return the size of a data element:
 */

/** Returns the size of a given string or binary data value's content in bytes. */
export const $binarySize = "$binarySize";

/** Returns the size in bytes of a given document (i.e. bsontype Object) when encoded as BSON. */
export const $bsonSize = "$bsonSize";

const DATA_SIZE_OPERATORS = [
  $binarySize,
  $bsonSize
] as const;

export type DataSizeExpressionOperator = typeof DATA_SIZE_OPERATORS[number];

export const isDataSizeExpressionOperator = (
  val: any
): val is DataSizeExpressionOperator => val in DATA_SIZE_OPERATORS;