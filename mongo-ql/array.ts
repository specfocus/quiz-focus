import { $arrayElemAtExpression, $concatArraysExpression, $filterExpression, $objectToArrayExpression, $reduceExpression, $reverseArrayExpression, $sliceExpression } from './expression/array';
import { $allElementsTrueExpression, $anyElementTrueExpression, $setDifferenceExpression, $setEqualsExpression, $setIntersectionExpression, $setIsSubsetExpression, $setUnionExpression } from './expression/set';

export type ReturnArrayExpression<A = any> =
  | $objectToArrayExpression<A>
  | $allElementsTrueExpression<A>
  // A | $anyElementTrueExpression<A>
  | $setDifferenceExpression<A>
  | $setEqualsExpression<A>
  | $setIntersectionExpression<A>
  | $setUnionExpression<A>
  // A | $arrayElemAtExpression<A>
  | $concatArraysExpression<A>
  | $filterExpression<A>
  // A | $firstExpression<A>
  // A | $lastExpression<A>
  // ? | $mapExpression<A>
  // ? | $rangeExpression<A>
  | $reduceExpression<A>
  | $reverseArrayExpression<A>
  | $sliceExpression<A>
  // ? | $zipExpression<A>;
