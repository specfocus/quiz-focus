import { $dateFromPartsExpression, $dateFromStringExpression } from './expression/date';

export type DateLikeExpression = 
  | $dateFromPartsExpression 
  | $dateFromStringExpression;
  