/** Trigonometry Expression Operators
 * 
 * Trigonometry expressions perform trigonometric operations on numbers. Values that represent angles are always input or output in radians. Use $degreesToRadians and $radiansToDegrees to convert between degree and radian measurements.
 */

/** Returns the sine of a value that is measured in radians. */
export const $sin = "$sin";

/** Returns the cosine of a value that is measured in radians. */
export const $cos = "$cos";

/** Returns the tangent of a value that is measured in radians. */
export const $tan = "$tan";

/** Returns the inverse sin (arc sine) of a value in radians. */
export const $asin = "$asin";

/** Returns the inverse cosine (arc cosine) of a value in radians. */
export const $acos = "$acos";

/** Returns the inverse tangent (arc tangent) of a value in radians. */
export const $atan = "$atan";

/** Returns the inverse tangent (arc tangent) of y / x in radians, where y and x are the first and second values passed to the expression respectively. */
export const $atan2 = "$atan2";

/** Returns the inverse hyperbolic sine (hyperbolic arc sine) of a value in radians. */
export const $asinh = "$asinh";

/** Returns the inverse hyperbolic cosine (hyperbolic arc cosine) of a value in radians. */
export const $acosh = "$acosh";

/** Returns the inverse hyperbolic tangent (hyperbolic arc tangent) of a value in radians. */
export const $atanh = "$atanh";

/** Returns the hyperbolic sine of a value that is measured in radians. */
export const $sinh = "$sinh";

/** Returns the hyperbolic cosine of a value that is measured in radians. */
export const $cosh = "$cosh";

/** Returns the hyperbolic tangent of a value that is measured in radians. */
export const $tanh = "$tanh";

/** Converts a value from degrees to radians. */
export const $degreesToRadians = "$degreesToRadians";

/** Converts a value from radians to degrees. */
export const $radiansToDegrees = "$radiansToDegrees";

const TRIGONOMETRY_OPERATORS = [
  $sin,
  $cos,
  $tan,
  $asin,
  $acos,
  $atan,
  $atan2,
  $asinh,
  $acosh,
  $atanh,
  $sinh,
  $cosh,
  $tanh,
  $degreesToRadians,
  $radiansToDegrees
] as const;

export type TrigonometryExpressionOperator = typeof TRIGONOMETRY_OPERATORS[number];

export const isTrigonometryExpressionOperator = (
  val: any
): val is TrigonometryExpressionOperator => val in TRIGONOMETRY_OPERATORS;
