/** Type Expression Operators */

/** Converts a value to a specified type. */
export const $convert = "$convert";

/** Returns boolean true if the specified expression resolves to an integer, decimal, double, or long.
 * Returns boolean false if the expression resolves to any other BSON type, null, or a missing field.
 */
export const $isNumber = "$isNumber";

/** Converts value to a boolean. */
export const $toBool = "$toBool";

/** Converts value to a Date. */
export const $toDate = "$toDate";

/** Converts value to a Decimal128. */
export const $toDecimal = "$toDecimal";

/** Converts value to a double. */
export const $toDouble = "$toDouble";

/** Converts value to an integer. */
export const $toInt = "$toInt";

/** Converts value to a long. */
export const $toLong = "$toLong";

/** Converts value to an ObjectId. */
export const $toObjectId = "$toObjectId";

/** Converts value to a string. */
export const $toString = "$toString";

/** Return the BSON data type of the field. */
export const $type = "$type";

const TYPE_OPERATORS = [
  $convert,
  $isNumber,
  $toBool,
  $toDate,
  $toDecimal,
  $toDouble,
  $toInt,
  $toLong,
  $toObjectId,
  $toString,
  $type
] as const;

export type TypeExpressionOperator = typeof TYPE_OPERATORS[number];

export const isTypeExpressionOperator = (
  val: any
): val is TypeExpressionOperator => val in TYPE_OPERATORS;
