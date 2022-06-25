/** String Expression Operators
 * 
 * String expressions, with the exception of $concat, only have a well-defined behavior for strings of ASCII characters.
 */

// $concat behavior is well-defined regardless of the characters used.

/** Concatenates any number of strings. */
export const $concat = "$concat";

/** Converts a date/time string to a date object. */
export const $dateFromString = "$dateFromString";

/** Returns the date as a formatted string. */
export const $dateToString = "$dateToString";

/** Searches a string for an occurrence of a substring and returns the UTF-8 byte index of the first occurrence. If the substring is not found, returns -1. */
export const $indexOfBytes = "$indexOfBytes";

/** Searches a string for an occurrence of a substring and returns the UTF-8 code point index of the first occurrence. If the substring is not found, returns -1. */
export const $indexOfCP = "$indexOfCP";

/** Removes whitespace or the specified characters from the beginning of a string. */
export const $ltrim = "$ltrim";

/** Applies a regular expression (regex) to a string and returns information on the first matched substring. */
export const $regexFind = "$regexFind";

/** Applies a regular expression (regex) to a string and returns information on the all matched substrings. */
export const $regexFindAll = "$regexFindAll";

/** Applies a regular expression (regex) to a string and returns a boolean that indicates if a match is found or not. */
export const $regexMatch = "$regexMatch";

/** Replaces the first instance of a matched string in a given input. */
export const $replaceOne = "$replaceOne";

/** Replaces all instances of a matched string in a given input. */
export const $replaceAll = "$replaceAll";

/** Removes whitespace or the specified characters from the end of a string. */
export const $rtrim = "$rtrim";

/** Splits a string into substrings based on a delimiter. Returns an array of substrings. If the delimiter is not found within the string, returns an array containing the original string. */
export const $split = "$split";

/** Returns the number of UTF-8 encoded bytes in a string. */
export const $strLenBytes = "$strLenBytes";

/** Returns the number of UTF-8 code points in a string. */
export const $strLenCP = "$strLenCP";

/** Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second. */
export const $strcasecmp = "$strcasecmp";

/** Deprecated. Use $substrBytes or $substrCP. */
export const $substr = "$substr";

/** Returns the substring of a string. Starts with the character at the specified UTF-8 byte index (zero-based) in the string and continues for the specified number of bytes. */
export const $substrBytes = "$substrBytes";

/** Returns the substring of a string. Starts with the character at the specified UTF-8 code point (CP) index (zero-based) in the string and continues for the number of code points specified. */
export const $substrCP = "$substrCP";

/** Converts a string to lowercase. Accepts a single argument expression. */
export const $toLower = "$toLower";

/** Converts value to a string. */
export const $toString = "$toString";

/** Removes whitespace or the specified characters from the beginning and end of a string. */
export const $trim = "$trim";

/** Converts a string to uppercase. Accepts a single argument expression. */
export const $toUpper = "$toUpper";

const STRING_OPERATORS = [
  $concat,
  $dateFromString,
  $dateToString,
  $indexOfBytes,
  $indexOfCP,
  $ltrim,
  $regexFind,
  $regexFindAll,
  $regexMatch,
  $replaceOne,
  $replaceAll,
  $rtrim,
  $split,
  $strLenBytes,
  $strLenCP,
  $strcasecmp,
  $substr,
  $substrBytes,
  $substrCP,
  $toLower,
  $toString,
  $trim,
  $toUpper
] as const;

export type StringExpressionOperator = typeof STRING_OPERATORS[number];

export const isStringExpressionOperator = (
  val: any
): val is StringExpressionOperator => val in STRING_OPERATORS;

type StringExpressionArgument = string;
type UnaryString<A = StringExpressionArgument> = A;
type BinaryString<A = StringExpressionArgument> = [A, A];
type RangeString<A = StringExpressionArgument> = Array<A>;


/** Concatenates any number of strings. */
export type $concatExpression = { [$concat]: RangeString };

/** Converts a date/time string to a date object. */
export type $dateFromStringExpression = { [$dateFromString]: string };

/** Returns the date as a formatted string. */
export type $dateToStringExpression = { [$dateToString]: Date };

/** Searches a string for an occurrence of a substring and returns the UTF-8 byte index of the first occurrence. If the substring is not found, returns -1. */
export type $indexOfBytesExpression = { [$indexOfBytes]: [string, string] };

/** Searches a string for an occurrence of a substring and returns the UTF-8 code point index of the first occurrence. If the substring is not found, returns -1. */
export type $indexOfCPExpression = { [$indexOfCP]: [string, string] };

/** Removes whitespace or the specified characters from the beginning of a string. */
export type $ltrimExpression = { [$ltrim]: string };

/** Applies a regular expression (regex) to a string and returns information on the first matched substring. */
export type $regexFindExpression = { [$regexFind]: [string, string] };

/** Applies a regular expression (regex) to a string and returns information on the all matched substrings. */
export type $regexFindAllExpression = { [$regexFindAll]: RangeString };

/** Applies a regular expression (regex) to a string and returns a boolean that indicates if a match is found or not. */
export type $regexMatchExpression = { [$regexMatch]: [string, string] };

/** Replaces the first instance of a matched string in a given input. */
export type $replaceOneExpression = { [$replaceOne]: [string, string] };

/** Replaces all instances of a matched string in a given input. */
export type $replaceAllExpression = { [$replaceAll]: [string, string] };

/** Removes whitespace or the specified characters from the end of a string. */
export type $rtrimExpression = { [$rtrim]: string };

/** Splits a string into substrings based on a delimiter. Returns an array of substrings. If the delimiter is not found within the string, returns an array containing the original string. */
export type $splitExpression = { [$split]: [string, string] };

/** Returns the number of UTF-8 encoded bytes in a string. */
export type $strLenBytesExpression = { [$strLenBytes]: string };

/** Returns the number of UTF-8 code points in a string. */
export type $strLenCPExpression = { [$strLenCP]: string };

/** Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second. */
export type $strcasecmpExpression = { [$strcasecmp]: [string, string] };

/** Deprecated. Use $substrBytes or $substrCP. */
export type $substrExpression = { [$substr]: [string, string] };

/** Returns the substring of a string. Starts with the character at the specified UTF-8 byte index (zero-based) in the string and continues for the specified number of bytes. */
export type $substrBytesExpression = { [$substrBytes]: [string, string] };

/** Returns the substring of a string. Starts with the character at the specified UTF-8 code point (CP) index (zero-based) in the string and continues for the number of code points specified. */
export type $substrCPExpression = { [$substrCP]: [string, string] };

/** Converts a string to lowercase. Accepts a single argument expression. */
export type $toLowerExpression = { [$toLower]: string };

/** Converts value to a string. */
export type $toStringExpression = { [$toString]: any };

/** Removes whitespace or the specified characters from the beginning and end of a string. */
export type $trimExpression = { [$trim]: string };

/** Converts a string to uppercase. Accepts a single argument expression. */
export type $toUpperExpression = { [$toUpper]: string };



export type StringExpression =
  | $concatExpression
  | $dateFromStringExpression
  | $dateToStringExpression
  | $indexOfBytesExpression
  | $indexOfCPExpression
  | $ltrimExpression
  | $regexFindExpression
  | $regexFindAllExpression
  | $regexMatchExpression
  | $replaceOneExpression
  | $replaceAllExpression
  | $rtrimExpression
  | $splitExpression
  | $strLenBytesExpression
  | $strLenCPExpression
  | $strcasecmpExpression
  | $substrExpression
  | $substrBytesExpression
  | $substrCPExpression
  | $toLowerExpression
  | $toStringExpression
  | $trimExpression
  | $toUpperExpression;
