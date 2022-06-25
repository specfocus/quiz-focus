import { EnumValue } from './EnumValue'
import { IAlias, IArgumentsMap, IBody, IHead, ISelection } from './types'

export class GraphQuery {
  private head: IHead
  private body: (IBody | GraphQuery)[]
  private isContainer: boolean
  private isWithoutBody: boolean

  constructor(fnName: string | IAlias, argumentsMap: IArgumentsMap = {}) {
    this.head =
      typeof fnName === 'string' ? { fnName: { [fnName]: fnName } } : { fnName }
    this.head.argumentsMap = argumentsMap
    this.body = []
    this.isContainer = false
    this.isWithoutBody = false
  }

  public select(...selects: (string | ISelection | GraphQuery)[]): GraphQuery {
    if (this.isContainer) {
      throw new Error('Can`t use selection on joined query.')
    }

    this.body = this.body.concat(
      selects.map(item => {
        let selection: any = {}

        if (typeof item === 'string') {
          selection.attr = { [item]: item }
          selection.argumentsMap = {}
        } else if (item instanceof GraphQuery) {
          selection = item
        } else if (typeof item === 'object') {
          selection.argumentsMap = <IArgumentsMap>item['_filter'] || {}
          delete item['_filter']
          selection.attr = <IAlias>item
        }

        return selection
      }),
    )
    return this
  }

  public filter(argumentsMap: IArgumentsMap): GraphQuery {
    for (const key in argumentsMap) {
      if (argumentsMap.hasOwnProperty(key)) {
        this.head.argumentsMap[key] = argumentsMap[key]
      }
    }

    return this
  }

  public join(...queries: GraphQuery[]): GraphQuery {
    const combined = new GraphQuery('')
    combined.isContainer = true
    combined.body.push(this)
    combined.body = combined.body.concat(queries)

    return combined
  }

  public withoutBody(): GraphQuery {
    if (this.isContainer) {
      throw new Error('Can`t use withoutBody on joined query.')
    }

    this.isWithoutBody = true
    return this
  }

  public toString() {
    if (this.isContainer) {
      return `{ ${this.buildBody()} }`
    } else if (this.isWithoutBody) {
      return `{ ${this.buildHeader()} }`
    } else {
      return `{ ${this.buildHeader()}{${this.buildBody()}} }`
    }
  }

  private buildHeader(): string {
    return (
      this.buildAlias(this.head.fnName) +
      this.buildArguments(this.head.argumentsMap)
    )
  }

  private buildArguments(argumentsMap: IArgumentsMap): string {
    const query = this.objectToString(argumentsMap)

    return query ? `(${query})` : ''
  }

  private getGraphQLValue(value): string {
    if (Array.isArray(value)) {
      const arrayString = value
        .map(item => {
          return this.getGraphQLValue(item)
        })
        .join()

      return `[${arrayString}]`
    } else if (value instanceof EnumValue) {
      return value.toString()
    } else if ('object' === typeof value) {
      return '{' + this.objectToString(value) + '}'
    } else {
      return JSON.stringify(value)
    }
  }

  private objectToString(obj): string {
    return Object.keys(obj)
      .map(key => `${key}: ${this.getGraphQLValue(obj[key])}`)
      .join(', ')
  }

  private buildAlias(attr: IAlias): string {
    const alias = Object.keys(attr)[0]
    let value = this.prepareAsInnerQuery(attr[alias])

    value = alias !== value ? `${alias}: ${value}` : value
    return value
  }

  private buildBody(): string {
    return this.body
      .map((item: IBody | GraphQuery) => {
        if (item instanceof GraphQuery) {
          return this.prepareAsInnerQuery(item)
        } else {
          return (
            this.buildAlias(item['attr']) +
            this.buildArguments(item['argumentsMap'])
          )
        }
      })
      .join(' ')
  }

  private prepareAsInnerQuery(query: string | GraphQuery): string {
    let ret = ''
    if (query instanceof GraphQuery) {
      ret = query.toString()
      ret = ret.substr(2, ret.length - 4)
    } else {
      ret = query.toString()
    }
    return ret
  }
}
