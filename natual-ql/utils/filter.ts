export const filter = <T>(
  fn: (item: T) => boolean,
  arr: T[],
  skip: true | undefined = undefined
) => {
  if (skip) {
    return []
  }
  return fn ? arr.filter(fn) : arr
}

export const findCaseInsensitive = (map, value, skip: true | undefined = undefined) =>
  (skip ? undefined : map[value.toLowerCase()])

export const findCaseSensitive = (map, value, skip: true | undefined = undefined) => (
  skip ? undefined : map[value])