import { Schema } from '../schema/Schema'
import { TagTypeEnum } from './TagTypeEnum'
import { SyntaxTreeBuilder } from './SyntaxTreeBuilder'

// TODO: think of a proper error handling, e.g. ignore errors?
const reportError = (message) => console.error(message); // eslint-disable-line no-console

export class SyntaxTree {
  error: any
  data: any[]
  idMap: any
  isBeingBuilt: boolean
  
  constructor(public searchText: string, public database: Schema) {
    this.data = [];
    this.idMap = {};
    this.isBeingBuilt = false;
  }

  _replaceText(self, node, text) {
    return this.searchText.substring(self.getStart(), node.getStart()) +
      text + this.searchText.substring(node.getEnd(), self.getEnd());
  }

  getTextPart(self) {
    return this.searchText.substring(self.getStart(), self.getEnd());
  }

  _collectTuples(query, result) {
    for (const t of query) {
      if (t.isSubQuery) {
        this._collectTuples(t.iterContents(), result);
      } else {
        result.push(t);
      }
    }
  }

  getFindFunction(tagType) {
    let find;
    switch (tagType) {
      case TagTypeEnum.OPERATOR:
        find = (v) => this.database.findUnaryOperator(v);
        break;
      case TagTypeEnum.GROUPNAME:
        find = (v) => this.database.findGroupname(v);
        break;
      case TagTypeEnum.GROUP:
        find = (v) => this.database.findGroup(v);
        break;
      case TagTypeEnum.RANGEOPERATOR:
        find = (v) => this.database.findBinaryOperator(v);
        break;
      case TagTypeEnum.AND1:
        find = (v) => this.database.findLogic(v);
        break;
      case TagTypeEnum.COLUMN:
        find = (v) => this.database.findColumn(v);
        break;
      case TagTypeEnum.JOIN:
        find = (v) => this.database.findJoin(v);
        break;
      case TagTypeEnum.CALCFUNC:
        find = (v) => this.database.findCalculationFunction(v);
        break;
      default:
    }
    return find;
  }

  getData() {
    return this.data;
  }

  getIdMapTag(id) {
    return this.idMap[id];
  }

  setIdMapTag(id, tag) {
    this.idMap[id] = tag;
  }

  getIsBeingBuilt() {
    return this.isBeingBuilt;
  }

  setIsBeingBuilt(isBeingBuilt) {
    this.isBeingBuilt = isBeingBuilt;
  }

  getError() {
    return this.error;
  }

  setError(error) {
    this.error = error;
  }

  replaceText(node, text) {
    if (this.getIsBeingBuilt()) {
      reportError('attempted replaceText() while isBeingBuilt');
      return undefined;
    }

    return this._replaceText(this, node, text);
  }

  getText() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted getText() while isBeingBuilt');
      return undefined;
    }

    return this.searchText;
  }

  getStart() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted getStart() while isBeingBuilt');
      return undefined;
    }

    return 0;
  }

  getEnd() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted getEnd() while isBeingBuilt');
      return undefined;
    }

    return this.searchText.length;
  }

  getTag(id) {
    if (this.getIsBeingBuilt()) {
      reportError('attempted getTag() while isBeingBuilt');
      return undefined;
    }

    return this.getIdMapTag(id);
  }

  iterTuples() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted iterTuples() while isBeingBuilt');
      return [];
    }
    const result = [];
    this._collectTuples(this.data, result);
    return result;
  }

  * iterTags() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted iterTags() while isBeingBuilt');
    } else {
      for (const tuple of this.iterTuples()) {
        for (const tag of tuple.iterTags()) {
          yield tag;
        }
      }
    }
  }

  findFirstTag(predicate) {
    const tags = Array.from(this.iterTags())
    for (const tag of tags) {
      if (typeof predicate !== 'function' || predicate(tag)) {
        return tag;
      }
    }
    return undefined;
  }

  findLastTag(predicate) {
    let result;
    const tags = Array.from(this.iterTags())
    for (const tag of tags) {
      if (typeof predicate !== 'function' || predicate(tag)) {
        result = tag;
      }
    }
    return result;
  }

  getBuilder() {
    if (this.getIsBeingBuilt()) {
      reportError('attempted getBuilder() while isBeingBuilt');
      return undefined;
    }
    return new SyntaxTreeBuilder(this);
  }

  toString() {
    // do not print idMap
    const { searchText, data, isBeingBuilt } = this;
    const repr: any = { searchText, data, isBeingBuilt };
    const error = this.getError();
    if (error) {
      repr.error = error.replace(/"/g, "'");
    }
    return JSON.stringify(repr,
      (k, v) => ((v.iterTags || v.isSubQuery) && v.toString ? JSON.parse(v.toString()) : v)
    ).replace(/\\/g, '');
  }
}