import { numericalOperation } from '../core';

export const $gte = numericalOperation(params => b => b >= params);