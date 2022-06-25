import { TagTypeEnum } from './TagTypeEnum'
import { TagChecker } from './TagChecker';

export class TupleChecker {
  cefTypes: any
  columnNames: any
  database: any
  operatorName: any
  tableNames: any
  tuple: any
  valueTypes: any

  constructor(tuple, database, tableNames) {
    this.database = database
    this.tuple = tuple
    this.tableNames = tableNames

    this.columnNames = tuple.filter(TagTypeEnum.COLUMN).map(column => column.getName())

    const operator = tuple.find(TagTypeEnum.OPERATOR) || tuple.find(TagTypeEnum.RANGEOPERATOR)
    this.operatorName = operator ? operator.getName() : '='

    const valueTypes = []
    const cefTypes = []
    this.database
      .filterColumns(s => this.columnNames.includes(s.field))
      .forEach(s => {
        valueTypes.push(s.value_type)
        cefTypes.push(s.cefType)
      })
    const groupname = tuple.find(TagTypeEnum.GROUPNAME)
    if (groupname) {
      const vt = this.database.findGroupname(groupname.getText())
      if (vt) {
        valueTypes.push(vt.field)
      }
    }
    this.valueTypes = Array.from(new Set(valueTypes))
    this.cefTypes = Array.from(new Set(cefTypes))
  }

  check(searchData) {
    this.tuple.iterTags().forEach((tag) => new TagChecker(tag, this).check(searchData))
  }
}