import { SyntaxTree } from './SyntaxTree'

export class SubQuery {
  subData: any

  constructor(public syntaxTree: SyntaxTree, public parent: SubQuery) {
    this.subData = [];
  }

  getSubData() {
    return this.subData;
  }

  isSubQuery() {
    return true;
  }

  iterContents() {
    return this.subData.slice(0);
  }

  getParent() {
    return this.parent;
  }
  // TODO: getNext, getPrevious

  getStart(): string {
    return this.subData[0].getStart();
  }

  getEnd(): string {
    return this.subData[this.subData.length - 1].getEnd();
  }

  getText(): string {
    return this.syntaxTree.getTextPart(this);
  }

  toString(): string {
    return JSON.stringify({ subData: this.subData },
      (k, v) => (v && (v.isSubQuery || v.isTuple) ? JSON.parse(v.toString()) : v)
    ).replace(/\\/g, '');
  }
}