// The next regex should be /\w|\p{L}|\p{N}/ but ECMASript does not have Unicode class
export const isAlphaNum = (ch: string): boolean => /\w/.test(ch)

export const isWS = (ch: string): boolean =>
  ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n'
