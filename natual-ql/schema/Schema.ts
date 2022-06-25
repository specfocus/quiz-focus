import { filter, findCaseInsensitive, findCaseSensitive } from '../utils/filter'
import { Operator } from '../types/Operator'
import { createSynonymMap, createOperatorCefTypeMap } from '../utils/operator'

import {
  assignSynonyms,
  binaryOperatorSynonyms,
  calculationFunctionSynonyms,
  calculationOperatorSynonyms,
  commaSynonyms,
  groupSynonyms,
  groupnameSynonyms,
  joinSynonyms,
  logicSynonyms,
  lparenSynonyms,
  rparenSynonyms,
  unaryOperatorSynonyms,
} from '../operators'

type Column = {
  value_type: string
}

type ColumnSynonym = {
  field: any
  values: string[]
}

type Status = { success: boolean; message?: string }

export class Schema {
  private _idColumn: Column
  private _status: Status
  private _timeColumn: Column

  private _idColumnValueType
  private _columnSynonyms: ColumnSynonym[]
  private _columnSynonymsMap
  private _unaryOperatorSynonymsMap
  private _binaryOperatorSynonymsMap
  private _logicSynonymsMap
  private _groupnameSynonymsMap
  private _groupSynonymsMap
  private _joinSynonymsMap
  private _calculationFunctionsMap
  private _operatorSupportedCefTypes

  constructor(superschema: any, private _config) {
    this.initialize(superschema)
  }

  getStatus() {
    return this._status
  }

  initialize(superschema) {
    this._status = { success: true, message: '' }
    let allFields
    if (!superschema || superschema.length === 0) {
      this._status.success = false
      this._status.message += 'No superschema. '
      allFields = []
    } else {
      // TODO: do not access private methods of fieldRef
      allFields = superschema.map(fieldRef => ({
        ...fieldRef._getField(),
        field: fieldRef.getName(),
      }))
    }

    this._timeColumn = allFields.find(cs => cs.isDefaultTimeFilter)
    if (!this._timeColumn) {
      this._status.success = false
      this._status.message += 'Superschema error: no time column specified. '
    }

    this._idColumn = allFields.find(cs => cs.isIdentity)
    if (!this._idColumn) {
      this._status.success = false
      this._status.message +=
        'Superschema error: no identity column specified. '
    }
    this._idColumnValueType = this._idColumn ? this._idColumn.value_type : ''

    this._columnSynonyms = allFields.filter(f => !f.isHidden)
    this._columnSynonymsMap = createSynonymMap(this._columnSynonyms, true)

    this._unaryOperatorSynonymsMap = createSynonymMap(unaryOperatorSynonyms)

    this._binaryOperatorSynonymsMap = createSynonymMap(binaryOperatorSynonyms)

    this._logicSynonymsMap = createSynonymMap(logicSynonyms)

    this._groupnameSynonymsMap = createSynonymMap(groupnameSynonyms)

    this._groupSynonymsMap = createSynonymMap(groupSynonyms)

    this._joinSynonymsMap = createSynonymMap(joinSynonyms)

    this._calculationFunctionsMap = createSynonymMap(
      calculationFunctionSynonyms,
    )

    this._operatorSupportedCefTypes = createOperatorCefTypeMap(
      unaryOperatorSynonyms,
      binaryOperatorSynonyms,
    )

    return this._status
  }

  getTimeColumn() {
    return this._timeColumn
  }

  getIdColumnValueType() {
    return this._idColumnValueType
  }

  getIdColumn() {
    return this._idColumn
  }

  findColumn(value) {
    return findCaseInsensitive(this._columnSynonymsMap, value)
  }

  filterColumns(fn?: (item: ColumnSynonym) => boolean) {
    return filter(fn, this._columnSynonyms)
  }

  findUnaryOperator(value) {
    return findCaseSensitive(this._unaryOperatorSynonymsMap, value)
  }

  filterUnaryOperators(fn?: (item: Operator) => boolean) {
    return filter(fn, unaryOperatorSynonyms)
  }

  findBinaryOperator(value) {
    return findCaseSensitive(this._binaryOperatorSynonymsMap, value)
  }

  filterBinaryOperators(fn?: (item: Operator) => boolean) {
    return filter(fn, binaryOperatorSynonyms)
  }

  findLogic(value) {
    return findCaseSensitive(this._logicSynonymsMap, value)
  }

  filterLogic(fn?: (item: Operator) => boolean) {
    return filter(fn, logicSynonyms)
  }

  findGroupname(value) {
    return findCaseSensitive(
      this._groupnameSynonymsMap,
      value,
      this._config && this._config.skipGroupnames,
    )
  }

  filterGroupnames(fn?: (item: Operator) => boolean) {
    return filter(
      fn,
      groupnameSynonyms,
      this._config && this._config.skipGroupnames,
    )
  }

  findGroup(value) {
    return findCaseSensitive(
      this._groupSynonymsMap,
      value,
      this._config && this._config.skipGroups,
    )
  }

  filterGroups(f?: (item: Operator) => boolean) {
    return filter(f, groupSynonyms, this._config && this._config.skipGroups)
  }

  findJoin(value) {
    return findCaseSensitive(
      this._joinSynonymsMap,
      value,
      this._config && this._config.skipJoins,
    )
  }

  filterJoin(fn?: (item: Operator) => boolean) {
    return filter(fn, joinSynonyms, this._config && this._config.skipJoins)
  }

  findCalculationFunction(value) {
    return findCaseInsensitive(
      this._calculationFunctionsMap,
      value,
      this._config && this._config.skipCalculations,
    )
  }

  filterCalculationFunctions(fn?: (item: Operator) => boolean) {
    return filter(
      fn,
      calculationFunctionSynonyms,
      this._config && this._config.skipCalculations,
    )
  }

  filterCalculationOperators(fn?: (item: Operator) => boolean) {
    return filter(
      fn,
      calculationOperatorSynonyms,
      this._config && this._config.skipCalculations,
    )
  }

  commas() {
    return commaSynonyms
  }

  assigns() {
    return assignSynonyms
  }

  lparens() {
    return lparenSynonyms
  }

  rparens() {
    return rparenSynonyms
  }

  getOperatorCefTypes(op) {
    return this._operatorSupportedCefTypes[op]
  }

  static findSearch(searches, name) {
    return searches.find(
      search => search.name.toLowerCase() === name.toLowerCase(),
    )
  }

  static filterSearches(searches: any[], fn?: (item: any) => boolean) {
    const filtered = fn ? searches.filter(fn) : [...searches]
    const names = new Set()
    return filtered.filter(search => {
      const searchName = search.name.toLowerCase()
      if (names.has(searchName)) return false
      names.add(searchName)
      return true
    })
  }
}
