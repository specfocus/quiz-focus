import { ObjectId } from 'bson';
import { hexSeconds } from "./object-id-timestamp";

export const cyrb53 = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const cloneObjectId = (
  _id: ObjectId,
  timestamp?: number | string
): ObjectId => {
  if (!timestamp) {
    timestamp = Date.now();
  }
  return new ObjectId(hexSeconds(timestamp) + _id.toHexString().substr(8));
};

export const createObjectId = (
  key: string,
  timestamp?: number | string
): ObjectId => {
  if (!timestamp) {
    timestamp = Date.now();
  }
  return new ObjectId(
    hexSeconds(timestamp) + cyrb53(key).toString(16).padStart(16, "0")
  );
};

export const OBJECT_ID_MASK = {
  $bit: {
    _id: {
      and: 0x00000000ffffffffffffffff,
    },
  },
};

export const filterObjectId = (key: string) => ({
  $eq: [cyrb53(key), OBJECT_ID_MASK],
});
