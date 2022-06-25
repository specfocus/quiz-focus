/* This function returns an ObjectId embedded with a given datetime */

import { ObjectId } from "bson";

/* Accepts both Date object and string input */
export const hexSeconds = (timestamp: number | string) => {
  /* Convert string date to Date object (otherwise assume timestamp is a date) */
  if (typeof timestamp === "string") {
    timestamp = new Date(timestamp).valueOf();
  }

  /* Convert date object to hex seconds since Unix epoch */
  return Math.floor(timestamp / 1000).toString(16);
};

/* Create an ObjectId with that hex timestamp */
export const objectIdTimeReference = (timestamp: number | string) =>
  new ObjectId(hexSeconds(timestamp) + "0000000000000000");

export const createdAfter = (timestamp: number | string) => ({
  _id: { $gt: objectIdTimeReference(timestamp) },
});

export const createdBefore = (timestamp: number | string) => ({
  _id: { $lt: objectIdTimeReference(timestamp) },
});

/* Find all documents created after midnight on May 25th, 1980 */
// db.mycollection.find({ _id: { $gt: objectIdWithTimestamp("1980/05/25") } });
