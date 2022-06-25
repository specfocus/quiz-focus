import {
  tokenAND,
  tokenASSIGN,
  tokenCALCFUNC,
  tokenCALCOP,
  tokenCOMMA,
  tokenGROUP,
  tokenGROUPNAME,
  tokenJOIN,
  tokenLPAREN,
  tokenOP1,
  tokenOP2,
  tokenOR,
  tokenRPAREN,
} from '../constants/syntax'
import { TRIE_VALUE_INDEX } from '../constants/trie'
import { Schema } from '../schema/Schema'
import { applyToSynonym } from '../utils/operator'
import {
  Context,
  contextCustomCalculation,
  contextDefault,
  contextMatchGroupname,
  contextParseText,
} from './Context'
import { SyntaxTree } from './SyntaxTree'
import { TokenStream } from './TokenStream'

const allContexts = [
  contextDefault,
  contextParseText,
  contextMatchGroupname,
  contextCustomCalculation,
]

function createTokenClasses(schema: Schema) {
  function toTokens(synonyms) {
    const result = []
    for (const synonym of synonyms) {
      applyToSynonym(synonym, ss => result.push(ss))
    }
    return result
  }

  const tokenClasses = []

  tokenClasses[tokenAND] = toTokens(
    schema.filterLogic(synonym => synonym.field === 'and'),
  )
  tokenClasses[tokenOR] = toTokens(
    schema.filterLogic(synonym => synonym.field === 'or'),
  )
  tokenClasses[tokenOP1] = toTokens(schema.filterUnaryOperators())
  tokenClasses[tokenOP2] = toTokens(schema.filterBinaryOperators())
  tokenClasses[tokenCOMMA] = toTokens(schema.commas())
  tokenClasses[tokenGROUP] = toTokens(schema.filterGroups())
  tokenClasses[tokenGROUPNAME] = toTokens(schema.filterGroupnames())
  tokenClasses[tokenLPAREN] = toTokens(schema.lparens())
  tokenClasses[tokenRPAREN] = toTokens(schema.rparens())
  tokenClasses[tokenJOIN] = toTokens(schema.filterJoin())
  tokenClasses[tokenASSIGN] = toTokens(schema.assigns())
  tokenClasses[tokenCALCFUNC] = toTokens(schema.filterCalculationFunctions())
  tokenClasses[tokenCALCOP] = toTokens(schema.filterCalculationOperators())

  return tokenClasses
}

const addToTrie = (tokenClass, tokenType, root) => {
  for (const token of tokenClass) {
    let node = root
    for (let i = 0; i < token.length; i++) {
      const ch = token[i]
      if (!node[ch]) {
        node[ch] = {}
      }
      node = node[ch]
    }
    node[TRIE_VALUE_INDEX] = { type: tokenType, token }
  }
}

export default class RecursiveParser {
  private _valuesSet
  private _database: Schema
  private _contexts
  constructor(database: Schema) {
    this._valuesSet = {}
    this._database = database
    database
      .filterColumns(c => c.values && c.values.length > 0)
      .forEach(s => s.values.forEach(val => (this._valuesSet[val] = s.field)))

    this._contexts = allContexts.map(() => ({}))

    const tokenClasses = createTokenClasses(database)
    for (let i = 0; i < tokenClasses.length; i++) {
      let contextIds
      switch (i) {
        case tokenGROUP:
          contextIds = [contextParseText]
          break
        case tokenGROUPNAME:
          contextIds = [contextMatchGroupname]
          break
        case tokenCALCFUNC:
        case tokenCALCOP:
          contextIds = [contextCustomCalculation]
          break
        default:
          contextIds = allContexts
      }
      for (const contextId of contextIds) {
        addToTrie(tokenClasses[i], i, this._contexts[contextId])
      }
    }
  }

  // parse rules
  parse(input) {
    return new Context(
      this._database,
      new TokenStream(this._contexts, input),
      new SyntaxTree(input, this._database),
      this._valuesSet,
    ).buildTree()
  }
}
