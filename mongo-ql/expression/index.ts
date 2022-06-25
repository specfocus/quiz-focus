import { ArithmeticExpression, ArithmeticExpressionOperator, isArithmeticExpressionOperator } from './arithmetic';
import { ArrayExpression, ArrayExpressionOperator, isArrayExpressionOperator } from './array';
import { BooleanExpression, BooleanExpressionOperator, isBooleanExpressionOperator } from './boolean';
import { ComparisonExpression, ComparisonExpressionOperator, isComparisonExpressionOperator } from './comparison';
import { ConditionalExpression, ConditionalExpressionOperator, isConditionalExpressionOperator } from './conditional';
import { CustomAggregationExpressionOperator, isCustomAggregationExpressionOperator } from './custom-aggregation';
import { DataSizeExpressionOperator, isDataSizeExpressionOperator } from './data-size';
import { DateExpression } from './date';
import { isLiteralExpressionOperator, LiteralExpressionOperator } from './literal';
import { isObjectExpressionOperator, ObjectExpressionOperator } from './object';
import { isSetExpressionOperator, SetExpression, SetExpressionOperator } from './set';
import { isStringExpressionOperator, StringExpressionOperator } from './string';
import { isTextExpressionOperator, TextExpressionOperator } from './text';
import { isTrigonometryExpressionOperator, TrigonometryExpressionOperator } from './trigonometry';
import { isTypeExpressionOperator, TypeExpressionOperator } from './type';
import { isVariableExpressionOperator, VariableExpressionOperator } from './variable';

export type ExpressionOperator =
  | ArithmeticExpressionOperator
  | ArrayExpressionOperator
  | BooleanExpressionOperator
  | ComparisonExpressionOperator
  | ConditionalExpressionOperator
  | CustomAggregationExpressionOperator
  | DataSizeExpressionOperator
  | LiteralExpressionOperator
  | ObjectExpressionOperator
  | SetExpressionOperator
  | StringExpressionOperator
  | TextExpressionOperator
  | TrigonometryExpressionOperator
  | TypeExpressionOperator
  | VariableExpressionOperator;

export const isExpressionOperator = (val: any): val is ExpressionOperator =>
  isArithmeticExpressionOperator(val)
  || isArrayExpressionOperator(val)
  || isBooleanExpressionOperator(val)
  || isComparisonExpressionOperator(val)
  || isConditionalExpressionOperator(val)
  || isCustomAggregationExpressionOperator(val)
  || isDataSizeExpressionOperator(val)
  || isLiteralExpressionOperator(val)
  || isObjectExpressionOperator(val)
  || isSetExpressionOperator(val)
  || isStringExpressionOperator(val)
  || isTextExpressionOperator(val)
  || isTrigonometryExpressionOperator(val)
  || isTypeExpressionOperator(val)
  || isVariableExpressionOperator(val);

export type Expression =
  | ArithmeticExpression
  | ArrayExpression<any>
  | BooleanExpression
  | ComparisonExpression
  | ConditionalExpression
  | DateExpression
  | SetExpression;
