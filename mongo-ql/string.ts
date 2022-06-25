import { $concatArraysExpression } from './expression/array';
import { StringExpression } from './expression/string';

export type StringLikeExpression = StringExpression | $concatArraysExpression<string>;
