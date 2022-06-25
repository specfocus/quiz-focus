/** Accumulators ($group)
 * 
 * Available for use in the $group stage, accumulators are operators 
 * that maintain their state (e.g. totals, maximums, minimums, and 
 * related data) as documents progress through the pipeline.
 * 
 * When used as accumulators in the $group stage, these operators take 
 * as input a single expression, evaluating the expression once for each 
 * input document, and maintain their stage for the group of documents 
 * that share the same group key.
 */

/** Returns the result of a user-defined accumulator function. */
export const $accumulator = "$accumulator";

/** Returns an array of unique expression values for each group. Order of the array elements is undefined. */
export const $addToSet = "$addToSet";

/** Returns an average of numerical values. Ignores non-numeric values. */
export const $avg = "$avg";

/** Returns a value from the first document for each group. 
 * Order is only defined if the documents are in a defined order.
 * 
 * Distinct from the $first array operator.
 */
 export const $first = "$first";

/** Returns a value from the last document for each group. 
 * Order is only defined if the documents are in a defined order.
 * 
 * Distinct from the $last array operator.
 */
 export const $last = "$last";

/** Returns the highest expression value for each group. */
export const $max = "$max";

/** Returns a document created by combining the input documents for each group. */
export const $mergeObjects = "$mergeObjects";

/** Returns the lowest expression value for each group. */
export const $min = "$min";

/** Returns an array of expression values for each group. */
export const $push = "$push";

/** Returns the population standard deviation of the input values. */
export const $stdDevPop = "$stdDevPop";

/** Returns the sample standard deviation of the input values. */
export const $stdDevSamp = "$stdDevSamp";

/** Returns a sum of numerical values. Ignores non-numeric values. */
export const $sum = "$sum";

const GROUP_ACCUMULATORS = [
  $accumulator,
  $addToSet,
  $avg,
  $first,
  $last,
  $max,
  $mergeObjects,
  $min,
  $push,
  $stdDevPop,
  $stdDevSamp,
  $sum
] as const;

export type GroupAccumulator = typeof GROUP_ACCUMULATORS[number];

export const isGroupAccumulator = (
  val: any
): val is GroupAccumulator => val in GROUP_ACCUMULATORS;
