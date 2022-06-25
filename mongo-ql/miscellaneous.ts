/** Returns a random float between 0 and 1 */
export const $rand = "$rand";

/** Randomly select documents at a given rate. Although the exact number of documents selected varies on each run, the quantity chosen approximates the sample rate expressed as a percentage of the total number of documents. */
export const $sampleRate = "$sampleRate";

const MISCELLANEOUS = [
  $rand,
  $sampleRate
] as const;


export type Miscellaneous = typeof MISCELLANEOUS[number];

export const isMiscellaneous = (
  val: any
): val is Miscellaneous => val in MISCELLANEOUS;
