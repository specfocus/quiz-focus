import { Schema } from '../schema/Schema'

export class SearchData {
  private _searchId
  private _searchName
  private _searches
  private _allowedTables

  constructor(search, searches, presetQueries, allowedTables) {
    this._searchId = search.id
    this._searchName = search.name
    this._searches = Object.values(searches).concat(presetQueries)
    this._allowedTables = allowedTables
  }

  getSearchId() {
    return this._searchId
  }

  getSearchName() {
    return this._searchName
  }

  findSearch(name) {
    return Schema.findSearch(this._searches, name)
  }

  filterSearches(f) {
    return Schema.filterSearches(this._searches, f)
  }

  getAllowedTables() {
    return this._allowedTables
  }
}