import { $subtract } from '../../expression/arithmetic';
import { $range, $reduce, $reduceExpression } from '../../expression/array';
import { $gte } from '../../expression/comparison';
import { $cond } from '../../expression/conditional';
import { $concat, $strLenCP } from '../../expression/string';
import { StringLikeExpression } from '../../string';

/**
 * return a string that is at least that length and if it was shorter then pad it on the front 
 * (i.e. left side) with provided pad character (by default we will use space to pad with).
 */
export default function lpad(str: string, len: number, padstr = " ") {
  const reduce: $reduceExpression<string | StringLikeExpression> = {
    [$reduce]: {
      input: {
        [$range]: [
          0,
          {
            [$subtract]: [
              len,
              {
                [$strLenCP]: str
              }
            ]
          }
        ]
      },
      initialValue: "",
      in: {
        [$concat]: ["$$value", padstr]
      },
    },
  };
  return {
    [$cond]: {
      if: {
        [$gte]: [{ [$strLenCP]: str }, len]
      },
      then: str,
      else: {
        [$concat]: [reduce, str]
      },
    },
  };
};