import { Schema } from '../schema/Schema'
import { isIpAddressInCidr, isMacAddressInCidr } from '../utils/cidr'
import {
  isMacAddress,
  isPortWithinRange,
  isValidIP4,
  isValidIP6,
  isValidTimestamp,
} from '../validators'
import { Tag } from './Tag'
import { TagTypeEnum } from './TagTypeEnum'
import { Tuple } from './Tuple'
import { nonOrderedTypes } from '../enums/net'
import { guessName } from '../utils/suggestion'

export class TagChecker {
  private text: string
  private name: string
  private valueTypes: string[]
  private cefTypes: string[]
  private operatorName: string
  private columnNames: string
  private tuple: Tuple
  private database: Schema
  private tableNames: Set<string>

  constructor(
    public tag: any,
    {
      valueTypes,
      cefTypes,
      operatorName,
      columnNames,
      tuple,
      database,
      tableNames,
    },
  ) {
    this.text = tag.getEscapedText()
    this.name = tag.getName()
    this.valueTypes = valueTypes
    this.cefTypes = cefTypes
    this.operatorName = operatorName
    this.columnNames = columnNames
    this.tuple = tuple
    this.database = database
    this.tableNames = tableNames
  }

  append(message, field) {
    const { tag } = this
    if (tag[field]) {
      tag[field] += `. ${message}`
    } else {
      tag[field] = message
    }
  }

  error(message) {
    this.append(message, 'error')
  }

  warning(message) {
    this.append(message, 'warning')
  }

  guessFormatError(validator, status) {
    if (validator(this.text.trim())) {
      this[status]('Remove quotes')
    }
  }

  checkIPForEquals() {
    const { tag, text } = this
    if (tag.isMac) {
      this.warning('Mac value used for IP column')
    } else if (!tag.isIP && !tag.isIP6 && !tag.isMac) {
      if (tag.isIpCIDR) {
        this.error('CIDR in place of IP address')
      } else {
        if (isValidIP4(text) || isValidIP6(text) || isMacAddress(text)) {
          this.error('Remove quotes')
        }
        this.error('Non-IP value used for IP column')
      }
    } else if (!isValidIP6(text) && !isValidIP4(text) && !isMacAddress(text)) {
      this.error('Invalid IP address')
    }
  }

  checkIpCidr() {
    const { tag, text } = this
    if (!tag.isIpCIDR) {
      this.guessFormatError(ip => isIpAddressInCidr(ip, true), 'error')
      this.error('Non-CIDR value used for IP column')
    } else if (!isIpAddressInCidr(text, true)) {
      this.error('Invalid CIDR notation')
    }
  }

  checkMacForEquals() {
    const { tag, text } = this
    if (!tag.isMac) {
      this.guessFormatError(isMacAddress, 'error')
      this.error('Non-Mac value used for Mac column')
    } else if (!isMacAddress(text)) {
      this.error('Invalid Mac address')
    }
  }

  checkMacCidr() {
    const { tag, text } = this
    if (!tag.isIpCIDR) {
      this.guessFormatError(mac => isMacAddressInCidr(mac, true), 'error')
      this.error('Non-CIDR value used for Mac column')
    } else if (!isMacAddressInCidr(text, true)) {
      this.error('Invalid CIDR notation for Mac address')
    }
  }

  checkTimestampForEquals() {
    const { tag, text } = this
    if (tag.isUInt) {
      return
    }
    if (!tag.isTimestamp) {
      this.error(
        'Date/time is not in epoch time or YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format',
      )
      const check = d =>
        d.match(
          /^\d{4,4}-\d{1,2}-\d{1,2}((\s+|[Tt])\d{1,2}(:\d{1,2})?(:\d{1,2}(\.\d{1,3})?)?)?$/,
        ) && isValidTimestamp(d)
      this.guessFormatError(check, 'error')
    } else if (!isValidTimestamp(text)) {
      this.error('Invalid time/date')
    }
  }

  checkPortForEquals() {
    const { tag, text } = this
    if (!tag.isUInt) {
      this.warning(`Non-port value "${text}" for port field`)
    } else if (!isPortWithinRange(text)) {
      this.warning(`Port number is outside of valid range: ${text}`)
    }
  }

  checkForValueTypes() {
    const { valueTypes, operatorName } = this
    const self = this
    let checkEquals = () => { }
    let checkComparison = () => { }
    const checkContains = () => { }
    let checkSubnet = () => { }
    for (const vt of valueTypes) {
      switch (vt) {
        case 'ip':
        case 'ip6':
          checkEquals = () => self.checkIPForEquals()
          checkSubnet = () => self.checkIpCidr()
          checkComparison = checkEquals
          break
        case 'mac':
          checkEquals = () => self.checkMacForEquals()
          checkSubnet = () => self.checkMacCidr()
          checkComparison = checkEquals
          break
        case 'port':
          checkEquals = () => self.checkPortForEquals()
          checkComparison = checkEquals
          break
        case 'timestamp':
          checkEquals = () => this.checkTimestampForEquals()
          checkComparison = checkEquals
          break
        default:
      }
      switch (operatorName) {
        case '=':
        case '<>':
          checkEquals()
          break
        case '>':
        case '>=':
        case '<':
        case '<=':
        case 'between':
        case 'not between':
          checkComparison()
          break
        case 'contains':
        case 'starts with':
        case 'ends with':
        case 'does not contain':
        case 'does not start with':
        case 'does not end with':
          checkContains()
          break
        case 'in subnet':
        case 'not in subnet':
          checkSubnet()
          break
        default:
      }
    }
  }

  checkForCefTypes() {
    const { text, cefTypes, tag } = this
    const error = (cefType: string, ...args: any[]) =>
      this.error(`Value "${text}" is not of ${cefType} type`)
    for (const cefType of cefTypes) {
      switch (cefType) {
        case 'int':
        case 'long':
          if (
            !tag.isTimestamp &&
            (!text.length || !Number.isSafeInteger(+text))
          ) {
            error(cefType)
          }
          break
        case 'float':
          if (!text.length || Number.isNaN(+text)) {
            error(cefType, 'a')
          }
          break
        case 'string':
        default:
      }
    }
  }

  checkOperator() {
    const { valueTypes, cefTypes, name, database } = this
    const self = this
    const operatorError = vt =>
      self.error(`"${name}" does not work for ${vt}s - try another operator`)
    const checkTypeError = operator => {
      const errorType = cefTypes.find(vt => !operator.cefTypes.includes(vt))
      if (errorType) {
        operatorError(errorType)
      }
    }
    switch (name) {
      case '>':
      case '>=':
      case '<':
      case '<=':
        for (const vt of valueTypes.concat(cefTypes)) {
          if (nonOrderedTypes.includes(vt)) {
            operatorError(vt)
            break
          }
        }
        break
      case 'contains':
      case 'does not contain':
      case 'starts with':
      case 'ends with':
      case 'does not start with':
      case 'does not end with':
      case 'in subnet':
      case 'not in subnet':
        checkTypeError(database.findUnaryOperator(name))
        break
      case 'between':
      case 'not between':
        checkTypeError(database.findBinaryOperator(name))
        break
      default:
    }
  }

  checkGroupname() {
    const { tag, text, database } = this
    if (tag.isInvalid) {
      const message = guessName(text, name1 => database.findGroupname(name1))
      if (message) {
        this.error(message)
      }
    }
  }

  checkText(searchData) {
    const { tag, text, operatorName, columnNames } = this
    if (tag.isNone) {
      switch (operatorName) {
        case '<>':
        case '=':
          break
        default:
          this.warning(
            `Cannot use operator “${operatorName}” for ${text}. ` +
            `Try another operator like “=” or “!=”, or add quotes around “${text}”.`,
          )
      }
    } else {
      if (tag.isTemplate) {
        this.error(
          `Replace the template ${text}` +
          ' with an actual value or use quotes to hide the warning',
        )
      } else if (tag.isReference && columnNames.length === 0) {
        const searchName = text.substring(1)
        if (!searchData.findSearch(searchName)) {
          this.warning(
            'Fix the referenced search name or use quotes to hide the warning',
          )
        }
      }
      this.checkForValueTypes()
      this.checkForCefTypes()
    }
  }

  checkColumn() {
    const { name, text, database, tableNames } = this
    const column = database.findColumn(name)
    if (!column) {
      const message = guessName(text, n => database.findColumn(n))
      if (message) {
        this.error(message)
      }
    } else if (column.tableName && !tableNames.has(column.tableName)) {
      this.error(
        `"${
        column.tableName
        }" must be added with a join in order to use its fields`,
      )
    }
  }

  checkComma() {
    const { tuple } = this
    const joinTag = tuple.find(TagTypeEnum.JOIN)
    // COMMA cannot be part of a JOIN
    if (joinTag) {
      this.error(
        `only single columns are allowed on both sides of "${joinTag.getName()}"`,
      )
    }
  }

  checkJoin() {
    const { tag, name, database } = this
    const previousTag = tag.getPrevious()
    const previousColumn = previousTag
      ? database.findColumn(previousTag.getName())
      : undefined
    const nextTag = tag.getNext()
    const nextColumn = nextTag
      ? database.findColumn(nextTag.getName())
      : undefined
    // if no LHS or LHS or RHS is not a column
    if (
      !previousTag ||
      previousTag.getType() !== TagTypeEnum.COLUMN ||
      (nextTag && nextTag.getType() !== TagTypeEnum.COLUMN)
    ) {
      this.error(
        `"${name}" can only be used in "column ${name} lookup column" syntax`,
      )
      // LHS not a valid column or LHS is not a maintable column (ie, it has tableName field)
    } else if (!previousColumn || previousColumn.tableName) {
      this.error(
        `"${previousTag.getName()}" ` +
        `is not valid for "column ${name} lookup column" syntax`,
      )
      // RHS exists and RHS is not a lookup column (ie, it doest not have tableName field)
    } else if (nextColumn && !nextColumn.tableName) {
      this.error(
        `"${nextTag.getName()}" ` +
        `is not valid lookup column for "column ${name} lookup column" syntax`,
      )
      // LHS and RHS are not of the same value_type
    } else if (
      nextColumn &&
      previousColumn.value_type !== nextColumn.value_type
    ) {
      this.error(
        `"${previousTag.getName()}" ` +
        `and "${nextTag.getName()}" are not of the same type`,
      )
    }
  }

  checkCalcOp() {
    // TODO: validate operands types
  }

  checkCalcFunc() {
    // TODO: validate parameters number and types
  }

  checkAlias() {
    const { tag, database, text } = this
    if (database.findColumn(tag.getName())) {
      this.error(`Cannot redefine an existing column "${text}" as custom`)
    } else if (tag.isInvalid) {
      this.error(`Custom column "${text}" must be simple short identifier`)
    }
  }

  check(searchData) {
    switch (this.tag.getType()) {
      case TagTypeEnum.OPERATOR:
      case TagTypeEnum.RANGEOPERATOR:
        this.checkOperator()
        break
      case TagTypeEnum.GROUPNAME:
        this.checkGroupname()
        break
      case TagTypeEnum.TEXT:
        this.checkText(searchData)
        break
      case TagTypeEnum.COLUMN:
        this.checkColumn()
        break
      case TagTypeEnum.COMMA:
        this.checkComma()
        break
      case TagTypeEnum.JOIN:
        this.checkJoin()
        break
      case TagTypeEnum.CALCOP:
        this.checkCalcOp()
        break
      case TagTypeEnum.CALCFUNC:
        this.checkCalcFunc()
        break
      case TagTypeEnum.ALIAS:
        this.checkAlias()
        break
      default:
    }
  }
}
