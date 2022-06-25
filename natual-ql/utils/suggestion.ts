export const guessName = (str: string, checker: (str: string) => boolean): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const suggestSpelling = (s) => `Did you mean "${s}"?`
  for (let i = 0; i <= str.length; i++) {
    const prefix = str.substring(0, i)
    const postfix = i === str.length ? '' : str.substring(i + 1)
    const ch = i === str.length ? '' : str.charAt(i)
    const name2 = prefix + postfix
    if (checker(name2)) {
      return suggestSpelling(name2)
    }
    for (const ch1 of letters) {
      if (ch1 !== ch) {
        const name1 = prefix + ch1 + postfix
        if (checker(name1)) {
          return suggestSpelling(name1)
        }
      }
      const name3 = prefix + ch1 + ch + postfix
      if (checker(name3)) {
        return suggestSpelling(name3)
      }
    }
  }
  return undefined
}

export const merge = (suggestions1, suggestions2) => {
  if (!suggestions1) {
    return suggestions2
  }
  if (!suggestions2) {
    return suggestions1
  }
  return { options: suggestions1.options.concat(suggestions2.options) }
}