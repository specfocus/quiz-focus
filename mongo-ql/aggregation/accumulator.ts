/** Accumulators (in Other Stages)
 *  Some operators that are available as accumulators for the $group stage are also available for use in other stages but not as accumulators. When used in these other stages, these operators do not maintain their state and can take as input either a single argument or multiple arguments. For details, refer to the specific operator page.
 * 
 *  The following accumulator operators are also available in the $project, $addFields, and $set stages.
 */

/** Returns an average of the specified expression or list of expressions for each document. Ignores non-numeric values. */
export const $avg = "$avg";

/** Returns the maximum of the specified expression or list of expressions for each document */
export const $max = "$max";

/** Returns the minimum of the specified expression or list of expressions for each document */
export const $min = "$min";

/** Returns the population standard deviation of the input values. */
export const $stdDevPop = "$stdDevPop";

/** Returns the sample standard deviation of the input values. */
export const $stdDevSamp = "$stdDevSamp";

/** Returns a sum of numerical values. Ignores non-numeric values. */
export const $sum = "$sum";

const ACCUMULATORS = [
  $avg,
  $max,
  $min,
  $stdDevPop,
  $stdDevSamp,
  $sum
] as const;

export type Accumulator = typeof ACCUMULATORS[number];

export const isAccumulator = (
  val: any
): val is Accumulator => val in ACCUMULATORS;
