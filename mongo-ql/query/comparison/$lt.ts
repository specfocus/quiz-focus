import { numericalOperation } from '../core';

export const $lt = numericalOperation(params => b => b < params);