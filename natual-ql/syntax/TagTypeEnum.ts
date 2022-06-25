// type Enum = { [key: string]: number } | { enumToString: (val: number) => string | undefined }

export const TagTypeEnum = {
  OPERATOR: 1,
  COLUMN: 2,
  TEXT: 3,
  AND1: 4,
  AND2: 5,
  RANGEOPERATOR: 6,
  COMMA: 7,
  ASSIGN: 8,
  GROUP: 9,
  GROUPNAME: 10,
  LPAREN: 11,
  RPAREN: 12,
  JOIN: 13,
  ALIAS: 14,
  CALCOP: 15,
  CALCFUNC: 16,
  LPAREN2: 17,
  RPAREN2: 18,
  OTHER: 0,

  enumToString(val: number): string | undefined {
    for (const [k, v] of Object.entries(this)) {
      if (v === val) {
        return k;
      }
    }
    return undefined;
  }
}