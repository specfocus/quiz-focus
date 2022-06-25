import { SyntaxTree } from './SyntaxTree'
import { TagTypeEnum } from './TagTypeEnum'

export const flagName = flag =>
  flag.length === 0 ? '' : `is${flag.charAt(0).toUpperCase()}${flag.slice(1)}`

export const propertyName = property =>
  property.length === 0
    ? ''
    : `getAttr${property.charAt(0).toUpperCase()}${property.slice(1)}`

export class Tag {
  public error: any
  public name: string
  public warning: string
  public tupleTags: any[]

  constructor(
    public syntaxTree: SyntaxTree,
    public tagParent,
    public id,
    public start,
    public end,
    public tagType: number,
  ) {
    this.name = this.syntaxTree.getTextPart(this)
    this.warning = undefined

    const find = this.syntaxTree.getFindFunction(this.tagType)
    this.error =
      this.tagType === TagTypeEnum.OTHER
        ? `Could not parse "${this.name}" here`
        : undefined
    if (find) {
      const found = find(this.name)
      if (found) {
        this.name = found.field
      } else {
        this.error = `Unknown ${TagTypeEnum.enumToString(
          this.tagType,
        ).toLowerCase()} "${this.name}"`
      }
    }
  }

  getId() {
    return this.id
  }

  getStart() {
    return this.start
  }

  getEnd() {
    return this.end
  }

  getName() {
    return this.name
  }

  getType() {
    return this.tagType
  }

  getParent() {
    return this.tagParent
  }

  getNext() {
    let returnTag = false
    for (const tag of this.getParent().iterTags()) {
      if (returnTag) {
        return tag
      }
      if (tag === this) {
        returnTag = true
      }
    }
    return undefined
  }

  getPrevious() {
    let result
    for (const tag of this.getParent().iterTags()) {
      if (tag === this) {
        return result
      }
      result = tag
    }
    return undefined
  }

  hasFlag(flag) {
    return typeof this[flagName(flag)] === 'function'
  }

  getFlags() {
    return Object.keys(this)
      .filter(k => k.startsWith('is') && typeof this[k] === 'function')
      .map(k => k.substring(2))
  }

  hasProperty(property) {
    return typeof this[propertyName(property)] === 'function'
  }

  getProperties() {
    return Object.keys(this)
      .filter(k => k.startsWith('getAttr') && typeof this[k] === 'function')
      .map(k => k.substring(7))
  }

  getEscapedText() {
    const text = this.getText()
    if (
      this.getType() === TagTypeEnum.TEXT &&
      text.length > 0 &&
      (text[0] === '"' || text[0] === "'")
    ) {
      const last = text[text.length - 1]
      return text.length > 1 && last === text[0]
        ? text.substring(1, text.length - 1)
        : text.substring(1)
    }
    return text
  }

  getText() {
    return this.syntaxTree.getTextPart(this)
  }

  toString() {
    const repr: any = {
      id: this.getId(),
      start: this.getStart(),
      end: this.getEnd(),
      name: this.getName(),
      type: TagTypeEnum.enumToString(this.getType()),
      text: this.getText(),
    }

    for (const k of this.getFlags()) {
      repr[k] = this[flagName(k)]()
    }
    for (const k of this.getProperties()) {
      repr[k] = this[propertyName(k)]()
    }
    if (this.warning) {
      repr.warning = this.warning.replace(/"/g, "'")
    }
    if (this.error) {
      repr.error = this.error.replace(/"/g, "'")
    }
    return JSON.stringify(repr).replace(/\\/g, '')
  }
}