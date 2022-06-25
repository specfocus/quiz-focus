import { SyntaxTree } from './SyntaxTree'
import { SubQuery } from './SubQuery'
import { flagName, propertyName, Tag } from './Tag'
import { Tuple } from './Tuple'

// TODO: think of a proper error handling, e.g. ignore errors?
const reportError = (message) => console.error(message); // eslint-disable-line no-console

export class SyntaxTreeBuilder {
  subQueries: (SubQuery | SyntaxTree)[]
  subQueryData: any[]
  idGen: any
  constructedTuple: any
  constructedTupleArray: any
  constructedElement: any
  nextError: any

  constructor(public syntaxTree: SyntaxTree) {
    this.subQueries = [this.syntaxTree]
    this.subQueryData = [this.syntaxTree.getData()]
    this.idGen = 0
    this.constructedTuple = undefined
    this.constructedTupleArray = undefined
    this.constructedElement = undefined
    this.nextError = undefined
  }

  appendNode(node) {
    return this.subQueryData[this.subQueryData.length - 1].push(node)
  }

  parentNode(): any {
    return this.subQueries[this.subQueries.length - 1]
  }

  makeTag(id, start, end, tagType) {
    return new Tag(
      this.syntaxTree,
      this.constructedTuple,
      id,
      start,
      end,
      tagType,
    )
  }

  makeTuple(tupleTags) {
    return new Tuple(this.syntaxTree, this.parentNode(), tupleTags)
  }

  makeSubQuery() {
    return new SubQuery(this.syntaxTree, this.parentNode())
  }

  startBuilding() {
    this.syntaxTree.setIsBeingBuilt(true)
  }

  endBuilding() {
    if (this.nextError) {
      this.syntaxTree.setError(`At the end of the query: ${this.nextError}`)
    }
    this.syntaxTree.setIsBeingBuilt(false)
  }

  startSubQuery() {
    const subQuery = this.makeSubQuery()
    this.appendNode(subQuery)
    this.subQueries.push(subQuery)
    this.subQueryData.push(subQuery.getSubData())
  }

  finishSubQuery() {
    this.subQueries.splice(-1, 1)
    this.subQueryData.splice(-1, 1)
  }

  startTuple() {
    if (!this.syntaxTree.getIsBeingBuilt()) {
      reportError('attempted startTuple() while not isBeingBuilt')
      return
    }

    this.constructedTupleArray = []
    this.constructedTuple = this.makeTuple(this.constructedTupleArray)
    this.constructedElement = undefined
  }

  addElement(start, end, tagType) {
    if (!this.syntaxTree.getIsBeingBuilt()) {
      reportError('attempted addElement() while not isBeingBuilt')
      return
    }

    this.constructedElement = this.makeTag(this.idGen, start, end, tagType)
    if (this.nextError !== undefined) {
      this.constructedElement.error = this.nextError
      this.nextError = undefined
    }
    this.constructedTupleArray.push(this.constructedElement)
    this.idGen++
  }

  addError(message: string | undefined = undefined) {
    this.nextError = message
  }

  addFlag(flag) {
    if (this.constructedElement) {
      this.constructedElement[flagName(flag)] = () => true
    }
  }

  addProperty(attribute, value) {
    if (this.constructedElement) {
      this.constructedElement[propertyName(attribute)] = () => value
    }
  }

  finishTuple() {
    if (!this.syntaxTree.getIsBeingBuilt()) {
      reportError('attempted finishTuple() while not isBeingBuilt')
      return
    }

    if (this.constructedTuple && this.constructedTupleArray.length > 0) {
      this.appendNode(this.constructedTuple)
      for (let i = 0; i < this.constructedTupleArray.length; i++) {
        this.syntaxTree.setIdMapTag(
          this.constructedTupleArray[i].getId(),
          this.constructedTupleArray[i],
        )
      }
    } else {
      reportError('Trying to construct empty tuple')
    }
    this.constructedTuple = undefined
    this.constructedTupleArray = undefined
    this.constructedElement = undefined
  }
}
