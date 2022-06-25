import { SyntaxTree } from './SyntaxTree'
import { TagTypeEnum } from './TagTypeEnum'

export class Tuple {
  constructor(public syntaxTree: SyntaxTree, public parent, public tupleTags) {}

  isTuple() {
    return true
  }

  getParent() {
    return this.parent
  }

  getStart() {
    return this.tupleTags.length > 0 ? this.tupleTags[0].getStart() : undefined
  }

  getEnd() {
    return this.tupleTags.length > 0
      ? this.tupleTags[this.tupleTags.length - 1].getEnd()
      : undefined
  }

  getText() {
    return this.syntaxTree.getTextPart(this)
  }

  iterTags() {
    return this.tupleTags.slice(0)
  }

  // TODO: is this valid getNext, getPrevious behavior?
  getNext() {
    let previous
    for (const tuple of this.syntaxTree.iterTuples()) {
      if (tuple === this) {
        return previous
      }
      previous = tuple
    }
    return undefined
  }

  getPrevious() {
    let ret = false
    for (const tuple of this.syntaxTree.iterTuples()) {
      if (tuple === this) {
        ret = true
      } else if (ret) {
        return tuple
      }
    }
    return undefined
  }

  find(tagType) {
    return this.tupleTags.find(tag => tag.getType() === tagType)
  }

  filter(tagType) {
    return this.tupleTags.filter(tag => tag.getType() === tagType)
  }

  toString(): string {
    const { tupleTags, syntaxTree: tree } = this
    return JSON.stringify(
      { tupleTags },
      (k, v) =>
        v.getId && v === tree.getIdMapTag(v.getId())
          ? JSON.parse(v.toString())
          : v,
    ).replace(/\\/g, '')
  }
}
