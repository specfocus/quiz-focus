export const LOGIC_OPERATOR = {
  $and: 'and',
  $or: 'or'
}

export const GROUP_OPERATOR = {
  $in: 'equals',
  $nin: 'not equal',
  $not: 'not'
}

export const SPECIAL_OPERATOR = {
  $contains: 'contains',
  $startswith: 'starts with',
  $endswith: 'ends with',
  $not_contains: 'does not contains',
  $not_startswith: 'does not starts with',
  $not_endswith: 'does not ends with'
}

export const OPERATOR = {
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $eq: '=',
  $ne: '<>',
  ...SPECIAL_OPERATOR
}

export const UNARY_OPERATOR = { $null: 'null' }

export const BINARY_OPERATOR = { $bin16: true }

export const SUBNET_OPERATOR = {
  $ipCidr: 'in subnet',
  $ipCidrne: 'not in subnet'
}