/** Stages (db.aggregate)
 *  Starting in version 3.6, MongoDB also provides the db.aggregate() method:
 * db.aggregate( [ { <stage> }, ... ] )
 * The following stages use the db.aggregate() method and not the db.collection.aggregate() method.
 */

/** Returns information on active and/or dormant operations for the MongoDB deployment. */
export const $currentOp = "$currentOp";

/** Lists all active sessions recently in use on the currently connected mongos or mongod instance. These sessions may have not yet propagated to the system.sessions collection. */
export const $listLocalSessions = "$listLocalSessions";

const DB_AGGREGATE_STAGES = [
  $currentOp,
  $listLocalSessions
] as const;

export type DbAggregateStage = typeof DB_AGGREGATE_STAGES[number];

export const isDbAggregateStage = (
  val: any
): val is DbAggregateStage => val in DB_AGGREGATE_STAGES;
