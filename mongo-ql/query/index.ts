import { Binary, BSONType } from "mongodb";
import { BsonType } from '../type';
import { $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin } from './comparison';
import { $exists, $type } from './element';
import { $and, $nor, $not, $or } from './logical';

export {
  createEqualsOperation,
  createOperationTester,
  createQueryOperation,
  createQueryTester,
} from "./core";
export type { EqualsOperation, Query } from "./core";
export * from "./operations";

/** @see https://docs.mongodb.com/v3.6/reference/operator/query-bitwise */
type BitwiseQuery =
  | number /** <numeric bitmask> */
  | Binary /** <BinData bitmask> */
  | number[]; /** [ <position1>, <position2>, ... ] */

// we can search using alternative types in mongodb e.g.
// string types can be searched using a regex in mongo
// array types can be searched using their element type
type RegExpForString<T> = T extends string ? RegExp | T : T;
type MongoAltQuery<T> = T extends ReadonlyArray<infer U> ? T | RegExpForString<U> : RegExpForString<T>;

/**
* Available query selector types
*
* @param $eq Matches values that are equal to a specified value.
* @param $gt Matches values that are greater than a specified value.
* @param $gte Matches values that are greater than or equal to a specified value.
* @param $in Matches values that are greater than or equal to a specified value.
* @param $lt Matches values that are less than a specified value.
* @param $lte Matches values that are less than or equal to a specified value.
* @param $ne Matches all values that are not equal to a specified value.
* @param $nin Matches none of the values specified in an array.
*
* @param $and Joins query clauses with a logical `AND` returns all documents that match the conditions of both clauses.
* @param $not Inverts the effect of a query expression and returns documents that do not match the query expression.
* @param $nor Joins query clauses with a logical `NOR` returns all documents that fail to match both clauses.
* @param $or Joins query clauses with a logical `OR` returns all documents that match the conditions of either clause.
*
* @param $exists Matches documents that have the specified field.
* @param $type Selects documents if a field is of the specified type.
*
* @param $expr Allows use of aggregation expressions within the query language.
* @param $jsonSchema Validate documents against the given JSON Schema.
* @param $mod Performs a modulo operation on the value of a field and selects documents with a specified result.
* @param $regex Selects documents where values match a specified regular expression.
* @param $text Performs text search.
* @param $where Matches documents that satisfy a JavaScript expression.
*
* @param $geoIntersects Selects geometries that intersect with a {@link https://docs.mongodb.com/v3.6/reference/glossary/#term-geojson GeoJSON} geometry.
* The {@link https://docs.mongodb.com/v3.6/core/2dsphere/ 2dsphere} index supports {@link https://docs.mongodb.com/v3.6/reference/operator/query/geoIntersects/#op._S_geoIntersects $geoIntersects}.
* @param $geoWithin Selects geometries within a bounding {@link https://docs.mongodb.com/v3.6/reference/geojson/#geospatial-indexes-store-geojson GeoJSON geometry}.
* The {@link https://docs.mongodb.com/v3.6/core/2dsphere/ 2dsphere} and {@link https://docs.mongodb.com/v3.6/core/2d/ 2d} indexes
* support {@link https://docs.mongodb.com/v3.6/reference/operator/query/geoWithin/#op._S_geoWithin $geoWithin}.
* @param $near Returns geospatial objects in proximity to a point. Requires a geospatial index. The {@link https://docs.mongodb.com/v3.6/core/2dsphere/ 2dsphere}
* and {@link https://docs.mongodb.com/v3.6/core/2d/ 2d} indexes support {@link https://docs.mongodb.com/v3.6/reference/operator/query/near/#op._S_near $near}.
* @param $nearSphere Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index. The {@link https://docs.mongodb.com/v3.6/core/2dsphere/ 2dsphere} and
* {@link https://docs.mongodb.com/v3.6/reference/operator/query/nearSphere/#op._S_nearSphere 2d} indexes support
* {@link https://docs.mongodb.com/v3.6/reference/operator/query/nearSphere/#op._S_nearSphere $nearSphere}.
*
* @param $all Matches arrays that contain all elements specified in the query.
* @param $elemMatch Selects documents if element in the array field matches all the specified
* {@link https://docs.mongodb.com/v3.6/reference/operator/query/elemMatch/#op._S_elemMatch $elemMatch} conditions.
* @param $size Selects documents if the array field is a specified size.
*
* @param $bitsAllClear Matches numeric or binary values in which a set of bit positions all have a value of `0`.
* @param $bitsAllSet Matches numeric or binary values in which a set of bit positions all have a value of `1`.
* @param $bitsAnyClear Matches numeric or binary values in which any bit from a set of bit positions has a value of `0`.
* @param $bitsAnySet Matches numeric or binary values in which any bit from a set of bit positions has a value of `1`.
*
* @see https://docs.mongodb.com/v3.6/reference/operator/query/#query-selectors
*/
export type QuerySelector<T> = {
  // Comparison
  [$eq]?: T;
  [$gt]?: T;
  [$gte]?: T;
  [$in]?: T[];
  [$lt]?: T;
  [$lte]?: T;
  [$ne]?: T;
  [$nin]?: T[];
  // Logical
  [$not]?: T extends string ? QuerySelector<T> | RegExp : QuerySelector<T>;
  // Element
  /**
   * When `true`, `$exists` matches the documents that contain the field,
   * including documents where the field value is null.
   */
  [$exists]?: boolean;
  [$type]?: BSONType | BsonType;
  // Evaluation
  $expr?: any;
  $jsonSchema?: any;
  $mod?: T extends number ? [number, number] : never;
  $regex?: T extends string ? RegExp | string : never;
  $options?: T extends string ? string : never;
  // Geospatial
  // TODO: define better types for geo queries
  $geoIntersects?: { $geometry: object };
  $geoWithin?: object;
  $near?: object;
  $nearSphere?: object;
  $maxDistance?: number;
  // Array
  // TODO: define better types for $all and $elemMatch
  $all?: T extends ReadonlyArray<infer U> ? any[] : never;
  $elemMatch?: T extends ReadonlyArray<infer U> ? object : never;
  $size?: T extends ReadonlyArray<infer U> ? number : never;
  // Bitwise
  $bitsAllClear?: BitwiseQuery;
  $bitsAllSet?: BitwiseQuery;
  $bitsAnyClear?: BitwiseQuery;
  $bitsAnySet?: BitwiseQuery;
};

export type RootQuerySelector<T> = {
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/and/#op._S_and */
  [$and]?: Array<FilterQuery<T>>;
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/nor/#op._S_nor */
  [$nor]?: Array<FilterQuery<T>>;
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/or/#op._S_or */
  [$or]?: Array<FilterQuery<T>>;
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/text */
  $text?: {
      $search: string;
      $language?: string;
      $caseSensitive?: boolean;
      $diacriticSensitive?: boolean;
  };
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/where/#op._S_where */
  $where?: string | Function;
  /** @see https://docs.mongodb.com/v3.6/reference/operator/query/comment/#op._S_comment */
  $comment?: string;
  // we could not find a proper TypeScript generic to support nested queries e.g. 'user.friends.name'
  // this will mark all unrecognized properties as any (including nested queries)
  [key: string]: any;
};

export type Condition<T> = MongoAltQuery<T> | QuerySelector<MongoAltQuery<T>>;

export type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;
