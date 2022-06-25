import { TokenStream } from './TokenStream'
import { TagTypeEnum } from './TagTypeEnum'
import { Tag } from './Tag'
import { SyntaxTreeBuilder } from './SyntaxTreeBuilder'
import { SyntaxTree } from './SyntaxTree'
import { Schema } from '../schema/Schema'
import {
  tokenERROR,
  tokenEOF,
  tokenTEXT,
  tokenASSIGN,
  tokenAND,
  tokenOR,
  tokenOP1,
  tokenOP2,
  tokenCOMMA,
  tokenGROUP,
  tokenGROUPNAME,
  tokenLPAREN,
  tokenRPAREN,
  tokenJOIN,
  tokenCALCFUNC,
  tokenCALCOP,
} from '../constants/syntax'
import {
  isRelaxedIpForm,
  isRelaxedIp6OrMacForm,
  isMacAddress,
} from '../validators/net'
import { isMacAddressInCidr, isIpAddressInCidr } from '../utils/cidr'

// token contexts declarations
export const contextDefault = 0 // special context
export const contextParseText = 1 // allow recognizing "any"
export const contextMatchGroupname = 2 // match group name after "any"
export const contextCustomCalculation = 3 // extended token set after ":="

// idiosyncratic configuration:
const noneValues = ['NULL', 'Null', 'null']

export class Context {
  private _database: Schema
  private _stream: TokenStream
  private _tree: SyntaxTree
  private _valuesSet: any
  private _builder: SyntaxTreeBuilder
  private _error: any
  private _splitText: boolean
  private _makeColumns: boolean
  private _nonText: boolean
  private _text: boolean
  private _makeValues: any

  constructor(
    database: Schema,
    stream: TokenStream,
    tree: SyntaxTree,
    valuesSet,
  ) {
    this._database = database
    this._stream = stream
    this._tree = tree
    this._valuesSet = valuesSet
    this._builder = this._tree.getBuilder()
  }

  buildTree() {
    this._builder.startBuilding()
    this._parseQuery()
    this._builder.endBuilding()
    return this._tree
  }

  _addParseError(text, unexpected = false) {
    const text2 = unexpected ? 'unexpected' : 'expected'
    const message = `${text} is ${text2} here. Use single or double quotes to escape values`
    this._builder.addError(message)
  }

  _addToken(tag: number, tokenContext = undefined) {
    const token = this._stream.advance(tokenContext)
    this._builder.addElement(token.start, token.end, tag)
    return token
  }

  _parseQuery() {
    this._parseSubQuery(false)
  }

  _parseSubQuery(stopOnRPAREN) {
    let lookahead = this._stream.lookahead()
    if (
      lookahead.type === tokenTEXT ||
      lookahead.type === tokenOP1 ||
      lookahead.type === tokenOP2 ||
      lookahead.type === tokenLPAREN
    ) {
      this._parseExprOrSubQuery()

      lookahead = this._stream.lookahead()
      while (lookahead.type === tokenAND || lookahead.type === tokenOR) {
        this._builder.startTuple()
        this._addToken(TagTypeEnum.AND1)
        this._builder.finishTuple()

        this._parseExprOrSubQuery()

        lookahead = this._stream.lookahead()
      }
    }
    // make sure we do not loose user input
    lookahead = this._stream.lookahead()
    while (
      lookahead.type !== tokenEOF &&
      (!stopOnRPAREN || lookahead.type !== tokenRPAREN)
    ) {
      this._builder.startTuple()
      this._addParseError(`"${lookahead.getText()}"`, true)
      this._addToken(TagTypeEnum.OTHER)
      this._builder.finishTuple()

      lookahead = this._stream.lookahead()
    }
  }

  _parseExprOrSubQuery() {
    const lookahead = this._stream.lookahead()
    switch (lookahead.type) {
      case tokenLPAREN:
        this._builder.startSubQuery()
        this._builder.startTuple()
        this._addToken(TagTypeEnum.LPAREN)
        this._builder.finishTuple()
        this._parseSubQuery(true)
        if (this._stream.lookahead().type === tokenRPAREN) {
          this._builder.startTuple()
          this._addToken(TagTypeEnum.RPAREN)
          this._builder.finishTuple()
        } else {
          this._addParseError('")"')
        }
        this._builder.finishSubQuery()
        break
      case tokenTEXT:
      case tokenOP1:
      case tokenOP2:
        this._parseExpr()
        break
      default:
        this._addParseError('<expression> or "("')
        break
    }
  }

  // when calling this method make sure that lookahead() type is tokenTEXT, tokenOP1 or tokenOP2
  _parseExpr() {
    const lookahead = this._stream.lookahead()
    const restart = () => {
      this._error = false
      this._stream.backtrack(lookahead)
      this._builder.addError() // reset error
      this._builder.startTuple()
    }
    if (lookahead.type === tokenTEXT) {
      this._builder.startTuple()
      this._error = false
      this._parseExprCaseOmitOp()
      if (this._error) {
        restart()
        this._parseExprCaseValueOpColumn()
        if (this._error) {
          restart()
          this._parseExprColumnOpValueOrJoin()
          this._error = false
        }
      }
      this._builder.finishTuple()
    } else if (lookahead.type === tokenOP1) {
      this._builder.startTuple()
      this._addToken(TagTypeEnum.OPERATOR)
      this._parseList()
      this._builder.finishTuple()
    } else if (lookahead.type === tokenOP2) {
      this._builder.startTuple()
      this._addToken(TagTypeEnum.RANGEOPERATOR)
      this._parseText()
      if (this._stream.lookahead().type === tokenAND) {
        this._addToken(TagTypeEnum.AND2)
        this._parseText()
      } else {
        this._addParseError('"and <value>"')
      }
      this._builder.finishTuple()
    }
  }

  // when calling this method make sure that lookahead() type is tokenTEXT
  _parseExprCaseOmitOp() {
    let pos = 2
    while (this._stream.lookahead(pos).type === tokenCOMMA) {
      pos++
      if (this._stream.lookahead(pos).type !== tokenTEXT) {
        this._error = true
        return
      }
      pos++
    }
    switch (this._stream.lookahead(pos).type) {
      case tokenEOF:
      case tokenAND:
      case tokenOR:
      case tokenRPAREN:
        this._splitText = true
        this._makeColumns = true
        this._parseList()
        if (this._makeColumns) this._error = true
        this._makeColumns = false
        this._splitText = false
        break
      default:
        this._error = true
    }
  }

  // when calling this method make sure that lookahead() type is tokenTEXT
  _parseExprCaseValueOpColumn() {
    // expr = value-list (op1 column-list)?
    this._nonText = false
    this._text = false
    this._makeValues = true
    this._parseList()
    this._makeValues = false
    if (this._nonText) {
      this._error = true
    } else {
      const resetError = this._text
      this._text = false
      const lookahead = this._stream.lookahead()
      switch (lookahead.type) {
        case tokenEOF:
        case tokenAND:
        case tokenOR:
        case tokenRPAREN:
          this._error = false
          break
        case tokenOP1:
          this._addToken(TagTypeEnum.OPERATOR)
          if (this._stream.lookahead().type === tokenTEXT) {
            this._makeColumns = true
            this._parseList()
            this._makeColumns = false
            if (this._nonText || (!this._text && resetError))
              this._error = false
            this._nonText = false
          } else {
            this._error = true
          }
          break
        case tokenOP2:
        case tokenTEXT:
        default:
          this._error = true
          break
      }
    }
  }

  _parseExprColumnOpValueOrJoin() {
    // this function lookahead is always tokenTEXT
    // expr = (column-list (op1 value-list | op2 value and value)) | (alias assign custom)
    const oldLookahead = this._stream.lookahead()
    this._makeColumns = true
    this._parseList()
    this._makeColumns = false
    const lookahead = this._stream.lookahead()
    if (lookahead.type === tokenOP1) {
      this._addToken(TagTypeEnum.OPERATOR)
      this._parseList()
    } else if (lookahead.type === tokenOP2) {
      this._addToken(TagTypeEnum.RANGEOPERATOR)
      this._parseText()
      if (this._stream.lookahead().type === tokenAND) {
        this._addToken(TagTypeEnum.AND2)
        this._parseText()
      } else {
        this._addParseError('"and <value>"')
      }
    } else if (lookahead.type === tokenJOIN) {
      this._addToken(TagTypeEnum.JOIN)
      this._makeColumns = true
      this._parseText()
      this._makeColumns = false
    } else if (lookahead.type === tokenASSIGN) {
      this._stream.backtrack(oldLookahead)
      this._builder.startTuple()
      this._parseCustomColumn()
    } else {
      this._addParseError('<operator>')
    }
  }

  _parseList() {
    if (this._stream.lookahead().type === tokenTEXT) {
      this._parseText()
      while (this._stream.lookahead().type === tokenCOMMA) {
        this._addToken(TagTypeEnum.COMMA)
        this._parseText()
      }
    } else {
      this._addParseError('<list>')
    }
  }

  _parseText() {
    let lookahead = this._stream.lookahead(1, contextParseText)
    if (lookahead.type === tokenGROUP) {
      this._nonText = true
      this._parseGroup()
      lookahead = this._stream.lookahead()
      if (
        this._splitText &&
        this._makeColumns &&
        lookahead.type === tokenTEXT
      ) {
        this._makeColumns = false
        this._addToken(TagTypeEnum.TEXT)
        this._addTextFlags(lookahead.getText())
      }
    } else {
      lookahead = this._stream.lookahead()
      if (lookahead.type === tokenTEXT) {
        const text = lookahead.getText()

        if (
          this._splitText &&
          this._database.findColumn(text) === undefined &&
          this._database.findGroupname(text) === undefined &&
          this._tryParseSplitText(text)
        )
          return

        if (
          this._makeColumns &&
          this._database.findColumn(text) === undefined &&
          this._database.findGroupname(text) === undefined
        )
          this._error = true

        if (
          this._makeValues &&
          (this._database.findColumn(text) !== undefined ||
            this._database.findGroupname(text) !== undefined)
        )
          this._error = true

        let tagType
        if (this._makeColumns) {
          tagType = this._database.findGroupname(text)
            ? TagTypeEnum.GROUPNAME
            : TagTypeEnum.COLUMN
        } else {
          tagType = TagTypeEnum.TEXT
        }
        this._addToken(tagType)
        this._addTextFlags(text)
        this._addTableName(text, tagType)
      } else {
        this._addParseError('<value>')
      }
    }
  }

  _addTableName(text, tagType) {
    const column = this._database.findColumn(text)
    if (tagType === TagTypeEnum.COLUMN && column && column.tableName) {
      this._builder.addProperty('tableName', column.tableName)
    }
  }

  _tryParseSplitText(text) {
    if (!this._makeColumns) return false
    for (let i = text.length - 2; i >= 0; i--) {
      const prefix = text.substring(0, i)
      if (
        text.charAt(i) === ' ' &&
        (this._database.findColumn(prefix) ||
          this._database.findGroupname(prefix))
      ) {
        let j = i + 1
        while (j < text.length && text.charAt(j) === ' ') j++
        if (j < text.length) {
          const token = this._stream.advance()
          const tagType = this._database.findColumn(prefix)
            ? TagTypeEnum.COLUMN
            : TagTypeEnum.GROUPNAME
          this._builder.addElement(token.start, token.start + i, tagType)
          this._builder.addElement(token.start + j, token.end, TagTypeEnum.TEXT)
          this._addTextFlags(text.substring(j))
          this._makeColumns = false
          return true
        }
      }
    }
    return false
  }

  // when calling this method make sure that lookahead() type is tokenGROUP
  _parseGroup() {
    this._addToken(TagTypeEnum.GROUP, contextParseText)
    const lookahead = this._stream.lookahead(1, contextMatchGroupname)
    if (lookahead.type === tokenGROUPNAME) {
      this._addToken(TagTypeEnum.GROUPNAME, contextMatchGroupname)
    } else if (lookahead.type === tokenTEXT) {
      this._addToken(TagTypeEnum.GROUPNAME)
      this._builder.addFlag('Invalid')
    }
  }

  _addTextFlags(quotedText) {
    if (noneValues.includes(quotedText)) {
      this._builder.addFlag('None')
    } else {
      switch (quotedText.charAt(0)) {
        case '$':
          if (/\w/.test(quotedText.substring(1))) {
            this._builder.addFlag('Template')
          }
          break
        case '#':
          this._builder.addFlag('Reference')
          break
        default:
      }
    }

    let text = quotedText
    if (text.length > 0) {
      const ch = text.charAt(0)
      if (ch === '"' || ch === "'") {
        if (text.length > 0 && text.charAt(text.length - 1) === ch) {
          text = text.substring(1, text.length - 1)
        } else {
          text = text.substring(1)
        }
      }
    }
    if (this._valuesSet[text] !== undefined) {
      this._builder.addFlag(this._valuesSet[text])
    }
    if (text.includes('*')) {
      this._builder.addFlag('Star')
    }

    if (text.match(/^\d+$/)) {
      this._builder.addFlag('UInt')
      this._text = true
    } else if (text.match(/^[+-]?\d*(\.\d|\d\.)\d*([eE][+-]?\d*)?$/)) {
      this._builder.addFlag('Float')
      this._text = true
    } else if (isMacAddressInCidr(text) || isIpAddressInCidr(text)) {
      // TODO: validate if is using wildcard (*)
      this._builder.addFlag('IpCIDR')
      this._text = true
    } else if (isMacAddress(text)) {
      this._builder.addFlag('Mac')
      this._text = true
    } else if (isRelaxedIpForm(text)) {
      // relaxed IP from
      // /^((0|[1-9]\d?|1\d{2}|2([0-4]\d|5[0-5]))\.){3}(0|[1-9]\d|1\d{2}|2([0-4]\d|5[0-5])}$/
      this._builder.addFlag('IP')
      this._text = true
    } else if (isRelaxedIp6OrMacForm(text)) {
      // if (isMacAddress(text)) //Use this to filter out Mac address that are in ipv6 format,
      // this is not required because the previous IF statement
      this._builder.addFlag('IP6')
      this._text = true
    } else if (text.match(/^([a-z0-9][a-z0-9-]*\.)+[a-z][a-z]+$/i)) {
      this._builder.addFlag('Domain')
    } else if (
      quotedText.match(
        /^\d{4,4}-\d{1,2}-\d*((\s+|[Tt])\d+(:\d+)?(:\d*(\.\d*)?)?)?$/,
      )
    ) {
      // recognize a subset of ISO 8601 dates
      this._builder.addFlag('Timestamp')
      this._text = true
    }
  }

  // when calling this function make sure lookahead is always tokenTEXT
  _parseCustomColumn() {
    const token = this._addToken(TagTypeEnum.ALIAS)
    if (!token.getText().match(/^[0-9A-Z_]+$/i)) {
      this._builder.addFlag('Invalid')
    }
    if (this._stream.lookahead().type === tokenASSIGN) {
      this._addToken(TagTypeEnum.ASSIGN)
      this._parseCalculation()
    } else {
      this._addParseError('":="')
    }
  }

  _parseCalculation() {
    // calculation = unary ( calc_op calculation )*
    this._parseCalculationUnary()
    if (
      this._stream.lookahead(1, contextCustomCalculation).type === tokenCALCOP
    ) {
      this._addToken(TagTypeEnum.CALCOP, contextCustomCalculation)
      this._parseCalculation()
    }
  }

  _parseCalculationUnary() {
    // unary = function | column | ( "(" calculation ")" )
    const lookahead = this._stream.lookahead(1, contextCustomCalculation)
    if (lookahead.type === tokenCALCFUNC) {
      this._parseCalculationFunction()
    } else if (lookahead.type === tokenTEXT) {
      this._addToken(TagTypeEnum.COLUMN, contextCustomCalculation)
    } else if (lookahead.type === tokenLPAREN) {
      this._addToken(TagTypeEnum.LPAREN2, contextCustomCalculation)
      this._parseCalculation()
      if (
        this._stream.lookahead(1, contextCustomCalculation).type === tokenRPAREN
      ) {
        this._addToken(TagTypeEnum.RPAREN2, contextCustomCalculation)
      } else {
        this._addParseError('")"')
      }
    } else {
      this._addParseError('<custom calculation>')
    }
  }

  // when calling this function make sure lookahead === tokenCALCFUNC
  _parseCalculationFunction() {
    // function = calc_func "(" calculation ( "," calculation )* ")"
    this._addToken(TagTypeEnum.CALCFUNC, contextCustomCalculation)
    if (
      this._stream.lookahead(1, contextCustomCalculation).type === tokenLPAREN
    ) {
      this._addToken(TagTypeEnum.LPAREN2, contextCustomCalculation)
      if (
        this._stream.lookahead(1, contextCustomCalculation).type !== tokenRPAREN
      ) {
        this._parseCalculation()
        while (
          this._stream.lookahead(1, contextCustomCalculation).type ===
          tokenCOMMA
        ) {
          this._addToken(TagTypeEnum.COMMA, contextCustomCalculation)
          this._parseCalculation()
        }
      }
      if (
        this._stream.lookahead(1, contextCustomCalculation).type === tokenRPAREN
      ) {
        this._addToken(TagTypeEnum.RPAREN2, contextCustomCalculation)
      } else {
        this._addParseError('")"')
      }
    } else {
      this._addParseError('"("')
    }
  }
}
