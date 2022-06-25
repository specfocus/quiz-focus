/** Date Expression Operators
 * 
 * The following operators returns date objects or components of a date object:
 */

/** Constructs a BSON Date object given the date's constituent parts. */
export const $dateFromParts = "$dateFromParts";

/** Converts a date/time string to a date object. */
export const $dateFromString = "$dateFromString";

/** Returns a document containing the constituent parts of a date. */
export const $dateToParts = "$dateToParts";

/** Returns the date as a formatted string. */
export const $dateToString = "$dateToString";

/** Returns the day of the month for a date as a number between 1 and 31. */
export const $dayOfMonth = "$dayOfMonth";

/** Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday). */
export const $dayOfWeek = "$dayOfWeek";

/** Returns the day of the year for a date as a number between 1 and 366 (leap year). */
export const $dayOfYear = "$dayOfYear";

/** Returns the hour for a date as a number between 0 and 23. */
export const $hour = "$hour";

/** Returns the weekday number in ISO 8601 format, ranging from 1 (for Monday) to 7 (for Sunday). */
export const $isoDayOfWeek = "$isoDayOfWeek";

/** Returns the week number in ISO 8601 format, ranging from 1 to 53. Week numbers start at 1 with the week (Monday through Sunday) that contains the year's first Thursday. */
export const $isoWeek = "$isoWeek";

/** Returns the year number in ISO 8601 format. The year starts with the Monday of week 1 (ISO 8601) and ends with the Sunday of the last week (ISO 8601). */
export const $isoWeekYear = "$isoWeekYear";

/** Returns the milliseconds of a date as a number between 0 and 999. */
export const $millisecond = "$millisecond";

/** Returns the minute for a date as a number between 0 and 59. */
export const $minute = "$minute";

/** Returns the month for a date as a number between 1 (January) and 12 (December). */
export const $month = "$month";

/** Returns the seconds for a date as a number between 0 and 60 (leap seconds). */
export const $second = "$second";

/** Converts value to a Date. */
export const $toDate = "$toDate";

/** Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year). */
export const $week = "$week";

/** Returns the year for a date as a number (e.g. 2014). */
export const $year = "$year";

/** The following arithmetic operators can take date operands: */

/** Adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date. */
export const $add = "$add";

/** Returns the result of subtracting the second value from the first. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number. */
export const $subtract = "$subtract";

const DATE_OPERATORS = [
  $dateFromParts,
  $dateFromString,
  $dateToParts,
  $dateToString,
  $dayOfMonth,
  $dayOfWeek,
  $dayOfYear,
  $hour,
  $isoDayOfWeek,
  $isoWeek,
  $isoWeekYear,
  $millisecond,
  $minute,
  $month,
  $second,
  $toDate,
  $week,
  $year,
  $add,
  $subtract
] as const;

export type DateExpressionOperator = typeof DATE_OPERATORS[number];

export const isDateExpressionOperator = (
  val: any
): val is DateExpressionOperator => val in DATE_OPERATORS;

type DateExpressionArgument = Date | string | number;
type UnaryDate<A = DateExpressionArgument> = A;
type BinaryDate<A = DateExpressionArgument> = [A, A];
type RangeDate<A = DateExpressionArgument> = Array<A>;

/** Constructs a BSON Date object given the date's constituent parts. */
export type $dateFromPartsExpression = { [$dateFromParts]: UnaryDate };

/** Converts a date/time string to a date object. */
export type $dateFromStringExpression = { [$dateFromString]: UnaryDate };

/** Returns a document containing the constituent parts of a date. */
export type $dateToPartsExpression = { [$dateToParts]: UnaryDate };

/** Returns the date as a formatted string. */
export type $dateToStringExpression = { [$dateToString]: UnaryDate };

/** Returns the day of the month for a date as a number between 1 and 31. */
export type $dayOfMonthExpression = { [$dayOfMonth]: UnaryDate };

/** Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday). */
export type $dayOfWeekExpression = { [$dayOfWeek]: UnaryDate };

/** Returns the day of the year for a date as a number between 1 and 366 (leap year). */
export type $dayOfYearExpression = { [$dayOfYear]: UnaryDate };

/** Returns the hour for a date as a number between 0 and 23. */
export type $hourExpression = { [$hour]: UnaryDate };

/** Returns the weekday number in ISO 8601 format, ranging from 1 (for Monday) to 7 (for Sunday). */
export type $isoDayOfWeekExpression = { [$isoDayOfWeek]: UnaryDate };

/** Returns the week number in ISO 8601 format, ranging from 1 to 53. Week numbers start at 1 with the week (Monday through Sunday) that contains the year's first Thursday. */
export type $isoWeekExpression = { [$isoWeek]: UnaryDate };

/** Returns the year number in ISO 8601 format. The year starts with the Monday of week 1 (ISO 8601) and ends with the Sunday of the last week (ISO 8601). */
export type $isoWeekYearExpression = { [$isoWeekYear]: UnaryDate };

/** Returns the milliseconds of a date as a number between 0 and 999. */
export type $millisecondExpression = { [$millisecond]: UnaryDate };

/** Returns the minute for a date as a number between 0 and 59. */
export type $minuteExpression = { [$minute]: UnaryDate };

/** Returns the month for a date as a number between 1 (January) and 12 (December). */
export type $monthExpression = { [$month]: UnaryDate };

/** Returns the seconds for a date as a number between 0 and 60 (leap seconds). */
export type $secondExpression = { [$second]: UnaryDate };

/** Converts value to a Date. */
export type $toDateExpression = { [$toDate]: UnaryDate };

/** Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year). */
export type $weekExpression = { [$week]: UnaryDate };

/** Returns the year for a date as a number (e.g. 2014). */
export type $yearExpression = { [$year]: UnaryDate };

/** The following arithmetic operators can take date operands: */

/** Adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date. */
export type $addExpression = { [$add]: UnaryDate };

/** Returns the result of subtracting the second value from the first. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number. */
export type $subtractExpression = { [$subtract]: UnaryDate };

export type DateExpression =
| $dateFromPartsExpression
| $dateFromStringExpression
| $dateToPartsExpression
| $dateToStringExpression
| $dayOfMonthExpression
| $dayOfWeekExpression
| $dayOfYearExpression
| $hourExpression
| $isoDayOfWeekExpression
| $isoWeekExpression
| $isoWeekYearExpression
| $millisecondExpression
| $minuteExpression
| $monthExpression
| $secondExpression
| $toDateExpression
| $weekExpression
| $yearExpression
| $addExpression
| $subtractExpression;
