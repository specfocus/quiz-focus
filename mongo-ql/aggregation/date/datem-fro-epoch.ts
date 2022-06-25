/** 
 * The great thing about recent versions of MongoDB is that they added a lot of new expressions for handling different types in aggregation.
 * The not so great thing is sometimes you still have to get things done in an older version that doesn't have the same capabilities.
 */

/**
 * A colleague asked me today how you can convert an epoch (number of milliseconds since 1970/1/1) to a proper 
 * ISODate format.  The answer comes from date math:
 *
db.coll.aggregate({$addFields:{
      date:{$add:[
            ISODate("1970-01-01T00:00:00Z"),
            "$epoch"
      ]}
}})
*/

const since = new Date("1970-01-01T00:00:00Z");

export const epochToIsoDate = (dateField: string, epochField: string) => ({
  $addFields: {
    [dateField]: {
      $add: [since, "$".concat(epochField)],
    },
  },
});


/**
 * Because $add supports adding numbers to date (treating the number as milliseconds) we get back a proper 
 * ISODate that the number in "epoch" field represents!
*/