import { Schema } from '../schema/Schema'
import { SyntaxTree } from './SyntaxTree'
import RecursiveParser from './RecursiveParser'
import SuggestionsBuilder from '../suggestion/SuggestionsBuilder'
import Generator from '../mosqlGenerator'
import { checkSemantics } from '../utils/semantics'
import { SearchData } from './SearchData'

type AllFieldsGetter = () => string[]
type PresetQueriesGetter = () => string[]

// TODO: pass as argument
const getAllFields: AllFieldsGetter = () => {
  return []
}

// TODO: pass as argument
const getPresetQueries: PresetQueriesGetter = () => {
  return []
}

export class SyntacticTree {
  private _database
  private _presetQueries
  private _limitIndexUse
  private _status
  private _suggestionsBuilder
  private _parser
  private _searchData
  private _tree

  constructor(
    search,
    searches,
    superSchema,
    presets,
    tables,
    configuration,
    notLimitIndexUse,
  ) {
    this._database = new Schema(superSchema || getAllFields(), configuration)
    // TODO: use queryRefs without serialization
    this._presetQueries = (presets || getPresetQueries()).map(queryRef => ({
      name: queryRef.getName(),
      query: queryRef.getQuery(),
      preset: queryRef.isPreset(),
    }))
    this.rebuild(search, searches, superSchema, tables)
    this._limitIndexUse = !notLimitIndexUse // TODO: this is a query performance test
  }

  rebuild(search, searches, superSchema, tables) {
    if (!search || !search.name) {
      const NON_EXISTENT = { id: 'Non-existent', name: 'Non-existent' }
      this._initialize(NON_EXISTENT, searches, superSchema)
    } else if (
      !this._searchData ||
      search.id !== this._searchData.getSearchId() ||
      search.name !== this._searchData.getSearchName()
    ) {
      this._initialize(search, searches, superSchema || getAllFields(), tables)
    }
    return this
  }

  _parseAndCheck(queryText) {
    const t = this._parser.parse(queryText)
    checkSemantics(t, this.getSearchData(), this._database)
    return t
  }

  _initialize(search, searches, superschema, tables = undefined) {
    this._status = this._database.initialize(superschema)
    this._suggestionsBuilder = new SuggestionsBuilder(this._database)
    this._parser = new RecursiveParser(this._database)

    // Do not destroy tree in initialization otherwise completion does not work offline!
    if (!this._tree) this._tree = new SyntaxTree('', this._database)

    const allowedTables = (tables || []).map(tableRef =>
      tableRef.getTableName(),
    )
    this._searchData = new SearchData(
      search,
      searches || {},
      this._presetQueries,
      allowedTables,
    )
    return this._status
  }

  getSearchData() {
    return this._searchData
  }

  parseQuery(queryText) {
    if (queryText) {
      this._tree = this._parseAndCheck(queryText)
    } else {
      this._tree = new SyntaxTree('', this._database)
    }
    return this._tree
  }

  currentTree() {
    return this._tree
  }

  suggestions(tagId, tagOffset) {
    return this._suggestionsBuilder.suggestions(
      this._tree,
      this.getSearchData(),
      tagId,
      tagOffset,
    )
  }

  toMoSQL(startDate, endDate) {
    return Generator.toMoSql(
      this._tree,
      this.getSearchData(),
      q => this._parseAndCheck(q),
      startDate,
      endDate,
      this._database,
      this._limitIndexUse,
    )
  }

  findReference(tag) {
    if (tag.isReference) {
      const ref = tag.getText().substring(1)
      const search = this.getSearchData().findSearch(ref)
      if (search) {
        return { type: 'search', value: search.query, name: search.name }
      }
    }
    return undefined
  }

  // TODO use getStatus in SearchInput to prevent suggestions
  getStatus() {
    return this._status || { success: false }
  }
}
