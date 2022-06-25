import { TagTypeEnum } from '../syntax/TagTypeEnum'
import { Tuple } from '../syntax/Tuple'

export const getTupleOperatorName = (tuple: Tuple): string => {
  const operator = tuple.find(TagTypeEnum.OPERATOR)
  if (operator) {
    return operator.getName()
  }
  const range = tuple.find(TagTypeEnum.RANGEOPERATOR)
  if (range) {
    return range.getName()
  }
  return tuple.find(TagTypeEnum.COLUMN) ||
    tuple.find(TagTypeEnum.GROUP) ||
    tuple.find(TagTypeEnum.GROUPNAME)
    ? '='
    : 'contains'
}

export const getValueTypesOfTag = (tag: any, database) => {
  const operatorName = getTupleOperatorName(tag.getParent())
  const unary = database.findUnaryOperator(operatorName)
  const exact = unary
    ? unary.exactType
    : database.findBinaryOperator(operatorName).exactType

  const result: any[] = []
  if (tag.isNone) {
    return result
  }

  if (tag.isIP) {
    result.push('ip')
    if (!exact) {
      result.push('ip6')
    }
  }

  if (tag.isIP6) {
    result.push('ip6')
  }

  if (tag.isDomain) {
    result.push('domain', 'url')
  }

  if (tag.isUInt) {
    result.push('port') // TODO: 'float' ?
  }

  if (tag.isFloat) {
    result.push('float') // TODO: 'ip', 'ip6' is fits?
  }

  if (tag.isTimestamp) {
    result.push('timestamp')
  }

  if (tag.isMac) {
    result.push('mac')
  }

  return result.length > 1 ? [...Array.from(new Set(result))] : result
}
