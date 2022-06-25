import { $in, $inExpression, $isArray, $isArrayExpression } from './expression/array';
import { BooleanExpression, BooleanExpressionOperator } from './expression/boolean';
import { ComparisonExpression, ComparisonExpressionOperator } from './expression/comparison';
import { $setIsSubset, $setIsSubsetExpression } from './expression/set';

const BOOLEAN_LIKE_OPERATORS = [
  $in,
  $isArray,
  $setIsSubset,
] as const;

export type BooleanLikeExpressionOperator =
  | BooleanExpressionOperator
  | ComparisonExpressionOperator
  | typeof BOOLEAN_LIKE_OPERATORS[number];

export type BooleanLikeExpression =
  | BooleanExpression
  | ComparisonExpression

  | $setIsSubsetExpression<any>
  | $inExpression<any>
  | $isArrayExpression<any>;
