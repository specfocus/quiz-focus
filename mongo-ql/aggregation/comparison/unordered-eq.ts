import { $arrayToObject, $arrayToObjectExpression, $objectToArray, $objectToArrayExpression } from '../../expression/array';
import { $eq } from '../../expression/comparison';
import { $setUnion, $setUnionExpression } from '../../expression/set';
import { ReturnArrayExpression } from '../../array';

/**
 * How to efficiently determine that two subdocuments are "equal".  
 * The issue of course is that in normal MongoDB query language semantics, if you just say: 
   {$eq: [ {"a":1, "b":2},  {"b":2, "a":1} ] }
 * the result is false because the two subdocuments are not "equal".  
 * So how do you determine if two subdocuments are logically equal (without regard to field order) 
 * or whether all subdocuments in the collection or a group are logically equal? 
 * The challenge for example, is comparing index definitions across multiple shards.
 * There are several parts to the index definition.
 * The key part very much depends on the order of the fields - an index on {"a":1, "b":1}
 * is not the same thing as the index on {"b":1, "a":1}.
 * However the options on the index are not order dependent, if the specification part of the index is 
 * {"unique":true, "sparse":true} it has exactly the same effect as if it's 
 * {"sparse":true, "unique":true}.Here are a couple of functions to the rescue.
 * The first one does a comparison of two objects and considers them equal if they have the same
 * top level fields with the same values.
 * The second one will "normalize" an object so that no matter what order the fields are in,
 * they will be in alphabetical order in the result document.
 */
export default function unorderedEq<A extends {} = {}>(o1: A, o2: A) {
  return {
    [$eq]: [
      normalize(o1),
      normalize(o2),
    ],
  };
};

export function normalize(o: {}) {
  return {
    [$arrayToObject]: {
      [$setUnion]: [
        {
          [$objectToArray]: o
        }
      ]
    }
  };
};
