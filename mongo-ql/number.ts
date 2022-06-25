import { 
  $absExpression,
  $addExpression,
  $ceilExpression,
  $divideExpression,
  $expExpression,
  $floorExpression,
  $lnExpression,
  $logExpression,
  $log10Expression,
  $modExpression,
  $multiplyExpression,
  $powExpression,
  $roundExpression,
  $sqrtExpression,
  $subtractExpression,
  $truncExpression
 } from './expression/arithmetic';
import { $indexOfArrayExpression, $sizeExpression } from './expression/array';
import { $strLenBytesExpression, $strLenCPExpression } from './expression/string';

export type NumberLikeExpression =
  | $absExpression
  | $addExpression
  | $ceilExpression
  | $divideExpression
  | $expExpression
  | $floorExpression
  | $lnExpression
  | $logExpression
  | $log10Expression
  | $modExpression
  | $multiplyExpression
  | $powExpression
  | $roundExpression
  | $sqrtExpression
  | $subtractExpression
  | $truncExpression
  | $strLenBytesExpression
  | $strLenCPExpression
  | $indexOfArrayExpression<any>
  | $sizeExpression<any>;