
/** $exists
 *  Syntax: { field: { $exists: <boolean> } }
 *  When <boolean> is true, $exists matches the documents that contain the field, including documents where the field value is null. If <boolean> is false, the query returns only the documents that do not contain the field. [1]
 * 
 * MongoDB $exists does not correspond to SQL operator exists. For SQL exists, refer to the $in operator.
 */
export const $exists = "$exists";

/** $type
 * $type selects documents where the value of the field is an instance of the specified BSON type(s). Querying by data type is useful when dealing with highly unstructured data where data types are not predictable.
 * 
 * A $type expression for a single BSON type has the following syntax:
 * 
 * Changed in version 3.2.
 * { field: { $type: <BSON type> } }
 */
export const $type = "$type";

const ELEMENT_QUERY_OPERATORS = [
  $exists,
  $type
] as const;

export type ElementQueryOperator = typeof ELEMENT_QUERY_OPERATORS[number];

export type $existsExpression = { [$exists]: any; };

export type $typeExpression = { [$type]: boolean; };

export type ElementQueryExpression =
  | $existsExpression
  | $typeExpression;
