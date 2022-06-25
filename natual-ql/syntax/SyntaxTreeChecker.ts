import { Schema } from '../schema/Schema'
import { SyntaxTree } from './SyntaxTree'
import { TagTypeEnum } from './TagTypeEnum'
import { TupleChecker } from './TupleChecker'

export class SyntaxTreeChecker {
  constructor(
    public database: Schema,
    public syntaxTree: SyntaxTree,
    public searchData: any,
  ) {}

  _iterate(checkTuple) {
    this.syntaxTree.iterTuples().forEach(checkTuple)
  }

  checkTree() {
    const { database, searchData } = this
    const lookupTableNames = new Set(searchData.getAllowedTables())
    this._iterate(tuple => {
      const joinTag = tuple.find(TagTypeEnum.JOIN)
      if (joinTag) {
        tuple
          .filter(TagTypeEnum.COLUMN)
          .map(tag => database.findColumn(tag.getName()))
          .map(column => column && column.tableName)
          .filter(Boolean)
          .forEach(tableName => lookupTableNames.add(tableName))
      }
    })
    this._iterate(tuple =>
      new TupleChecker(tuple, database, lookupTableNames).check(searchData),
    )
  }
}
